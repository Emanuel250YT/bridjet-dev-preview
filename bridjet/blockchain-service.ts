import { getBridjetConfig } from './config'

export interface WalletData {
  address: string
  publicKey?: string
  name?: string
  provider?: string
  [key: string]: any
}

export interface ContractActionPayload {
  contractAddress: string
  method: string
  params?: any[]
  value?: string
  gas?: string
  [key: string]: any
}

export interface PaymentPayload {
  recipient: string
  amount: string
  currency?: string
  description?: string
  reference?: string
  [key: string]: any
}

export interface TokenTransferPayload {
  recipient: string
  amount: string
  tokenAddress: string
  tokenSymbol?: string
  decimals?: number
  [key: string]: any
}

export interface CreateWalletPayload {
  name?: string
  type?: string
  backup?: boolean
  [key: string]: any
}

export interface AddWalletPayload {
  address: string
  publicKey?: string
  name?: string
  importMethod?: 'privateKey' | 'mnemonic' | 'keystore'
  data?: string
  [key: string]: any
}

export interface TransactionResponse {
  txHash?: string
  status: 'pending' | 'success' | 'failed'
  message?: string
  [key: string]: any
}

export interface WalletResponse {
  wallet: WalletData
  message?: string
  [key: string]: any
}

class BridjetBlockchainService {
  private getApiConfig(): { baseUrl: string; endpoints: Record<string, string> } {
    const config = getBridjetConfig()
    
    if (!config) {
      throw new Error('Bridjet no está configurado. Llama a setupBridjet() primero.')
    }

    const baseUrl = config.api?.baseUrl || ''
    
    // Endpoints por defecto para operaciones de blockchain
    const apiEndpoints = config.api?.endpoints as Record<string, string> | undefined
    const endpoints = {
      sendContractAction: apiEndpoints?.['sendContractAction'] || '/blockchain/contract/action',
      sendPayment: apiEndpoints?.['sendPayment'] || '/blockchain/payment',
      sendToken: apiEndpoints?.['sendToken'] || '/blockchain/token/transfer',
      createWallet: apiEndpoints?.['createWallet'] || '/wallet/create',
      addWallet: apiEndpoints?.['addWallet'] || '/wallet/add',
      getWallets: apiEndpoints?.['getWallets'] || '/wallet/list',
      getBalance: apiEndpoints?.['getBalance'] || '/wallet/balance',
      getTransactionHistory: apiEndpoints?.['getTransactionHistory'] || '/wallet/transactions',
    }

    return { baseUrl, endpoints }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const config = getBridjetConfig()
    const { baseUrl } = this.getApiConfig()
    const url = `${baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config?.api?.headers || {}),
      ...(options.headers as Record<string, string> || {}),
    }

    // Incluir token si está disponible y se requiere auth
    if (includeAuth && typeof window !== 'undefined') {
      try {
        const storageKey = config?.session?.storageKey || 'bridjet_bearer_token'
        const token = localStorage.getItem(storageKey)
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        console.warn('No se pudo obtener el token:', error)
      }
    }

    const timeout = config?.api?.timeout || 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('La solicitud excedió el tiempo de espera')
        }
        throw err
      }
      throw new Error('Error desconocido en la solicitud')
    }
  }

  public async sendContractAction(payload: ContractActionPayload): Promise<TransactionResponse> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<TransactionResponse>(
      endpoints.sendContractAction,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  public async sendPayment(payload: PaymentPayload): Promise<TransactionResponse> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<TransactionResponse>(
      endpoints.sendPayment,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  public async sendTokens(payload: TokenTransferPayload): Promise<TransactionResponse> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<TransactionResponse>(
      endpoints.sendToken,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  public async createWallet(payload: CreateWalletPayload = {}): Promise<WalletResponse> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<WalletResponse>(
      endpoints.createWallet,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  public async addWallet(payload: AddWalletPayload): Promise<WalletResponse> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<WalletResponse>(
      endpoints.addWallet,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  public async getWallets(): Promise<{ wallets: WalletData[] }> {
    const { endpoints } = this.getApiConfig()
    
    return this.makeRequest<{ wallets: WalletData[] }>(
      endpoints.getWallets,
      {
        method: 'GET',
      }
    )
  }

  public async getBalance(address: string, tokenAddress?: string): Promise<{ balance: string; symbol?: string }> {
    const { endpoints } = this.getApiConfig()
    
    const queryParams = new URLSearchParams({ address })
    if (tokenAddress) {
      queryParams.append('tokenAddress', tokenAddress)
    }
    
    return this.makeRequest<{ balance: string; symbol?: string }>(
      `${endpoints.getBalance}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    )
  }

  public async getTransactionHistory(
    address: string, 
    options?: { limit?: number; offset?: number; tokenAddress?: string }
  ): Promise<{ transactions: any[] }> {
    const { endpoints } = this.getApiConfig()
    
    const queryParams = new URLSearchParams({ address })
    if (options?.limit) queryParams.append('limit', options.limit.toString())
    if (options?.offset) queryParams.append('offset', options.offset.toString())
    if (options?.tokenAddress) queryParams.append('tokenAddress', options.tokenAddress)
    
    return this.makeRequest<{ transactions: any[] }>(
      `${endpoints.getTransactionHistory}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    )
  }

  // Método genérico para requests personalizados
  public async customRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, options, includeAuth)
  }
}

// Singleton instance
let blockchainServiceInstance: BridjetBlockchainService | null = null

export function getBlockchainService(): BridjetBlockchainService {
  if (!blockchainServiceInstance) {
    blockchainServiceInstance = new BridjetBlockchainService()
  }
  return blockchainServiceInstance
}

// Funciones de conveniencia para usar directamente
export const blockchainService = {
  sendContractAction: (payload: ContractActionPayload) => getBlockchainService().sendContractAction(payload),
  sendPayment: (payload: PaymentPayload) => getBlockchainService().sendPayment(payload),
  sendTokens: (payload: TokenTransferPayload) => getBlockchainService().sendTokens(payload),
  createWallet: (payload?: CreateWalletPayload) => getBlockchainService().createWallet(payload),
  addWallet: (payload: AddWalletPayload) => getBlockchainService().addWallet(payload),
  getWallets: () => getBlockchainService().getWallets(),
  getBalance: (address: string, tokenAddress?: string) => getBlockchainService().getBalance(address, tokenAddress),
  getTransactionHistory: (address: string, options?: { limit?: number; offset?: number; tokenAddress?: string }) => 
    getBlockchainService().getTransactionHistory(address, options),
  customRequest: <T>(endpoint: string, options?: RequestInit, includeAuth?: boolean) => 
    getBlockchainService().customRequest<T>(endpoint, options, includeAuth),
}

export default blockchainService
