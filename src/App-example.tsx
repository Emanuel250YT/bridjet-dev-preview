import { useState } from 'react'
import { 
  WalletConnector, 
  SendPaymentWeb, 
  SendTokensWeb,
  useAccount,
  useBalance,
  type Address 
} from '../bridjet'
import './App.css'

function App() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedChain, setSelectedChain] = useState<'celo' | 'polygon' | 'ethereum'>('celo')

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌉 Bridjet Demo</h1>
        <p>Multi-chain payments with wagmi and 1inch Aqua</p>
      </header>

      <main>
        {/* Wallet Connection Section */}
        <section className="wallet-section">
          <h2>1. Connect Your Wallet</h2>
          <WalletConnector>
            {({ isConnected, address, connectors, connect, disconnect, isConnecting }) => (
              <div>
                {!isConnected ? (
                  <div className="connector-grid">
                    {connectors.map(connector => (
                      <button 
                        key={connector.id}
                        onClick={() => connect(connector.id)}
                        disabled={isConnecting}
                        className="connector-button"
                      >
                        {connector.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="connected-info">
                    <p>✅ Connected</p>
                    <p className="address">{address}</p>
                    <button onClick={disconnect} className="disconnect-button">
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            )}
          </WalletConnector>
        </section>

        {/* Payment Form Section */}
        <section className="payment-section">
          <h2>2. Send Native Currency</h2>
          
          <div className="form-group">
            <label>Network:</label>
            <select 
              value={selectedChain} 
              onChange={(e) => setSelectedChain(e.target.value as any)}
            >
              <option value="celo">Celo</option>
              <option value="polygon">Polygon</option>
              <option value="ethereum">Ethereum</option>
            </select>
          </div>

          <div className="form-group">
            <label>Recipient Address:</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
            />
          </div>

          {recipient && amount && (
            <SendPaymentWeb
              payload={{
                recipient: recipient as Address,
                amount: amount,
                chainName: selectedChain,
              }}
              autoSwitchChain={true}
              onSuccess={(response) => {
                alert(`✅ Payment sent! TX: ${response.txHash}`)
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
                    <div className="warning">
                      <p>⚠️ Wrong network! Click to switch:</p>
                      <button onClick={switchChain} className="switch-button">
                        Switch to {selectedChain}
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={send} 
                    disabled={isLoading || needsChainSwitch}
                    className="send-button"
                  >
                    {isLoading ? '⏳ Sending...' : '💸 Send Payment'}
                  </button>
                  
                  {error && (
                    <p className="error">{error}</p>
                  )}
                </div>
              )}
            </SendPaymentWeb>
          )}
        </section>

        {/* Token Transfer Section */}
        <section className="token-section">
          <h2>3. Send Tokens (ERC20)</h2>
          <TokenTransferForm />
        </section>

        {/* Account Info Section */}
        <section className="account-section">
          <h2>4. Account Info</h2>
          <AccountInfo />
        </section>
      </main>

      <footer>
        <p>
          Built with ❤️ using{' '}
          <a href="https://github.com/your-repo/bridjet" target="_blank" rel="noopener noreferrer">
            Bridjet
          </a>
          ,{' '}
          <a href="https://wagmi.sh" target="_blank" rel="noopener noreferrer">
            wagmi
          </a>
          , and{' '}
          <a href="https://github.com/1inch/sdks" target="_blank" rel="noopener noreferrer">
            1inch Aqua
          </a>
        </p>
      </footer>
    </div>
  )
}

function TokenTransferForm() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [fromChain, setFromChain] = useState<'celo' | 'polygon'>('polygon')
  const [toChain, setToChain] = useState<'celo' | 'polygon'>('polygon')
  const [enableCrossChain, setEnableCrossChain] = useState(false)

  const isCrossChain = enableCrossChain && fromChain !== toChain

  return (
    <div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={enableCrossChain}
            onChange={(e) => setEnableCrossChain(e.target.checked)}
          />
          {' '}Enable Cross-Chain (via 1inch Aqua)
        </label>
      </div>

      <div className="form-group">
        <label>From Network:</label>
        <select value={fromChain} onChange={(e) => setFromChain(e.target.value as any)}>
          <option value="polygon">Polygon</option>
          <option value="celo">Celo</option>
        </select>
      </div>

      {enableCrossChain && (
        <div className="form-group">
          <label>To Network:</label>
          <select value={toChain} onChange={(e) => setToChain(e.target.value as any)}>
            <option value="polygon">Polygon</option>
            <option value="celo">Celo</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Token Address:</label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x... (e.g., USDC address)"
        />
      </div>

      <div className="form-group">
        <label>Recipient:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="form-group">
        <label>Amount:</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100"
        />
      </div>

      {recipient && amount && tokenAddress && (
        <SendTokensWeb
          payload={{
            recipient: recipient as Address,
            amount: amount,
            tokenAddress: tokenAddress as Address,
            fromChainName: fromChain,
            toChainName: toChain,
            enableCrossChain: enableCrossChain,
            decimals: 6, // Asumiendo USDC (6 decimals)
          }}
          onSuccess={(response) => {
            alert(
              isCrossChain
                ? `✅ Cross-chain swap initiated! TX: ${response.txHash}`
                : `✅ Tokens sent! TX: ${response.txHash}`
            )
            setRecipient('')
            setAmount('')
          }}
          onError={(error) => {
            alert(`❌ Error: ${error.message}`)
          }}
        >
          {({ send, isLoading, error, isCrossChain, needsChainSwitch, switchChain }) => (
            <div>
              {isCrossChain && (
                <div className="info">
                  <p>ℹ️ This is a cross-chain transaction using 1inch Aqua</p>
                </div>
              )}

              {needsChainSwitch && (
                <div className="warning">
                  <p>⚠️ Wrong network!</p>
                  <button onClick={switchChain} className="switch-button">
                    Switch to {fromChain}
                  </button>
                </div>
              )}

              <button
                onClick={send}
                disabled={isLoading || needsChainSwitch}
                className="send-button"
              >
                {isLoading 
                  ? '⏳ Processing...' 
                  : isCrossChain 
                    ? '🌉 Send Cross-Chain' 
                    : '🪙 Send Tokens'}
              </button>

              {error && <p className="error">{error}</p>}
            </div>
          )}
        </SendTokensWeb>
      )}
    </div>
  )
}

function AccountInfo() {
  const { address, chainId, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  if (!isConnected) {
    return <p>Connect your wallet to see account info</p>
  }

  return (
    <div className="account-info">
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Chain ID:</strong> {chainId}</p>
      {balance && (
        <p>
          <strong>Balance:</strong> {(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(4)} {balance.symbol}
        </p>
      )}
    </div>
  )
}

export default App
