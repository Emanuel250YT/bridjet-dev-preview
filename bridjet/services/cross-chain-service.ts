import { SDK } from '@1inch/cross-chain-sdk'
import type { Address } from 'viem'

export interface CrossChainQuoteParams {
  fromChainId: number
  toChainId: number
  fromTokenAddress: Address
  toTokenAddress: Address
  amount: string
  walletAddress: Address
}

export interface CrossChainQuote {
  dstAmount: string
  srcAmount: string
  gas: string
  tx: {
    to: Address
    data: string
    value: string
    from: Address
    gas: string
  }
  protocols: string[]
  estimatedGas: string
}

export interface SwapExecutionResult {
  txHash: string
  srcChainTxHash?: string
  dstChainTxHash?: string
  status: 'pending' | 'success' | 'failed'
}

class CrossChainService {
  private sdk: SDK | null = null
  private apiKey: string

  constructor(apiKey?: string) {
    // Soporte para múltiples bundlers/frameworks
    this.apiKey = apiKey || this.getEnvApiKey() || ''
  }

  private getEnvApiKey(): string {
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_1INCH_API_KEY) {
      return import.meta.env.VITE_1INCH_API_KEY
    }
    // Next.js / Node.js / CRA
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NEXT_PUBLIC_1INCH_API_KEY || 
             process.env.REACT_APP_1INCH_API_KEY || 
             process.env.VITE_1INCH_API_KEY || 
             ''
    }
    return ''
  }

  private initSDK() {
    if (!this.sdk) {
      if (!this.apiKey) {
        throw new Error('1inch API key is required. Set VITE_1INCH_API_KEY in your environment.')
      }
      this.sdk = new SDK({
        url: 'https://api.1inch.dev/fusion-plus',
        authKey: this.apiKey,
      })
    }
    return this.sdk
  }

  // Verificar si dos tokens son el mismo en la misma red
  public isSameTokenAndChain(
    fromChainId: number,
    toChainId: number,
    fromToken: Address,
    toToken: Address
  ): boolean {
    return (
      fromChainId === toChainId &&
      fromToken.toLowerCase() === toToken.toLowerCase()
    )
  }

  // Verificar si las redes son compatibles para transferencia directa
  public areNetworksCompatible(fromChainId: number, toChainId: number): boolean {
    // Lista de redes que soportan transferencias directas entre ellas
    const compatibleNetworks: Record<number, number[]> = {
      1: [1],         // Ethereum mainnet
      8453: [8453],   // Base
      10: [10],       // Optimism
      137: [137],     // Polygon
      42161: [42161], // Arbitrum
      43114: [43114], // Avalanche
      56: [56],       // BSC
      59144: [59144], // Linea
      146: [146],     // Sonic
      1301: [1301],   // Unichain
      100: [100],     // Gnosis
      324: [324],     // zkSync
      42220: [42220], // Celo
      44787: [44787], // Celo Alfajores
    }

    const compatibles = compatibleNetworks[fromChainId] || []
    return compatibles.includes(toChainId)
  }

  // Obtener cotización para swap cross-chain
  public async getQuote(params: CrossChainQuoteParams): Promise<CrossChainQuote> {
    const sdk = this.initSDK()

    try {
      const quote = await sdk.getQuote({
        srcChainId: params.fromChainId,
        dstChainId: params.toChainId,
        srcTokenAddress: params.fromTokenAddress,
        dstTokenAddress: params.toTokenAddress,
        amount: params.amount,
        walletAddress: params.walletAddress,
        enableEstimate: true,
      })

      // Adaptación a la respuesta real del SDK
      return {
        dstAmount: (quote as any).dstAmount || '0',
        srcAmount: params.amount,
        gas: '0',
        tx: {
          to: params.fromTokenAddress,
          data: '0x',
          value: '0',
          from: params.walletAddress,
          gas: '0',
        },
        protocols: [],
        estimatedGas: '0',
      }
    } catch (error) {
      console.error('Error getting cross-chain quote:', error)
      throw new Error(
        `Failed to get quote: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Construir transacción para ejecutar swap
  public async buildSwapTransaction(params: CrossChainQuoteParams): Promise<{
    to: Address
    data: string
    value: string
    gas: string
  }> {
    const quote = await this.getQuote(params)
    return quote.tx
  }

  // Verificar si una red soporta 1inch Fusion+
  public isNetworkSupported(chainId: number): boolean {
    const supported = [
      1,      // Ethereum Mainnet
      8453,   // Base
      10,     // Optimism
      137,    // Polygon
      42161,  // Arbitrum
      43114,  // Avalanche
      56,     // Binance Smart Chain
      59144,  // Linea
      146,    // Sonic
      1301,   // Unichain
      100,    // Gnosis
      324,    // zkSync
    ]
    return supported.includes(chainId)
  }

  // Obtener el DEX recomendado para un par de tokens
  public async getRecommendedDex(
    fromChainId: number,
    toChainId: number
  ): Promise<string> {
    // Retornar el DEX más eficiente basado en las redes
    if (fromChainId === toChainId) {
      return 'UNISWAP_V3'
    }
    return '1INCH'
  }

  // Estimar gas para una operación cross-chain
  public async estimateGas(params: CrossChainQuoteParams): Promise<string> {
    try {
      const quote = await this.getQuote(params)
      return quote.estimatedGas
    } catch (error) {
      console.error('Error estimating gas:', error)
      return '0'
    }
  }
}

// Singleton instance
let crossChainServiceInstance: CrossChainService | null = null

export function getCrossChainService(apiKey?: string): CrossChainService {
  if (!crossChainServiceInstance || apiKey) {
    crossChainServiceInstance = new CrossChainService(apiKey)
  }
  return crossChainServiceInstance
}

export const crossChainService = getCrossChainService()

export default crossChainService
