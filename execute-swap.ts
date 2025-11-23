import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { getSwapService } from './bridjet/services/swap-service'
import type { Address } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'
const API_KEY = process.env.VITE_1INCH_API_KEY || 'YnQAEVAnDoNX5ouq08qjc2lWw7XY6Upg'
const ETH_BASE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address // Native ETH
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

async function executeSwap() {
  try {
    console.log('🔄 Swap ETH → USDC en Base\n')
    
    const account = privateKeyToAccount(PRIVATE_KEY)
    console.log('📍 Address:', account.address)
    
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    })

    const swapService = getSwapService(API_KEY)
    const amount = parseEther('0.0001').toString() // 0.0001 ETH mínimo
    
    console.log('💰 Amount: 0.0001 ETH')
    console.log('📊 Getting quote...\n')

    const quote = await swapService.getQuote({
      chainId: 8453,
      src: ETH_BASE,
      dst: USDC_BASE,
      amount,
      from: account.address,
      slippage: 1,
    })

    console.log('✅ Quote:')
    console.log(JSON.stringify(quote, null, 2))

    console.log('\n🔄 Building swap transaction...')
    const swapTx = await swapService.getSwapTransaction({
      chainId: 8453,
      src: ETH_BASE,
      dst: USDC_BASE,
      amount,
      from: account.address,
      slippage: 1,
    })

    console.log('📤 Swap TX:')
    console.log(JSON.stringify(swapTx, null, 2))

    console.log('\n📤 Sending transaction...')
    const hash = await client.sendTransaction({
      to: swapTx.to,
      data: swapTx.data as `0x${string}`,
      value: BigInt(swapTx.value || '0'),
    })

    console.log('\n✅ SUCCESS!')
    console.log('TX Hash:', hash)
    console.log('View on BaseScan:', `https://basescan.org/tx/${hash}`)
    
    return hash
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    throw error
  }
}

executeSwap()
