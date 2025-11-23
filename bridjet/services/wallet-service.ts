import { createWalletClient, http, type Address, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { getSwapService } from './swap-service'

export interface WalletSwapParams {
  privateKey: `0x${string}`
  fromToken: Address
  toToken: Address
  amount: string
  slippage?: number
  chainId?: number
}

class WalletService {
  public async executeSwap(params: WalletSwapParams): Promise<Hash> {
    const account = privateKeyToAccount(params.privateKey)
    const chainId = params.chainId || 8453 // Base por defecto
    
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    })

    const swapService = getSwapService()
    
    const swapTx = await swapService.getSwapTransaction({
      chainId,
      src: params.fromToken,
      dst: params.toToken,
      amount: params.amount,
      from: account.address,
      slippage: params.slippage || 1,
    })

    const hash = await client.sendTransaction({
      to: swapTx.to,
      data: swapTx.data as `0x${string}`,
      value: BigInt(swapTx.value),
    })

    return hash
  }

  public async getQuote(params: Omit<WalletSwapParams, 'privateKey'> & { from: Address }) {
    const swapService = getSwapService()
    const chainId = params.chainId || 8453
    
    return swapService.getQuote({
      chainId,
      src: params.fromToken,
      dst: params.toToken,
      amount: params.amount,
      from: params.from,
      slippage: params.slippage || 1,
    })
  }
}

let walletServiceInstance: WalletService | null = null

export function getWalletService(): WalletService {
  if (!walletServiceInstance) {
    walletServiceInstance = new WalletService()
  }
  return walletServiceInstance
}

export const walletService = getWalletService()
export default walletService
