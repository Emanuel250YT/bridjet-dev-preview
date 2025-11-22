import { useState } from 'react'
import { 
  ConnectButton,
  SendPaymentWeb, 
  useAccount,
  useBalance,
  type Address 
} from '../bridjet'
import './App.css'

/**
 * Ejemplo super simple usando RainbowKit
 * Solo importa ConnectButton y úsalo directamente
 */
function AppRainbowKitExample() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌈 Bridjet + RainbowKit</h1>
        <p>La forma más moderna de conectar wallets</p>
      </header>

      <main>
        {/* Super simple - un solo componente! */}
        <section className="wallet-section">
          <h2>Wallet Connection</h2>
          <div className="rainbow-connect-wrapper">
            <ConnectButton />
          </div>
        </section>

        {/* Info de cuenta */}
        {isConnected && (
          <section className="account-section">
            <h2>Tu Cuenta</h2>
            <div className="account-info">
              <p><strong>Address:</strong> {address}</p>
              {balance && (
                <p>
                  <strong>Balance:</strong>{' '}
                  {(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(4)}{' '}
                  {balance.symbol}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Formulario de pago */}
        {isConnected && (
          <section className="payment-section">
            <h2>Enviar Pago</h2>
            
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
              <label>Cantidad (ETH):</label>
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
                  chainName: 'ethereum',
                }}
                onSuccess={(response) => {
                  alert(`✅ Pago enviado! TX: ${response.txHash}`)
                  setRecipient('')
                  setAmount('')
                }}
                onError={(error) => {
                  alert(`❌ Error: ${error.message}`)
                }}
              >
                {({ send, isLoading, error }) => (
                  <div>
                    <button 
                      onClick={send} 
                      disabled={isLoading}
                      className="send-button"
                    >
                      {isLoading ? '⏳ Enviando...' : '💸 Enviar Pago'}
                    </button>
                    
                    {error && <p className="error">{error}</p>}
                  </div>
                )}
              </SendPaymentWeb>
            )}
          </section>
        )}
      </main>

      <footer>
        <p>
          Powered by{' '}
          <a href="https://www.rainbowkit.com/" target="_blank" rel="noopener noreferrer">
            RainbowKit 🌈
          </a>
        </p>
      </footer>
    </div>
  )
}

export default AppRainbowKitExample
