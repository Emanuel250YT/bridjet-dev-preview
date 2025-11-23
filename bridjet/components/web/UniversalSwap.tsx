import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useSendTransaction, useSwitchChain, useWriteContract } from 'wagmi'
import { erc20Abi, type Address } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'

export interface UniversalSwapPayload {
  fromToken: Address
  toToken: Address
  amount: string
  fromChainId?: number
  fromChainName?: string
  toChainId?: number
  toChainName?: string
  slippage?: number
  decimals?: number
}

export interface UniversalSwapResponse {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'failed'
  message?: string
  type?: 'same-chain' | 'cross-chain' | 'direct'
}

interface UniversalSwapProps {
  payload: UniversalSwapPayload
  onSuccess?: (response: UniversalSwapResponse) => void
  onError?: (error: Error) => void
  children: (props: { 
    execute: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: UniversalSwapResponse | null
    needsChainSwitch: boolean
    switchChain: () => Promise<void>
  }) => ReactNode
}

export function UniversalSwap({ payload, onSuccess, onError, children }: UniversalSwapProps) {
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<UniversalSwapResponse | null>(null)
  
  const { address, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync, isPending: isSendPending } = useSendTransaction()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  const fromChainId = payload.fromChainId || 
    (payload.fromChainName ? getChainByName(payload.fromChainName)?.id : undefined) ||
    currentChainId

  const toChainId = payload.toChainId || 
    (payload.toChainName ? getChainByName(payload.toChainName)?.id : undefined) ||
    fromChainId

  const isSameChain = fromChainId === toChainId
  const isSameToken = payload.fromToken.toLowerCase() === payload.toToken.toLowerCase()
  const needsChainSwitch = Boolean(fromChainId && currentChainId && fromChainId !== currentChainId)

  const switchChain = useCallback(async () => {
    if (!fromChainId || !isChainSupported(fromChainId)) throw new Error('Chain not supported')
    await switchChainAsync({ chainId: fromChainId })
  }, [fromChainId, switchChainAsync])

  const execute = useCallback(async () => {
    if (!address || !fromChainId) throw new Error('Wallet not connected')

    setError(null)
    setResponse({ status: 'pending' })

    try {
      if (needsChainSwitch) await switchChain()

      let txHash: string
      let type: 'same-chain' | 'cross-chain' | 'direct'

      // Direct transfer (same chain, same token)
      if (isSameChain && isSameToken) {
        type = 'direct'
        const decimals = payload.decimals || 18
        const amount = BigInt(parseFloat(payload.amount) * Math.pow(10, decimals))

        txHash = await writeContractAsync({
          address: payload.fromToken,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [address, amount],
          chainId: fromChainId,
        })
      }
      // Cross-chain swap (different chains)
      else if (!isSameChain) {
        type = 'cross-chain'
        throw new Error('Cross-chain swaps must be handled through the backend API. Use POST /api/wallet/transfer')
      }
      // Same-chain swap (different tokens)
      else {
        type = 'same-chain'
        throw new Error('Same-chain swaps must be handled through the backend API. Use POST /api/wallet/transfer')
      }

      const successResponse: UniversalSwapResponse = {
        txHash,
        status: 'success',
        message: `Transaction completed: ${txHash}`,
        type,
      }

      setResponse(successResponse)
      onSuccess?.(successResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      const failedResponse: UniversalSwapResponse = {
        status: 'failed',
        message: errorMessage,
      }
      
      setError(errorMessage)
      setResponse(failedResponse)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [address, fromChainId, toChainId, isSameChain, isSameToken, needsChainSwitch, payload, switchChain, sendTransactionAsync, writeContractAsync, onSuccess, onError])

  return (
    <>
      {children({ 
        execute, 
        isLoading: isSendPending || isWritePending, 
        error, 
        response,
        needsChainSwitch,
        switchChain,
      })}
    </>
  )
}
