import { useState, useEffect } from 'react'
import { walletService } from '../bridjet/services/wallet-service'
import { privateKeyToAccount } from 'viem/accounts'
import type { Address } from 'viem'

const PRIVATE_KEY = '0x39eaf395b425adaa136ebc2576ea742d632384cb769dac693ecf0292a7dd68bc'
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address
const WETH_BASE = '0x4200000000000000000000000000000000000006' as Address

export function SwapExample() {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('1')
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quote, setQuote] = useState<any>(null)

  useEffect(() => {
    const account = privateKeyToAccount(PRIVATE_KEY)
    setAddress(account.address)
  }, [])

  const handleGetQuote = async () => {
    setError('')
    try {
      const amountInUnits = (parseFloat(amount) * 1e6).toString()
      const q = await walletService.getQuote({
        fromToken: USDC_BASE,
        toToken: WETH_BASE,
        amount: amountInUnits,
        from: address as Address,
        chainId: 8453,
      })
      setQuote(q)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting quote')
    }
  }

  const handleSwap = async () => {
    setLoading(true)
    setError('')
    setTxHash('')

    try {
      const amountInUnits = (parseFloat(amount) * 1e6).toString()
      const hash = await walletService.executeSwap({
        privateKey: PRIVATE_KEY,
        fromToken: USDC_BASE,
        toToken: WETH_BASE,
        amount: amountInUnits,
        slippage: 1,
        chainId: 8453,
      })
      setTxHash(hash)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en swap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'monospace' }}>
      <h2>🔄 Swap USDC → WETH (Base)</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Network:</strong> Base (8453)</p>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Amount USDC:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleGetQuote} style={{ padding: '10px 20px' }}>
          Get Quote
        </button>
        <button 
          onClick={handleSwap} 
          disabled={loading}
          style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Swapping...' : 'Execute Swap'}
        </button>
      </div>

      {quote && (
        <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
          <p><strong>Quote:</strong></p>
          <p>From: {quote.fromAmount} USDC</p>
          <p>To: {quote.toAmount} WETH</p>
          <p>Gas: {quote.estimatedGas}</p>
        </div>
      )}

      {error && <p style={{ color: 'red', background: '#fee', padding: '10px' }}>{error}</p>}
      {txHash && (
        <div style={{ color: 'green', background: '#efe', padding: '10px' }}>
          <p><strong>✅ Success!</strong></p>
          <p>TX: {txHash}</p>
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">
            View on BaseScan →
          </a>
        </div>
      )}
    </div>
  )
}
