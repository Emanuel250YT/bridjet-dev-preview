# 🌉 Bridjet - Multi-Chain Web3 Payment Framework

Bridjet es un framework de React para construir aplicaciones de pagos y operaciones blockchain multi-cadena con soporte para múltiples wallets (MetaMask, WalletConnect, Coinbase) y transferencias cross-chain usando 1inch.

## ⚠️ Cambios Importantes v2.0

La versión 2.0 introduce cambios importantes en la arquitectura:

- **✅ API Keys como parámetros**: Ya no se detectan automáticamente desde variables de entorno
- **✅ Framework-agnostic**: Compatible con Vite, Next.js, CRA, Webpack, etc.
- **✅ Componentes simplificados**: Eliminados componentes legacy innecesarios
- **✅ Nuevo endpoint universal**: `/api/wallet/transfer` para transferencias, swaps y bridges

**📖 Consulta la [Guía de Migración](./MIGRATION_GUIDE.md) si actualizas desde v1.x**

## ✨ Características

- 🦊 **Multi-Wallet**: MetaMask, WalletConnect, Coinbase Wallet y más
- 🌐 **Multi-Chain**: Ethereum, Polygon, Celo, Arbitrum, Optimism, Base
- 🔄 **Universal Transfer API**: Transferencias nativas, swaps y bridges en un solo endpoint
- ⚡ **Componentes Web**: Interacción directa con blockchain usando wagmi
- 🎯 **Type-Safe**: TypeScript completo con tipos estrictos
- 🧩 **Componentes Atómicos**: Componentes reutilizables para operaciones comunes
- 🔌 **Pluggable**: Sistema extensible de adaptadores y servicios
- 🛠️ **Framework-agnostic**: Funciona con Vite, Next.js, CRA, etc.

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

## 📚 Documentación

- 📘 **[Guía de Migración v2.0](./MIGRATION_GUIDE.md)** - Cómo migrar desde v1.x
- 📗 **[API de Transferencias](./TRANSACTION_API.md)** - Documentación del endpoint universal
- 📙 **[Guía de Uso Completa](./USAGE_GUIDE.md)** - Ejemplos detallados (si existe)

## 🚀 Quick Start con Transfer API

### 1. Configurar variables de entorno

```env
# .env
VITE_1INCH_API_KEY=tu_api_key_aqui
```

### 2. Usar el servicio de transferencias

```typescript
import { getTransferService } from 'bridjet/services/transfer-service'

const apiKey = import.meta.env.VITE_1INCH_API_KEY

const transferService = getTransferService()

const result = await transferService.prepareTransfer({
  from: '0xYourAddress',
  to: '0xRecipient',
  amount: '1000000000000000', // 0.001 ETH en wei
  fromChainId: 8453, // Base
  toChainId: 8453,
  fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
  toToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',   // USDC
  slippage: 1,
  apiKey, // ⚠️ Requerido
})

// Ejecutar transacción con wallet
const tx = await wallet.sendTransaction({
  to: result.transaction.to,
  data: result.transaction.data,
  value: result.transaction.value,
})
```

### 3. Usar el endpoint HTTP

```typescript
const response = await fetch('http://localhost:5173/api/wallet/transfer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: '0xYourAddress',
    to: '0xRecipient',
    amount: '1000000000000000',
    fromChainId: 8453,
    toChainId: 8453,
    fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    toToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    slippage: 1,
    apiKey: import.meta.env.VITE_1INCH_API_KEY,
  }),
})

const result = await response.json()
// result contiene la transacción lista para firmar
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

### Componentes Web (wagmi)
- `UniversalSwap` - Swap universal (mismo chain, cross-chain, o directo)
- `SwapTokensWeb` - Swap de tokens en la misma red
- `SendTokensWeb` - Enviar tokens ERC20 (con soporte cross-chain)
- `SendPaymentWeb` - Enviar moneda nativa
- `SendContractActionWeb` - Ejecutar funciones de contratos
- `WalletConnector` - Conectar/desconectar wallets

### Servicios
- `TransferService` - Servicio unificado para transferencias, swaps y bridges
- `SwapService` - Servicio de swaps usando 1inch
- `CrossChainService` - Servicio de operaciones cross-chain
- `WalletService` - Utilidades para wallets

**⚠️ Nota:** Los componentes API y legacy fueron eliminados en v2.0

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
