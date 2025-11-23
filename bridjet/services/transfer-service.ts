import type { Address } from 'viem'

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address

export interface TransferParams {
  from: Address
  to: Address
  amount: string
  fromChainId: number
  toChainId: number
  fromToken: Address
  toToken: Address
  slippage?: number
}

export interface TransferResponse {
  type: 'native' | 'swap' | 'bridge'
  chainId: number
  needsApproval?: boolean
  approval?: {
    to: Address
    data: string
    value: string
  }
  transaction: {
    to: Address
    data: string
    value: string
    from: Address
  }
  estimatedGas?: string
  quote?: any
}

class TransferService {
  // Normalizar address ETH nativo
  private normalizeTokenAddress(address: Address): Address {
    const normalized = address.toLowerCase()
    if (normalized === ETH_ADDRESS.toLowerCase() || 
        normalized === '0x0000000000000000000000000000000000000000') {
      return ETH_ADDRESS
    }
    return address
  }

  // Verificar si es token nativo (ETH)
  private isNativeToken(address: Address): boolean {
    const normalized = this.normalizeTokenAddress(address)
    return normalized === ETH_ADDRESS
  }

  // Verificar si es una transferencia nativa (mismo token, misma red)
  private isNativeTransfer(params: TransferParams): boolean {
    return (
      params.fromChainId === params.toChainId &&
      this.normalizeTokenAddress(params.fromToken) === this.normalizeTokenAddress(params.toToken)
    )
  }

  // Verificar si es un swap (misma red, diferentes tokens)
  private isSwap(params: TransferParams): boolean {
    return (
      params.fromChainId === params.toChainId &&
      this.normalizeTokenAddress(params.fromToken) !== this.normalizeTokenAddress(params.toToken)
    )
  }

  // Verificar si es bridge (diferentes redes)
  private isBridge(params: TransferParams): boolean {
    return params.fromChainId !== params.toChainId
  }

  // Construir transacción de transferencia nativa
  private async buildNativeTransfer(params: TransferParams): Promise<TransferResponse> {
    const fromToken = this.normalizeTokenAddress(params.fromToken)
    const isETH = this.isNativeToken(fromToken)

    // Transferencia de ETH nativo
    if (isETH) {
      return {
        type: 'native',
        chainId: params.fromChainId,
        needsApproval: false,
        transaction: {
          to: params.to,
          data: '0x',
          value: params.amount,
          from: params.from,
        },
        estimatedGas: '21000',
      }
    }

    // Transferencia de ERC20
    // ABI de transfer(address,uint256)
    const transferSelector = '0xa9059cbb'
    const paddedTo = params.to.slice(2).padStart(64, '0')
    const paddedAmount = BigInt(params.amount).toString(16).padStart(64, '0')
    const data = `${transferSelector}${paddedTo}${paddedAmount}` as `0x${string}`

    return {
      type: 'native',
      chainId: params.fromChainId,
      needsApproval: false,
      transaction: {
        to: fromToken,
        data,
        value: '0',
        from: params.from,
      },
      estimatedGas: '65000',
    }
  }

  // Construir transacción de swap
  private async buildSwap(_params: TransferParams): Promise<TransferResponse> {
    // Los swaps se manejan por el backend con su propia API key
    throw new Error('Swaps must be handled through the backend API endpoint. Use POST /api/wallet/transfer')
  }

  // Construir transacción de bridge (no implementado aún)
  private async buildBridge(_params: TransferParams): Promise<TransferResponse> {
    // Los bridges se manejan por el backend con su propia API key
    throw new Error('Cross-chain bridges must be handled through the backend API endpoint. Use POST /api/wallet/transfer')
  }

  // Método principal: preparar transferencia
  public async prepareTransfer(params: TransferParams): Promise<TransferResponse> {
    // Validar parámetros
    if (!params.from || !params.to) {
      throw new Error('From and to addresses are required')
    }
    if (!params.amount || BigInt(params.amount) <= 0n) {
      throw new Error('Amount must be greater than 0')
    }

    // Determinar tipo de operación y construir transacción
    if (this.isNativeTransfer(params)) {
      return this.buildNativeTransfer(params)
    } else if (this.isSwap(params)) {
      return this.buildSwap(params)
    } else if (this.isBridge(params)) {
      return this.buildBridge(params)
    }

    throw new Error('Invalid transfer parameters')
  }
}

// Singleton instance con API key configurable
let transferServiceInstance: TransferService | null = null

export function getTransferService(): TransferService {
  if (!transferServiceInstance) {
    transferServiceInstance = new TransferService()
  }
  return transferServiceInstance
}

export const transferService = getTransferService()
export default transferService
