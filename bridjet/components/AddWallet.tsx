import { useState, useCallback, type ReactNode } from 'react'
import { 
  getBlockchainService,
  type AddWalletPayload,
  type WalletResponse,
  type WalletData,
} from '../blockchain-service'

interface AddWalletProps {
  payload: AddWalletPayload
  onSuccess?: (response: WalletResponse) => void
  onError?: (error: Error) => void
  children: (props: { 
    add: () => Promise<void>
    isLoading: boolean
    error: string | null
    wallet: WalletData | null
  }) => ReactNode
}

export function AddWallet({ payload, onSuccess, onError, children }: AddWalletProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)

  const add = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getBlockchainService().addWallet(payload)
      setWallet(result.wallet)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar wallet'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [payload, onSuccess, onError])

  return <>{children({ add, isLoading, error, wallet })}</>
}
