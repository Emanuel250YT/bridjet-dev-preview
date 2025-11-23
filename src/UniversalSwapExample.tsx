import { UniversalSwap } from '../bridjet'
import type { Address } from 'viem'

const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address
const USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address

export function UniversalSwapExample() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', fontFamily: 'monospace' }}>
      <h2>🔄 Universal Swap</h2>
      
      {/* Same-chain swap: ETH → USDC on Base */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Same-Chain Swap (1inch Classic)</h3>
        <p>ETH → USDC on Base</p>
        <UniversalSwap
          payload={{
            fromToken: ETH,
            toToken: USDC_BASE,
            amount: '0.0001',
            fromChainName: 'base',
            decimals: 18,
            slippage: 1,
          }}
          onSuccess={(r) => console.log('Success:', r)}
          onError={(e) => console.error('Error:', e)}
        >
          {({ execute, isLoading, error, response, needsChainSwitch, switchChain }) => (
            <div>
              {needsChainSwitch && (
                <button onClick={switchChain} style={{ padding: '10px', marginBottom: '10px' }}>
                  Switch to Base
                </button>
              )}
              <button onClick={execute} disabled={isLoading} style={{ padding: '10px 20px' }}>
                {isLoading ? 'Swapping...' : 'Swap ETH → USDC'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {response?.txHash && (
                <p style={{ color: 'green' }}>
                  TX: <a href={`https://basescan.org/tx/${response.txHash}`} target="_blank" rel="noreferrer">
                    {response.txHash.slice(0, 10)}...
                  </a>
                </p>
              )}
            </div>
          )}
        </UniversalSwap>
      </div>

      {/* Cross-chain swap: USDC Base → USDC Polygon */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Cross-Chain Bridge (1inch Aqua)</h3>
        <p>USDC Base → USDC Polygon</p>
        <UniversalSwap
          payload={{
            fromToken: USDC_BASE,
            toToken: USDC_POLYGON,
            amount: '1',
            fromChainName: 'base',
            toChainName: 'polygon',
            decimals: 6,
          }}
          onSuccess={(r) => console.log('Bridge success:', r)}
          onError={(e) => console.error('Bridge error:', e)}
        >
          {({ execute, isLoading, error, response }) => (
            <div>
              <button onClick={execute} disabled={isLoading} style={{ padding: '10px 20px' }}>
                {isLoading ? 'Bridging...' : 'Bridge USDC → Polygon'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {response?.txHash && (
                <p style={{ color: 'green' }}>
                  Type: {response.type} | TX: {response.txHash.slice(0, 10)}...
                </p>
              )}
            </div>
          )}
        </UniversalSwap>
      </div>

      {/* Direct transfer: USDC → USDC same chain */}
      <div style={{ padding: '15px', border: '1px solid #ddd' }}>
        <h3>Direct Transfer (Native)</h3>
        <p>USDC → USDC on Base</p>
        <UniversalSwap
          payload={{
            fromToken: USDC_BASE,
            toToken: USDC_BASE,
            amount: '1',
            fromChainName: 'base',
            decimals: 6,
          }}
          onSuccess={(r) => console.log('Transfer success:', r)}
          onError={(e) => console.error('Transfer error:', e)}
        >
          {({ execute, isLoading, error, response }) => (
            <div>
              <button onClick={execute} disabled={isLoading} style={{ padding: '10px 20px' }}>
                {isLoading ? 'Transferring...' : 'Transfer USDC'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {response?.txHash && (
                <p style={{ color: 'green' }}>
                  Type: {response.type} | TX: {response.txHash.slice(0, 10)}...
                </p>
              )}
            </div>
          )}
        </UniversalSwap>
      </div>
    </div>
  )
}
