import { createWalletClient, http, parseUnits, formatEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base, baseSepolia } from 'viem/chains'
import { getCrossChainService } from './bridjet/services/cross-chain-service'
import type { Address } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'
const API_KEY = process.env.VITE_1INCH_API_KEY || 'YnQAEVAnDoNX5ouq08qjc2lWw7XY6Upg'

// Usar Base Sepolia testnet
const USE_TESTNET = true
const CHAIN = USE_TESTNET ? baseSepolia : base
const CHAIN_ID = USE_TESTNET ? 84532 : 8453

async function checkBalance() {
  const account = privateKeyToAccount(PRIVATE_KEY)
  const client = createWalletClient({
    account,
    chain: CHAIN,
    transport: http(),
  })

  console.log('\n💰 Checking balance...')
  console.log('Address:', account.address)
  console.log('Network:', USE_TESTNET ? 'Base Sepolia (Testnet)' : 'Base Mainnet')
  console.log('Chain ID:', CHAIN_ID)
  
  if (USE_TESTNET) {
    console.log('\n🚰 Get testnet ETH from:')
    console.log('   https://www.alchemy.com/faucets/base-sepolia')
    console.log('   https://faucet.quicknode.com/base/sepolia')
  } else {
    console.log('\n⚠️  MAINNET - Send real ETH to:', account.address)
    console.log('   Minimum: 0.005 ETH for gas + swap')
  }
  
  console.log('\n📊 To execute bridge, the wallet needs:')
  console.log('   - ETH for gas (~0.002 ETH)')
  console.log('   - Tokens to swap (0.1 WETH)')
  console.log('\n❌ Cannot execute without funds')
  console.log('\nOnce funded, run: npm run bridge')
}

checkBalance()
