import { useState, useCallback, type ReactNode } from 'react'
import { 
  getBlockchainService,
  type ContractActionPayload,
  type TransactionResponse,
} from '../blockchain-service'

interface SendContractActionProps {
  payload: ContractActionPayload
  onSuccess?: (response: TransactionResponse) => void
  onError?: (error: Error) => void
  children: (props: { 
    send: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: TransactionResponse | null
  }) => ReactNode
}

export function SendContractAction({ payload, onSuccess, onError, children }: SendContractActionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<TransactionResponse | null>(null)

  const send = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getBlockchainService().sendContractAction(payload)
      setResponse(result)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar acción de contrato'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [payload, onSuccess, onError])

  return <>{children({ send, isLoading, error, response })}</>
}
