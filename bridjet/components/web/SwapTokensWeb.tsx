import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi'
import { type Address } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'
import { getSwapService } from '../../services/swap-service'

export interface SwapTokensWebPayload {
  fromToken: Address
  toToken: Address
  amount: string
  slippage?: number
  chainId?: number
  chainName?: string
}

export interface SwapTokensWebResponse {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'failed'
  message?: string
  quote?: any
}

interface SwapTokensWebProps {
  payload: SwapTokensWebPayload
  onSuccess?: (response: SwapTokensWebResponse) => void
  onError?: (error: Error) => void
  autoSwitchChain?: boolean
  children: (props: { 
    swap: () => Promise<void>
    getQuote: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: SwapTokensWebResponse | null
    needsChainSwitch: boolean
    switchChain: () => Promise<void>
    quote: any
  }) => ReactNode
}

export function SwapTokensWeb({ 
  payload, 
  onSuccess, 
  onError, 
  autoSwitchChain = true,
  children 
}: SwapTokensWebProps) {
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SwapTokensWebResponse | null>(null)
  const [quote, setQuote] = useState<any>(null)
  
  const { address: walletAddress, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync, isPending } = useSendTransaction()
  
  const swapService = getSwapService()

  const targetChainId = payload.chainId || 
    (payload.chainName ? getChainByName(payload.chainName)?.id : undefined) ||
    currentChainId

  const needsChainSwitch = Boolean(
    targetChainId && 
    currentChainId && 
    targetChainId !== currentChainId
  )

  const switchChain = useCallback(async () => {
    if (!targetChainId) throw new Error('No target chain')
    if (!isChainSupported(targetChainId)) throw new Error(`Chain ${targetChainId} not supported`)
    await switchChainAsync({ chainId: targetChainId })
  }, [targetChainId, switchChainAsync])

  const getQuote = useCallback(async () => {
    if (!walletAddress || !targetChainId) return
    
    try {
      const quoteResult = await swapService.getQuote({
        chainId: targetChainId,
        src: payload.fromToken,
        dst: payload.toToken,
        amount: payload.amount,
        from: walletAddress,
        slippage: payload.slippage || 1,
      })
      setQuote(quoteResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting quote')
    }
  }, [walletAddress, targetChainId, payload, swapService])

  const swap = useCallback(async () => {
    if (!walletAddress || !targetChainId) throw new Error('Wallet not connected')

    setError(null)
    setResponse({ status: 'pending' })

    try {
      if (needsChainSwitch && autoSwitchChain) await switchChain()

      const swapTx = await swapService.getSwapTransaction({
        chainId: targetChainId,
        src: payload.fromToken,
        dst: payload.toToken,
        amount: payload.amount,
        from: walletAddress,
        slippage: payload.slippage || 1,
      })

      const txHash = await sendTransactionAsync({
        to: swapTx.to,
        data: swapTx.data as `0x${string}`,
        value: BigInt(swapTx.value),
        chainId: targetChainId,
      })

      const successResponse: SwapTokensWebResponse = {
        txHash,
        status: 'success',
        message: `Swap completed: ${txHash}`,
        quote,
      }

      setResponse(successResponse)
      onSuccess?.(successResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Swap failed'
      const failedResponse: SwapTokensWebResponse = {
        status: 'failed',
        message: errorMessage,
      }
      
      setError(errorMessage)
      setResponse(failedResponse)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [walletAddress, targetChainId, payload, needsChainSwitch, autoSwitchChain, switchChain, swapService, sendTransactionAsync, quote, onSuccess, onError])

  return (
    <>
      {children({ 
        swap, 
        getQuote,
        isLoading: isPending, 
        error, 
        response,
        needsChainSwitch,
        switchChain,
        quote,
      })}
    </>
  )
}
