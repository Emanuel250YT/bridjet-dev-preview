# 🌉 Bridjet - Multi-Chain Web3 Payment Framework

Bridjet es un framework de React para construir aplicaciones de pagos y operaciones blockchain multi-cadena con soporte para múltiples wallets (MetaMask, WalletConnect, Coinbase) y transferencias cross-chain usando 1inch Aqua.

## ✨ Características

- 🦊 **Multi-Wallet**: MetaMask, WalletConnect, Coinbase Wallet y más
- 🌐 **Multi-Chain**: Ethereum, Polygon, Celo, Arbitrum, Optimism, Base
- 🔄 **Cross-Chain Swaps**: Transferencias entre redes usando 1inch Aqua
- ⚡ **Dos Modos de Operación**:
  - **Web Mode**: Interacción directa con blockchain usando wagmi
  - **API Mode**: Procesamiento a través de tu backend
- 🎯 **Type-Safe**: TypeScript completo con tipos estrictos
- 🧩 **Componentes Atómicos**: Componentes reutilizables para operaciones comunes
- 🔌 **Pluggable Adapters**: Sistema extensible de adaptadores

## 📦 Instalación

```bash
npm install bridjet wagmi viem @tanstack/react-query @web3modal/wagmi @1inch/cross-chain-sdk ethers
```

## 🚀 Quick Start

### 1. Configurar variables de entorno

```env
VITE_WALLETCONNECT_PROJECT_ID=tu_project_id
VITE_1INCH_API_KEY=tu_api_key
```

### 2. Configurar Bridjet

```tsx
import { setupBridjet, BridjetProvider } from 'bridjet'

setupBridjet({
  providers: {
    types: ['celo', 'worldcoin', 'farcaster'],
    defaultType: 'celo',
  },
  api: {
    baseUrl: 'https://api.tu-backend.com',
  },
})

function App() {
  return (
    <BridjetProvider>
      {/* Tu app aquí */}
    </BridjetProvider>
  )
}
```

### 3. Conectar Wallet

```tsx
import { WalletConnector } from 'bridjet'

function ConnectWallet() {
  return (
    <WalletConnector>
      {({ isConnected, address, connectors, connect, disconnect }) => (
        <div>
          {!isConnected ? (
            connectors.map(c => (
              <button key={c.id} onClick={() => connect(c.id)}>
                {c.name}
              </button>
            ))
          ) : (
            <div>
              <p>{address}</p>
              <button onClick={disconnect}>Disconnect</button>
            </div>
          )}
        </div>
      )}
    </WalletConnector>
  )
}
```

### 4. Enviar Pagos

#### Modo Web (wagmi directo)

```tsx
import { SendPaymentWeb } from 'bridjet'

function Payment() {
  return (
    <SendPaymentWeb
      payload={{
        recipient: '0x...',
        amount: '0.1',
        chainName: 'celo',
      }}
      onSuccess={(r) => console.log('TX:', r.txHash)}
    >
      {({ send, isLoading, needsChainSwitch, switchChain }) => (
        <div>
          {needsChainSwitch && (
            <button onClick={switchChain}>Switch Network</button>
          )}
          <button onClick={send} disabled={isLoading}>
            Send Payment
          </button>
        </div>
      )}
    </SendPaymentWeb>
  )
}
```

#### Modo API (backend)

```tsx
import { SendPaymentAPI } from 'bridjet'

function PaymentAPI() {
  return (
    <SendPaymentAPI
      payload={{
        recipient: '0x...',
        amount: '0.1',
        chainName: 'celo',
      }}
      onSuccess={(r) => console.log('Processed:', r)}
    >
      {({ send, isLoading }) => (
        <button onClick={send} disabled={isLoading}>
          Send via API
        </button>
      )}
    </SendPaymentAPI>
  )
}
```

### 5. Transferencias Cross-Chain

```tsx
import { SendTokensWeb } from 'bridjet'

function CrossChainTransfer() {
  return (
    <SendTokensWeb
      payload={{
        recipient: '0x...',
        amount: '100',
        tokenAddress: '0xUSDCPolygon',
        toTokenAddress: '0xUSDCEthereum',
        fromChainName: 'polygon',
        toChainName: 'ethereum',
        enableCrossChain: true, // ⚡ Cross-chain via 1inch
        decimals: 6,
      }}
      onSuccess={(r) => console.log('Cross-chain TX:', r.txHash)}
    >
      {({ send, isLoading, isCrossChain }) => (
        <div>
          {isCrossChain && <p>⚠️ Cross-chain via 1inch Aqua</p>}
          <button onClick={send} disabled={isLoading}>
            Send Cross-Chain
          </button>
        </div>
      )}
    </SendTokensWeb>
  )
}
```

## 📚 Documentación Completa

Ver [USAGE_GUIDE.md](./USAGE_GUIDE.md) para ejemplos detallados y documentación completa.

## 🌐 Redes Soportadas

| Red | Chain ID | Nativo |
|-----|----------|--------|
| Ethereum | 1 | ETH |
| Polygon | 137 | MATIC |
| Celo | 42220 | CELO |
| Celo Alfajores | 44787 | CELO |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| Base | 8453 | ETH |

## 💼 Wallets Soportadas

- 🦊 MetaMask
- 🔗 WalletConnect (todas las wallets compatibles)
- 🔵 Coinbase Wallet
- 💼 Cualquier wallet con inyección web3

## 🛠️ Componentes Disponibles

### Modo Web (wagmi)
- `SendPaymentWeb` - Enviar moneda nativa
- `SendTokensWeb` - Enviar tokens ERC20 (con cross-chain)
- `SendContractActionWeb` - Ejecutar funciones de contratos
- `WalletConnector` - Conectar/desconectar wallets

### Modo API (backend)
- `SendPaymentAPI` - Enviar pagos vía API
- `SendTokensAPI` - Enviar tokens vía API
- `SendContractActionAPI` - Ejecutar contratos vía API

### Hooks de Wagmi
Bridjet re-exporta todos los hooks de wagmi:
```tsx
import { 
  useAccount, 
  useBalance, 
  useSwitchChain,
  useReadContract,
  useWriteContract 
} from 'bridjet'
```

## 🔧 Configuración

```typescript
setupBridjet({
  providers: {
    types: ['celo', 'worldcoin', 'farcaster', 'lemon'],
    defaultType: 'celo',
  },
  api: {
    baseUrl: 'https://api.example.com',
    endpoints: {
      sendPayment: '/blockchain/payment',
      sendToken: '/blockchain/token/transfer',
      sendContractAction: '/blockchain/contract/action',
    },
  },
})
```

## 📖 Ejemplos

Ver `src/App-example.tsx` para un ejemplo completo con:
- Conexión de wallets
- Envío de pagos nativos
- Transferencias de tokens
- Swaps cross-chain
- Cambio de redes
- Información de cuenta

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 🔗 Links Útiles

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [1inch Aqua SDK](https://github.com/1inch/sdks/tree/master/typescript/aqua)
- [WalletConnect](https://walletconnect.com/)

## 💬 Soporte

- Issues: [GitHub Issues](https://github.com/your-repo/bridjet/issues)
- Discord: [Tu servidor de Discord]
- Email: support@bridjet.app

---

Hecho con ❤️ por el equipo de Bridjet
