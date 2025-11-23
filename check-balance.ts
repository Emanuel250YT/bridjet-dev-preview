import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import type { Address } from 'viem'

const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'
const INCH_BASE = '0x111111111117dC0aa78b770fA6A738034120C302' as Address // 1INCH token en Base
const WETH_BASE = '0x4200000000000000000000000000000000000006' as Address
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

async function checkBalances() {
  const account = privateKeyToAccount(PRIVATE_KEY)
  const client = createPublicClient({
    chain: base,
    transport: http(),
  })

  console.log('📍 Address:', account.address)
  console.log('🌐 Network: Base Mainnet (8453)\n')

  // ETH balance
  const ethBalance = await client.getBalance({ address: account.address })
  console.log('💰 ETH:', formatEther(ethBalance))

  // 1INCH balance
  try {
    const inchBalance = await client.readContract({
      address: INCH_BASE,
      abi: [{
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'balanceOf',
      args: [account.address],
    })
    console.log('🪙 1INCH:', formatUnits(inchBalance as bigint, 18))
  } catch (e) {
    console.log('🪙 1INCH: 0 (or not available)')
  }

  // WETH balance
  try {
    const wethBalance = await client.readContract({
      address: WETH_BASE,
      abi: [{
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'balanceOf',
      args: [account.address],
    })
    console.log('💎 WETH:', formatUnits(wethBalance as bigint, 18))
  } catch (e) {
    console.log('💎 WETH: 0')
  }

  // USDC balance
  try {
    const usdcBalance = await client.readContract({
      address: USDC_BASE,
      abi: [{
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'balanceOf',
      args: [account.address],
    })
    console.log('💵 USDC:', formatUnits(usdcBalance as bigint, 6))
  } catch (e) {
    console.log('💵 USDC: 0')
  }

  console.log('\n🔗 View on BaseScan:')
  console.log(`https://basescan.org/address/${account.address}`)
}

checkBalances()
