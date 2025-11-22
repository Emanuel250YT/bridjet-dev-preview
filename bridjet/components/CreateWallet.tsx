import { useState, useCallback, type ReactNode } from 'react'
import { 
  getBlockchainService,
  type CreateWalletPayload,
  type WalletResponse,
  type WalletData,
} from '../blockchain-service'

interface CreateWalletProps {
  payload?: CreateWalletPayload
  onSuccess?: (response: WalletResponse) => void
  onError?: (error: Error) => void
  children: (props: { 
    create: () => Promise<void>
    isLoading: boolean
    error: string | null
    wallet: WalletData | null
  }) => ReactNode
}

export function CreateWallet({ payload, onSuccess, onError, children }: CreateWalletProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)

  const create = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getBlockchainService().createWallet(payload)
      setWallet(result.wallet)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear wallet'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [payload, onSuccess, onError])

  return <>{children({ create, isLoading, error, wallet })}</>
}
