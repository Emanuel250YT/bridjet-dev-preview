import type { Address } from 'viem'

export interface SwapQuoteParams {
  chainId: number
  src: Address
  dst: Address
  amount: string
  from: Address
  slippage?: number
}

export interface SwapQuote {
  toAmount: string
  fromAmount: string
  estimatedGas: number
}

export interface SwapTransaction {
  from: Address
  to: Address
  data: string
  value: string
  gas: number
}

class SwapService {
  private apiKey: string
  private baseUrl = 'https://api.1inch.dev/swap/v6.1'

  constructor(apiKey?: string) {
    // API key es opcional - el backend puede proveerla
    this.apiKey = apiKey || this.getEnvApiKey() || ''
  }

  private getEnvApiKey(): string {
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_1INCH_API_KEY) {
      return import.meta.env.VITE_1INCH_API_KEY
    }
    // Next.js / Node.js / CRA
    if (typeof process !== 'undefined' && process.env) {
      return process.env.VITE_1INCH_API_KEY || 
             process.env.NEXT_PUBLIC_1INCH_API_KEY || 
             process.env.REACT_APP_1INCH_API_KEY || 
             ''
    }
    return ''
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('1inch API key not configured. Set VITE_1INCH_API_KEY in your environment or provide it in constructor.')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'accept': 'application/json',
      },
    })

    if (!response.ok) throw new Error(`1inch API error: ${response.status}`)
    return response.json()
  }

  public async getQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    return this.makeRequest<SwapQuote>(`/${params.chainId}/quote`, {
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.from,
      slippage: (params.slippage || 1).toString(),
    })
  }

  public async getSwapTransaction(params: SwapQuoteParams): Promise<SwapTransaction> {
    return this.makeRequest<SwapTransaction>(`/${params.chainId}/swap`, {
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.from,
      slippage: (params.slippage || 1).toString(),
    })
  }

  public isNetworkSupported(chainId: number): boolean {
    return [1, 56, 137, 10, 42161, 43114, 100, 8453, 324, 42220].includes(chainId)
  }
}

let swapServiceInstance: SwapService | null = null

export function getSwapService(apiKey?: string): SwapService {
  if (!swapServiceInstance || apiKey) {
    swapServiceInstance = new SwapService(apiKey)
  }
  return swapServiceInstance
}

export default SwapService
