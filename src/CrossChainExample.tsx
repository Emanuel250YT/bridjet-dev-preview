import { useState, useEffect } from 'react'
import { createWalletClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base, bsc } from 'viem/chains'
import { getCrossChainService } from '../bridjet/services/cross-chain-service'
import type { Address } from 'viem'

const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'
const INCH_BASE = '0x4200000000000000000000000000000000000006' as Address // WETH en Base
const INCH_BSC = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' as Address // WBNB en BSC

export function CrossChainExample() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    const account = privateKeyToAccount(PRIVATE_KEY)
    setAddress(account.address)
  }, [])

  const handleGetQuote = async () => {
    setError('')
    setQuote(null)
    try {
      const crossChainService = getCrossChainService()
      const amount = parseUnits('0.1', 18).toString()
      
      const q = await crossChainService.getQuote({
        fromChainId: 8453, // Base
        toChainId: 56, // BSC
        fromTokenAddress: INCH_BASE,
        toTokenAddress: INCH_BSC,
        amount,
        walletAddress: address as Address,
      })
      
      setQuote(q)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting quote')
    }
  }

  const handleBridge = async () => {
    setLoading(true)
    setError('')
    setTxHash('')

    try {
      const account = privateKeyToAccount(PRIVATE_KEY)
      const client = createWalletClient({
        account,
        chain: base,
        transport: http(),
      })

      const crossChainService = getCrossChainService()
      const amount = parseUnits('0.1', 18).toString()

      const swapTx = await crossChainService.buildSwapTransaction({
        fromChainId: 8453,
        toChainId: 56,
        fromTokenAddress: INCH_BASE,
        toTokenAddress: INCH_BSC,
        amount,
        walletAddress: account.address,
      })

      const hash = await client.sendTransaction({
        to: swapTx.to,
        data: swapTx.data as `0x${string}`,
        value: BigInt(swapTx.value),
      })

      setTxHash(hash)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en bridge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'monospace' }}>
      <h2>🌉 Cross-Chain Bridge: Base → BSC</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Amount:</strong> 0.1 WETH</p>
      <p><strong>From:</strong> Base (8453)</p>
      <p><strong>To:</strong> BSC (56)</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
        <button 
          onClick={handleGetQuote}
          style={{ padding: '10px 20px' }}
        >
          Get Quote
        </button>
        <button 
          onClick={handleBridge} 
          disabled={loading}
          style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Bridging...' : 'Execute Bridge'}
        </button>
      </div>

      {quote && (
        <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '10px' }}>
          <p><strong>📊 Quote:</strong></p>
          <p>Source Amount: {quote.srcAmount}</p>
          <p>Destination Amount: {quote.dstAmount}</p>
          <p>Estimated Gas: {quote.estimatedGas}</p>
          <p>Protocols: {quote.protocols.join(', ') || 'N/A'}</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', background: '#fee', padding: '15px', marginBottom: '10px' }}>
          <p><strong>❌ Error:</strong></p>
          <p>{error}</p>
        </div>
      )}

      {txHash && (
        <div style={{ color: 'green', background: '#efe', padding: '15px' }}>
          <p><strong>✅ Bridge Initiated!</strong></p>
          <p style={{ wordBreak: 'break-all' }}>TX: {txHash}</p>
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">
            View on BaseScan →
          </a>
        </div>
      )}
    </div>
  )
}
