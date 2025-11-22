import { useState, useCallback } from 'react'
import { 
  getBlockchainService,
  type ContractActionPayload,
  type PaymentPayload,
  type TokenTransferPayload,
  type CreateWalletPayload,
  type AddWalletPayload,
  type TransactionResponse,
  type WalletResponse,
  type WalletData,
} from './blockchain-service'

// Hook para operaciones de blockchain
export function useBridjetBlockchain() {
  const blockchainService = getBlockchainService()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendContractAction = useCallback(async (payload: ContractActionPayload): Promise<TransactionResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.sendContractAction(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar acción de contrato'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const sendPayment = useCallback(async (payload: PaymentPayload): Promise<TransactionResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.sendPayment(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar pago'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const sendTokens = useCallback(async (payload: TokenTransferPayload): Promise<TransactionResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.sendTokens(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar tokens'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const createWallet = useCallback(async (payload?: CreateWalletPayload): Promise<WalletResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.createWallet(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear wallet'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const addWallet = useCallback(async (payload: AddWalletPayload): Promise<WalletResponse | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.addWallet(payload)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar wallet'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const getWallets = useCallback(async (): Promise<WalletData[] | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.getWallets()
      return result.wallets
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener wallets'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const getBalance = useCallback(async (address: string, tokenAddress?: string): Promise<{ balance: string; symbol?: string } | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.getBalance(address, tokenAddress)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener balance'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  const getTransactionHistory = useCallback(async (
    address: string, 
    options?: { limit?: number; offset?: number; tokenAddress?: string }
  ): Promise<any[] | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockchainService.getTransactionHistory(address, options)
      return result.transactions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener historial de transacciones'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [blockchainService])

  return {
    isLoading,
    error,
    clearError,
    sendContractAction,
    sendPayment,
    sendTokens,
    createWallet,
    addWallet,
    getWallets,
    getBalance,
    getTransactionHistory,
  }
}
