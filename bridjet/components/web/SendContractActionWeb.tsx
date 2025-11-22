import { useState, useCallback, type ReactNode } from 'react'
import { 
  useAccount, 
  useWriteContract, 
  useSwitchChain,
} from 'wagmi'
import { parseEther, type Address, type Abi } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'

export interface SendContractActionWebPayload {
  contractAddress: Address
  abi: Abi
  functionName: string
  args?: any[]
  value?: string
  chainId?: number
  chainName?: string
  gas?: string
}

export interface SendContractActionWebResponse {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'failed'
  message?: string
  receipt?: any
}

interface SendContractActionWebProps {
  payload: SendContractActionWebPayload
  onSuccess?: (response: SendContractActionWebResponse) => void
  onError?: (error: Error) => void
  autoSwitchChain?: boolean
  children: (props: { 
    send: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: SendContractActionWebResponse | null
    needsChainSwitch: boolean
    switchChain: () => Promise<void>
  }) => ReactNode
}

export function SendContractActionWeb({ 
  payload, 
  onSuccess, 
  onError, 
  autoSwitchChain = true,
  children 
}: SendContractActionWebProps) {
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SendContractActionWebResponse | null>(null)
  
  const { address: walletAddress, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()
  
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

      // Parsear el valor si existe
      const value = payload.value ? parseEther(payload.value) : undefined

      // Ejecutar la función del contrato
      const txHash = await writeContractAsync({
        address: payload.contractAddress,
        abi: payload.abi,
        functionName: payload.functionName,
        args: payload.args || [],
        value,
        chainId: targetChainId,
        gas: payload.gas ? BigInt(payload.gas) : undefined,
      })

      const successResponse: SendContractActionWebResponse = {
        txHash,
        status: 'success',
        message: `Transacción enviada exitosamente: ${txHash}`,
      }

      setResponse(successResponse)
      onSuccess?.(successResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar acción del contrato'
      const failedResponse: SendContractActionWebResponse = {
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
    writeContractAsync,
    onSuccess,
    onError,
  ])

  return (
    <>
      {children({ 
        send, 
        isLoading: isWritePending, 
        error, 
        response,
        needsChainSwitch,
        switchChain,
      })}
    </>
  )
}
