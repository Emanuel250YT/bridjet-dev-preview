import { getTransferService } from './bridjet/services/transfer-service'
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import type { Address } from 'viem'

// ⚠️ IMPORTANTE: En producción, NUNCA expongas tu private key
const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'

const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address

async function main() {
  console.log('🚀 Transfer Service Example\n')

  const account = privateKeyToAccount(PRIVATE_KEY)
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })

  console.log(`👤 Using address: ${account.address}\n`)

  const transferService = getTransferService()

  // Ejemplo 1: Transferencia nativa de ETH
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣ Native ETH Transfer (0.001 ETH)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const result1 = await transferService.prepareTransfer({
      from: account.address,
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as Address,
      amount: parseEther('0.001').toString(),
      fromChainId: 8453, // Base
      toChainId: 8453,
      fromToken: ETH_ADDRESS,
      toToken: ETH_ADDRESS,
      slippage: 1,
    })

    console.log('✅ Transfer prepared!')
    console.log(`   Type: ${result1.type}`)
    console.log(`   Chain: ${result1.chainId}`)
    console.log(`   Needs Approval: ${result1.needsApproval}`)
    console.log(`   Estimated Gas: ${result1.estimatedGas}`)
    console.log(`   To: ${result1.transaction.to}`)
    console.log(`   Value: ${result1.transaction.value} wei`)

    // Descomentar para ejecutar:
    // const tx1 = await client.sendTransaction({
    //   to: result1.transaction.to,
    //   data: result1.transaction.data as `0x${string}`,
    //   value: BigInt(result1.transaction.value),
    // })
    // console.log(`\n   TX Hash: ${tx1}`)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }

  // Ejemplo 2: Swap ETH → USDC
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('2️⃣ Swap: ETH → USDC (0.001 ETH)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const result2 = await transferService.prepareTransfer({
      from: account.address,
      to: account.address, // Los USDC vuelven a tu wallet
      amount: parseEther('0.001').toString(),
      fromChainId: 8453,
      toChainId: 8453,
      fromToken: ETH_ADDRESS,
      toToken: USDC_BASE,
      slippage: 1,
    })

    console.log('✅ Swap prepared!')
    console.log(`   Type: ${result2.type}`)
    console.log(`   Chain: ${result2.chainId}`)
    console.log(`   Needs Approval: ${result2.needsApproval}`)
    console.log(`   Estimated Gas: ${result2.estimatedGas}`)
    
    if (result2.quote) {
      console.log(`\n   📊 Quote:`)
      console.log(`      Source Amount: ${result2.quote.srcAmount} wei`)
      console.log(`      Destination Amount: ${result2.quote.dstAmount} USDC units`)
      console.log(`      Expected USDC: ~${(Number(result2.quote.dstAmount) / 1e6).toFixed(2)} USDC`)
    }

    // Descomentar para ejecutar:
    // if (result2.needsApproval && result2.approval) {
    //   console.log('\n   ⏳ Executing approval...')
    //   const approvalTx = await client.sendTransaction({
    //     to: result2.approval.to,
    //     data: result2.approval.data as `0x${string}`,
    //     value: BigInt(result2.approval.value),
    //   })
    //   console.log(`   ✅ Approval TX: ${approvalTx}`)
    // }
    //
    // console.log('\n   ⏳ Executing swap...')
    // const tx2 = await client.sendTransaction({
    //   to: result2.transaction.to,
    //   data: result2.transaction.data as `0x${string}`,
    //   value: BigInt(result2.transaction.value),
    // })
    // console.log(`   ✅ Swap TX: ${tx2}`)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }

  // Ejemplo 3: Transferencia de USDC
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('3️⃣ ERC20 Transfer: USDC (1 USDC)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const result3 = await transferService.prepareTransfer({
      from: account.address,
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as Address,
      amount: '1000000', // 1 USDC (6 decimales)
      fromChainId: 8453,
      toChainId: 8453,
      fromToken: USDC_BASE,
      toToken: USDC_BASE,
      slippage: 1,
    })

    console.log('✅ Transfer prepared!')
    console.log(`   Type: ${result3.type}`)
    console.log(`   Chain: ${result3.chainId}`)
    console.log(`   Needs Approval: ${result3.needsApproval}`)
    console.log(`   Estimated Gas: ${result3.estimatedGas}`)
    console.log(`   To: ${result3.transaction.to}`)
    console.log(`   Amount: 1 USDC`)

    // Descomentar para ejecutar:
    // const tx3 = await client.sendTransaction({
    //   to: result3.transaction.to,
    //   data: result3.transaction.data as `0x${string}`,
    //   value: BigInt(result3.transaction.value),
    // })
    // console.log(`\n   TX Hash: ${tx3}`)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ All examples completed!')
  console.log('Uncomment the execution code to actually send transactions')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
