import { useState, useCallback, type ReactNode } from 'react'
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi'
import { type Address } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'

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
  
  const { address: walletAddress, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { isPending } = useSendTransaction()

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
      throw new Error('Quotes must be fetched through the backend API')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting quote')
    }
  }, [walletAddress, targetChainId])

  const swap = useCallback(async () => {
    if (!walletAddress || !targetChainId) throw new Error('Wallet not connected')

    setError(null)
    setResponse({ status: 'pending' })

    try {
      if (needsChainSwitch && autoSwitchChain) await switchChain()

      throw new Error('Swaps must be handled through the backend API. Use POST /api/wallet/transfer')
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
  }, [walletAddress, targetChainId, needsChainSwitch, autoSwitchChain, switchChain, onSuccess, onError])

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
        quote: null,
      })}
    </>
  )
}
