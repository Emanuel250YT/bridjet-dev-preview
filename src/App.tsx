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

interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: string
  popular?: boolean
}

interface NetworkInfo {
  name: NetworkName
  displayName: string
  chainId: number
  symbol: string
  color: string
  icon: string
}

// Tokens más populares en cada red
const tokensByNetwork: Record<NetworkName, TokenInfo[]> = {
  ethereum: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, icon: '💵', popular: true },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, icon: '💰', popular: true },
    { symbol: 'WLD', name: 'Worldcoin', address: '0x163f8C2467924be0ae7B5347228CABF260318753', decimals: 18, icon: '🌍', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, icon: '⟠' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, icon: '₿' },
  ],
  base: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDbC', name: 'USD Base Coin', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WLD', name: 'Worldcoin', address: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', decimals: 18, icon: '🌍', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, icon: '⟠' },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, icon: '💰' },
  ],
  optimism: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WLD', name: 'Worldcoin', address: '0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1', decimals: 18, icon: '🌍', popular: true },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, icon: '💰' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, icon: '⟠' },
  ],
  polygon: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, icon: '💵', popular: true },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, icon: '💰', popular: true },
    { symbol: 'WLD', name: 'Worldcoin', address: '0x6a58BAb4Cf20370f7f0Be0A2A5F66310Fe46443b', decimals: 18, icon: '🌍', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, icon: '⟠' },
    { symbol: 'WMATIC', name: 'Wrapped Matic', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18, icon: '🟣' },
  ],
  arbitrum: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WLD', name: 'Worldcoin', address: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', decimals: 18, icon: '🌍', popular: true },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, icon: '💰' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, icon: '⟠' },
  ],
  avalanche: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, icon: '💵', popular: true },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', decimals: 18, icon: '💰' },
    { symbol: 'WAVAX', name: 'Wrapped AVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18, icon: '🔺' },
  ],
  bsc: [
    { symbol: 'USDT', name: 'Tether', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, icon: '💵', popular: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, icon: '💵', popular: true },
    { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, icon: '💵', popular: true },
    { symbol: 'WBNB', name: 'Wrapped BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18, icon: '🟡' },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, icon: '💰' },
  ],
  linea: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', decimals: 18, icon: '⟠' },
  ],
  sonic: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', decimals: 18, icon: '⟠' },
  ],
  unichain: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x2f4BF8e8CFd8f86B9f7ba9F9b5B9c9e9B8B8b8B8', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, icon: '⟠' },
  ],
  gnosis: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WXDAI', name: 'Wrapped xDAI', address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', decimals: 18, icon: '🟢' },
  ],
  zksync: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', decimals: 6, icon: '💵', popular: true },
    { symbol: 'USDT', name: 'Tether', address: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C', decimals: 6, icon: '💵', popular: true },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', decimals: 18, icon: '⟠' },
  ],
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
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [customTokenAddress, setCustomTokenAddress] = useState('')
  const [useCustomToken, setUseCustomToken] = useState(false)

  const fromNetworkInfo = networks.find(n => n.name === fromNetwork)
  const toNetworkInfo = networks.find(n => n.name === toNetwork)

  const fromSupports1inch = fromNetworkInfo ? supportsOneInch(fromNetworkInfo.chainId) : false
  const toSupports1inch = toNetworkInfo ? supportsOneInch(toNetworkInfo.chainId) : false
  const canCrossChain = fromSupports1inch && toSupports1inch && fromNetwork !== toNetwork

  // Obtener tokens disponibles en la red de origen
  const availableTokens = tokensByNetwork[fromNetwork] || []

  // Resetear token seleccionado al cambiar de red
  const handleFromNetworkChange = (newNetwork: NetworkName) => {
    setFromNetwork(newNetwork)
    setSelectedToken(null)
    setUseCustomToken(false)
  }

  // Token address final para usar
  const finalTokenAddress = useCustomToken ? customTokenAddress : selectedToken?.address || ''
  const finalDecimals = useCustomToken ? 18 : selectedToken?.decimals || 18

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
                  onChange={(e) => handleFromNetworkChange(e.target.value as NetworkName)}
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

            {/* Token Selector */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Token para enviar:</span>
                <label style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
                  <input
                    type="checkbox"
                    checked={useCustomToken}
                    onChange={(e) => setUseCustomToken(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Usar dirección custom
                </label>
              </label>

              {!useCustomToken ? (
                <div>
                  <select
                    value={selectedToken?.address || ''}
                    onChange={(e) => {
                      const token = availableTokens.find(t => t.address === e.target.value)
                      setSelectedToken(token || null)
                    }}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                  >
                    <option value="">Selecciona un token...</option>
                    {availableTokens
                      .filter(t => t.popular)
                      .map(token => (
                        <option key={token.address} value={token.address}>
                          {token.icon} {token.symbol} - {token.name} ⭐
                        </option>
                      ))}
                    {availableTokens.filter(t => t.popular).length > 0 && 
                     availableTokens.filter(t => !t.popular).length > 0 && (
                      <option disabled>────────────────</option>
                    )}
                    {availableTokens
                      .filter(t => !t.popular)
                      .map(token => (
                        <option key={token.address} value={token.address}>
                          {token.icon} {token.symbol} - {token.name}
                        </option>
                      ))}
                  </select>

                  {selectedToken && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem',
                      background: 'rgba(123, 63, 242, 0.1)',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span><strong>{selectedToken.icon} {selectedToken.symbol}</strong></span>
                        <span style={{ opacity: 0.7 }}>{selectedToken.decimals} decimals</span>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        opacity: 0.6, 
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }}>
                        {selectedToken.address}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={customTokenAddress}
                    onChange={(e) => setCustomTokenAddress(e.target.value)}
                    placeholder="0x... dirección del token ERC20"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                  />
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(255, 149, 0, 0.1)',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    ⚠️ Asegúrate de que la dirección sea correcta y que el token exista en {fromNetworkInfo?.displayName}
                  </div>
                </div>
              )}
            </div>

            {/* Transfer Details */}

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
            {recipient && amount && finalTokenAddress && canCrossChain && (() => {
              // Para cross-chain, necesitamos la dirección del token en la red de destino
              let toTokenAddress: string | undefined

              if (selectedToken) {
                // Buscar el mismo token (por símbolo) en la red de destino
                const toNetworkTokens = tokensByNetwork[toNetwork as NetworkName] || []
                const matchingToken = toNetworkTokens.find(t => t.symbol === selectedToken.symbol)
                
                if (matchingToken) {
                  toTokenAddress = matchingToken.address
                } else {
                  // Token no disponible en la red de destino
                  return (
                    <div className="warning" style={{ marginTop: '1rem', padding: '1rem' }}>
                      <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                        ⚠️ <strong>{selectedToken.symbol}</strong> no está disponible en <strong>{toNetworkInfo?.displayName}</strong>
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                        Selecciona un token que exista en ambas redes (ej: USDC, USDT, WETH, WLD).
                      </p>
                    </div>
                  )
                }
              } else {
                // Para tokens custom, usar la misma dirección (asume el mismo token)
                toTokenAddress = finalTokenAddress
              }

              return (
                <SendTokensWeb
                  payload={{
                    recipient: recipient as Address,
                    amount: amount,
                    tokenAddress: finalTokenAddress as Address,
                    toTokenAddress: toTokenAddress as Address,
                    fromChainName: fromNetwork,
                    toChainName: toNetwork,
                    enableCrossChain: true,
                    decimals: finalDecimals,
                  }}
                  onSuccess={(response) => {
                    alert(`✅ Transferencia iniciada!\n\nTX: ${response.txHash}\n\nDe: ${fromNetworkInfo?.displayName}\nA: ${toNetworkInfo?.displayName}\n\nToken: ${selectedToken?.symbol || 'Custom'}`)
                    setRecipient('')
                    setAmount('')
                    setSelectedToken(null)
                    setCustomTokenAddress('')
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
                        ) : selectedToken ? (
                          `🌉 Enviar ${selectedToken.symbol} de ${fromNetworkInfo?.icon} a ${toNetworkInfo?.icon}`
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
              )
            })()}
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
