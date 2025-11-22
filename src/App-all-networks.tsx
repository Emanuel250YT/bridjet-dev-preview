import { useState } from 'react'
import { 
  ConnectButton,
  SendTokensWeb,
  useAccount,
  supportsOneInch,
  supportedChains,
  type Address 
} from '../bridjet'
import './App.css'

/**
 * Ejemplo completo con TODAS las redes de 1inch Fusion+
 * 
 * Redes soportadas:
 * - Ethereum (1)
 * - Base (8453)
 * - Optimism (10)
 * - Polygon (137)
 * - Arbitrum (42161)
 * - Avalanche (43114)
 * - BSC (56)
 * - Linea (59144)
 * - Sonic (146)
 * - Unichain (1301)
 * - Gnosis (100)
 * - zkSync (324)
 */

type NetworkName = 
  | 'ethereum'
  | 'base' 
  | 'optimism'
  | 'polygon'
  | 'arbitrum'
  | 'avalanche'
  | 'bsc'
  | 'linea'
  | 'sonic'
  | 'unichain'
  | 'gnosis'
  | 'zksync'

interface NetworkInfo {
  name: NetworkName
  displayName: string
  chainId: number
  symbol: string
  color: string
  icon: string
}

const networks: NetworkInfo[] = [
  { name: 'ethereum', displayName: 'Ethereum', chainId: 1, symbol: 'ETH', color: '#627EEA', icon: '⟠' },
  { name: 'base', displayName: 'Base', chainId: 8453, symbol: 'ETH', color: '#0052FF', icon: '🔵' },
  { name: 'optimism', displayName: 'Optimism', chainId: 10, symbol: 'ETH', color: '#FF0420', icon: '🔴' },
  { name: 'polygon', displayName: 'Polygon', chainId: 137, symbol: 'MATIC', color: '#8247E5', icon: '🟣' },
  { name: 'arbitrum', displayName: 'Arbitrum', chainId: 42161, symbol: 'ETH', color: '#28A0F0', icon: '🔷' },
  { name: 'avalanche', displayName: 'Avalanche', chainId: 43114, symbol: 'AVAX', color: '#E84142', icon: '🔺' },
  { name: 'bsc', displayName: 'BSC', chainId: 56, symbol: 'BNB', color: '#F3BA2F', icon: '🟡' },
  { name: 'linea', displayName: 'Linea', chainId: 59144, symbol: 'ETH', color: '#121212', icon: '⬛' },
  { name: 'sonic', displayName: 'Sonic', chainId: 146, symbol: 'S', color: '#0066FF', icon: '💙' },
  { name: 'unichain', displayName: 'Unichain', chainId: 1301, symbol: 'ETH', color: '#FF007A', icon: '🦄' },
  { name: 'gnosis', displayName: 'Gnosis', chainId: 100, symbol: 'xDAI', color: '#04795B', icon: '🟢' },
  { name: 'zksync', displayName: 'zkSync', chainId: 324, symbol: 'ETH', color: '#8C8DFC', icon: '⚡' },
]

function AppAllNetworks() {
  const { isConnected } = useAccount()
  const [fromNetwork, setFromNetwork] = useState<NetworkName>('ethereum')
  const [toNetwork, setToNetwork] = useState<NetworkName>('base')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')

  const fromNetworkInfo = networks.find(n => n.name === fromNetwork)
  const toNetworkInfo = networks.find(n => n.name === toNetwork)

  const fromSupports1inch = fromNetworkInfo ? supportsOneInch(fromNetworkInfo.chainId) : false
  const toSupports1inch = toNetworkInfo ? supportsOneInch(toNetworkInfo.chainId) : false
  const canCrossChain = fromSupports1inch && toSupports1inch && fromNetwork !== toNetwork

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌐 Bridjet - Todas las Redes</h1>
        <p>Conecta y transfiere en 12 blockchains diferentes</p>
      </header>

      <main>
        {/* Wallet Connection */}
        <section className="wallet-section">
          <h2>Conectar Wallet</h2>
          <div className="rainbow-connect-wrapper">
            <ConnectButton />
          </div>
        </section>

        {/* Network Info */}
        <section className="account-section">
          <h2>📊 Redes Soportadas</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {networks.map(network => {
              const supports = supportsOneInch(network.chainId)
              
              return (
                <div 
                  key={network.chainId}
                  style={{
                    background: supports ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                    border: `1px solid ${supports ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>{network.icon}</div>
                  <div style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {network.displayName}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {network.symbol}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    marginTop: '0.5rem',
                    padding: '0.25rem',
                    background: supports ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)',
                    borderRadius: '4px'
                  }}>
                    {supports ? '✅ 1inch' : '⚠️ Limited'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Transfer Form */}
        {isConnected && (
          <section className="payment-section">
            <h2>🌉 Transferencia Cross-Chain</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              {/* From Network */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Desde:
                </label>
                <select 
                  value={fromNetwork}
                  onChange={(e) => setFromNetwork(e.target.value as NetworkName)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                >
                  {networks.map(network => (
                    <option key={network.chainId} value={network.name}>
                      {network.icon} {network.displayName}
                    </option>
                  ))}
                </select>
                {fromNetworkInfo && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem',
                    background: fromSupports1inch ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Chain ID: {fromNetworkInfo.chainId}<br/>
                    {fromSupports1inch ? '✅ 1inch Fusion+ OK' : '⚠️ No 1inch support'}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '2rem' }}>
                →
              </div>

              {/* To Network */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Hacia:
                </label>
                <select 
                  value={toNetwork}
                  onChange={(e) => setToNetwork(e.target.value as NetworkName)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                >
                  {networks.map(network => (
                    <option key={network.chainId} value={network.name}>
                      {network.icon} {network.displayName}
                    </option>
                  ))}
                </select>
                {toNetworkInfo && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem',
                    background: toSupports1inch ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    Chain ID: {toNetworkInfo.chainId}<br/>
                    {toSupports1inch ? '✅ 1inch Fusion+ OK' : '⚠️ No 1inch support'}
                  </div>
                )}
              </div>
            </div>

            {/* Cross-chain Status */}
            {canCrossChain ? (
              <div className="info" style={{ marginBottom: '1rem' }}>
                ℹ️ Cross-chain habilitado entre {fromNetworkInfo?.displayName} y {toNetworkInfo?.displayName}
              </div>
            ) : fromNetwork === toNetwork ? (
              <div className="warning" style={{ marginBottom: '1rem' }}>
                ⚠️ Selecciona redes diferentes para cross-chain
              </div>
            ) : (
              <div className="error" style={{ marginBottom: '1rem' }}>
                ❌ Cross-chain no disponible entre estas redes
              </div>
            )}

            {/* Transfer Details */}
            <div className="form-group">
              <label>Token Address (ERC20):</label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x... (ej: USDC, USDT)"
              />
            </div>

            <div className="form-group">
              <label>Destinatario:</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="form-group">
              <label>Cantidad:</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
            </div>

            {/* Send Button */}
            {recipient && amount && tokenAddress && canCrossChain && (
              <SendTokensWeb
                payload={{
                  recipient: recipient as Address,
                  amount: amount,
                  tokenAddress: tokenAddress as Address,
                  fromChainName: fromNetwork,
                  toChainName: toNetwork,
                  enableCrossChain: true,
                  decimals: 6, // Ajustar según el token
                }}
                onSuccess={(response) => {
                  alert(`✅ Transferencia iniciada!\n\nTX: ${response.txHash}\n\nDe: ${fromNetworkInfo?.displayName}\nA: ${toNetworkInfo?.displayName}`)
                  setRecipient('')
                  setAmount('')
                }}
                onError={(error) => {
                  alert(`❌ Error: ${error.message}`)
                }}
              >
                {({ send, isLoading, error, needsChainSwitch, switchChain }) => (
                  <div>
                    {needsChainSwitch && (
                      <div className="warning" style={{ marginBottom: '1rem' }}>
                        <p>⚠️ Cambio de red necesario</p>
                        <button onClick={switchChain} className="switch-button">
                          Cambiar a {fromNetworkInfo?.displayName}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={send}
                      disabled={isLoading || needsChainSwitch}
                      className="send-button"
                      style={{
                        background: `linear-gradient(135deg, ${fromNetworkInfo?.color} 0%, ${toNetworkInfo?.color} 100%)`
                      }}
                    >
                      {isLoading ? (
                        '⏳ Procesando...'
                      ) : (
                        `🌉 Enviar de ${fromNetworkInfo?.icon} a ${toNetworkInfo?.icon}`
                      )}
                    </button>

                    {error && (
                      <p className="error" style={{ marginTop: '1rem' }}>
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </SendTokensWeb>
            )}
          </section>
        )}

        {/* Info Section */}
        <section className="account-section">
          <h2>ℹ️ Información</h2>
          <div style={{ textAlign: 'left' }}>
            <h3>Chains Configuradas: {supportedChains.length}</h3>
            <h3>Con soporte 1inch Fusion+: {networks.filter(n => supportsOneInch(n.chainId)).length}</h3>
            
            <h4 style={{ marginTop: '1.5rem' }}>Contrato 1inch:</h4>
            <code style={{ 
              display: 'block', 
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              wordBreak: 'break-all'
            }}>
              0x499943e74fb0ce105688beee8ef2abec5d936d31
            </code>

            <h4 style={{ marginTop: '1.5rem' }}>Ejemplos de uso:</h4>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Ethereum → Base (Layer 2)</li>
              <li>Polygon → Arbitrum (Cross L2)</li>
              <li>BSC → Avalanche (Cross VM)</li>
              <li>Optimism → zkSync (Rollup to Rollup)</li>
            </ul>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Powered by{' '}
          <a href="https://1inch.io/" target="_blank" rel="noopener noreferrer">
            1inch Fusion+ 🦄
          </a>
          {' & '}
          <a href="https://www.rainbowkit.com/" target="_blank" rel="noopener noreferrer">
            RainbowKit 🌈
          </a>
        </p>
      </footer>
    </div>
  )
}

export default AppAllNetworks
