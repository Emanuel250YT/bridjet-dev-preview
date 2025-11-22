import { useState, useCallback, type ReactNode } from 'react'
import { 
  useAccount, 
  useSendTransaction, 
  useSwitchChain,
} from 'wagmi'
import { parseEther, type Address } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'

export interface SendPaymentWebPayload {
  recipient: Address
  amount: string
  chainId?: number
  chainName?: string
  currency?: string
  description?: string
  reference?: string
}

export interface SendPaymentWebResponse {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'failed'
  message?: string
  receipt?: any
}

interface SendPaymentWebProps {
  payload: SendPaymentWebPayload
  onSuccess?: (response: SendPaymentWebResponse) => void
  onError?: (error: Error) => void
  autoSwitchChain?: boolean
  children: (props: { 
    send: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: SendPaymentWebResponse | null
    needsChainSwitch: boolean
    switchChain: () => Promise<void>
  }) => ReactNode
}

export function SendPaymentWeb({ 
  payload, 
  onSuccess, 
  onError, 
  autoSwitchChain = true,
  children 
}: SendPaymentWebProps) {
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SendPaymentWebResponse | null>(null)
  
  const { address: walletAddress, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync, isPending: isSendPending } = useSendTransaction()
  
  // Determinar el chain ID objetivo
  const targetChainId = payload.chainId || 
    (payload.chainName ? getChainByName(payload.chainName)?.id : undefined) ||
    currentChainId

  const needsChainSwitch = Boolean(
    targetChainId && 
    currentChainId && 
    targetChainId !== currentChainId
  )

  const switchChain = useCallback(async () => {
    if (!targetChainId) {
      throw new Error('No se especificó red de destino')
    }
    
    if (!isChainSupported(targetChainId)) {
      throw new Error(`La red ${targetChainId} no está soportada`)
    }

    try {
      await switchChainAsync({ chainId: targetChainId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar de red'
      setError(errorMessage)
      throw err
    }
  }, [targetChainId, switchChainAsync])

  const send = useCallback(async () => {
    if (!walletAddress) {
      const err = new Error('No hay wallet conectada')
      setError(err.message)
      onError?.(err)
      return
    }

    setError(null)
    setResponse({ status: 'pending' })

    try {
      // Verificar si necesita cambiar de red
      if (needsChainSwitch) {
        if (autoSwitchChain) {
          await switchChain()
        } else {
          throw new Error('Debe cambiar a la red correcta antes de enviar')
        }
      }

      // Validar red de destino
      if (targetChainId && !isChainSupported(targetChainId)) {
        throw new Error(`Red no soportada: ${targetChainId}`)
      }

      // Parsear el monto
      const value = parseEther(payload.amount)

      // Enviar transacción nativa (ETH, MATIC, CELO, etc.)
      const txHash = await sendTransactionAsync({
        to: payload.recipient,
        value,
        chainId: targetChainId,
      })

      const successResponse: SendPaymentWebResponse = {
        txHash,
        status: 'success',
        message: `Pago enviado exitosamente: ${txHash}`,
      }

      setResponse(successResponse)
      onSuccess?.(successResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar pago'
      const failedResponse: SendPaymentWebResponse = {
        status: 'failed',
        message: errorMessage,
      }
      
      setError(errorMessage)
      setResponse(failedResponse)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [
    walletAddress,
    payload,
    targetChainId,
    needsChainSwitch,
    autoSwitchChain,
    switchChain,
    sendTransactionAsync,
    onSuccess,
    onError,
  ])

  return (
    <>
      {children({ 
        send, 
        isLoading: isSendPending, 
        error, 
        response,
        needsChainSwitch,
        switchChain,
      })}
    </>
  )
}
