import { setupBridjet, BridjetProvider, WalletConnector, SendPaymentWeb } from './bridjet'
import type { Address } from 'viem'

// Configurar Bridjet
setupBridjet({
  providers: {
    types: ['celo'],
    defaultType: 'celo',
  },
})

function App() {
  return (
    <BridjetProvider>
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>🌉 Bridjet Minimal Example</h1>
        
        {/* Step 1: Connect Wallet */}
        <section style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
          <h2>1. Connect Wallet</h2>
          <WalletConnector>
            {({ isConnected, address, connectors, connect, disconnect }) => (
              <div>
                {!isConnected ? (
                  <div>
                    {connectors.map(connector => (
                      <button 
                        key={connector.id} 
                        onClick={() => connect(connector.id)}
                        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
                      >
                        {connector.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p>✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    <button onClick={disconnect}>Disconnect</button>
                  </div>
                )}
              </div>
            )}
          </WalletConnector>
        </section>

        {/* Step 2: Send Payment */}
        <section style={{ padding: '1rem', border: '1px solid #ddd' }}>
          <h2>2. Send Payment</h2>
          <SendPaymentWeb
            payload={{
              recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as Address,
              amount: '0.001',
              chainName: 'celo',
            }}
            onSuccess={(response) => {
              alert(`✅ Payment sent! TX Hash: ${response.txHash}`)
            }}
            onError={(error) => {
              alert(`❌ Error: ${error.message}`)
            }}
          >
            {({ send, isLoading, error, needsChainSwitch, switchChain }) => (
              <div>
                {needsChainSwitch && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'orange' }}>⚠️ Wrong network!</p>
                    <button onClick={switchChain}>Switch to Celo</button>
                  </div>
                )}
                
                <button 
                  onClick={send} 
                  disabled={isLoading || needsChainSwitch}
                  style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? '⏳ Sending...' : '💸 Send 0.001 CELO'}
                </button>
                
                {error && (
                  <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
                )}
              </div>
            )}
          </SendPaymentWeb>
        </section>

        <footer style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <p>
            📚 For more examples, see <code>src/App-example.tsx</code>
          </p>
          <p>
            📖 Full documentation in <code>USAGE_GUIDE.md</code>
          </p>
        </footer>
      </div>
    </BridjetProvider>
  )
}

export default App
