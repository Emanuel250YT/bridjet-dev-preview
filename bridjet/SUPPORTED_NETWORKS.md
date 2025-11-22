# 🌐 Redes Soportadas por Bridjet

Bridjet ahora soporta **todas las redes de 1inch Fusion+** para operaciones cross-chain.

## ✅ Redes Soportadas

| Red | Chain ID | 1inch Fusion+ Contract | Símbolo Nativo |
|-----|----------|------------------------|----------------|
| **Ethereum Mainnet** | 1 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Base** | 8453 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Optimism** | 10 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Polygon** | 137 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | MATIC |
| **Arbitrum** | 42161 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Avalanche** | 43114 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | AVAX |
| **Binance Smart Chain** | 56 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | BNB |
| **Linea** | 59144 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Sonic** | 146 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | S |
| **Unichain** | 1301 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Gnosis** | 100 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | xDAI |
| **zkSync** | 324 | `0x499943e74fb0ce105688beee8ef2abec5d936d31` | ETH |
| **Celo** | 42220 | N/A | CELO |
| **Celo Alfajores** | 44787 | N/A | CELO |

> **Nota:** Celo y Celo Alfajores están incluidas para operaciones dentro de su propia red, pero pueden no soportar cross-chain con 1inch.

## 🔧 Uso en Código

### Verificar si una red soporta 1inch Fusion+

```typescript
import { supportsOneInch } from '../bridjet'

const isSupported = supportsOneInch(1) // true para Ethereum
const notSupported = supportsOneInch(42220) // false para Celo
```

### Obtener el contrato de 1inch en una red

```typescript
import { getOneInchContract } from '../bridjet'

const contract = getOneInchContract(1) // '0x499943e74fb0ce105688beee8ef2abec5d936d31'
```

### Usar nombres de red

```typescript
import { getChainByName, chainNameToId } from '../bridjet'

// Por nombre
const chain = getChainByName('avalanche')
console.log(chain?.id) // 43114

// Por alias
const chainId = chainNameToId['avax'] // 43114
const chainId2 = chainNameToId['bnb'] // 56 (BSC)
```

### Verificar si dos redes son compatibles

```typescript
import { crossChainService } from '../bridjet'

const compatible = crossChainService.areNetworksCompatible(1, 8453)
// false - diferentes redes

const sameNetwork = crossChainService.areNetworksCompatible(1, 1)
// true - misma red
```

## 🌉 Operaciones Cross-Chain

### Ejemplo: Enviar tokens de Ethereum a Base

```typescript
import { SendTokensWeb, type Address } from '../bridjet'

<SendTokensWeb
  payload={{
    recipient: '0x...' as Address,
    amount: '100',
    tokenAddress: '0x...' as Address, // USDC en Ethereum
    fromChainName: 'ethereum',
    toChainName: 'base',
    enableCrossChain: true,
    decimals: 6,
  }}
  onSuccess={(response) => {
    console.log('Cross-chain swap iniciado:', response.txHash)
  }}
>
  {({ send, isLoading, isCrossChain }) => (
    <button onClick={send} disabled={isLoading}>
      {isCrossChain ? '🌉 Enviar Cross-Chain' : '💸 Enviar'}
    </button>
  )}
</SendTokensWeb>
```

### Ejemplo: Enviar desde Avalanche a Polygon

```typescript
<SendTokensWeb
  payload={{
    recipient: recipientAddress,
    amount: '50',
    tokenAddress: avaxUsdcAddress,
    fromChainName: 'avalanche', // ✅ Soportado
    toChainName: 'polygon',      // ✅ Soportado
    enableCrossChain: true,
    decimals: 6,
  }}
  // ...
/>
```

### Ejemplo: Enviar desde BSC a Sonic

```typescript
<SendTokensWeb
  payload={{
    recipient: recipientAddress,
    amount: '1000',
    tokenAddress: bscUsdtAddress,
    fromChainName: 'bsc',       // ✅ Soportado
    toChainName: 'sonic',       // ✅ Soportado
    enableCrossChain: true,
    decimals: 18,
  }}
  // ...
/>
```

## 🔍 Aliases de Redes

Puedes usar diferentes nombres para referirte a las mismas redes:

```typescript
// Ethereum
'ethereum' | 'mainnet'

// Polygon
'polygon'

// Binance Smart Chain
'bsc' | 'binance-smart-chain' | 'bnb'

// Avalanche
'avalanche' | 'avax'

// Gnosis
'gnosis' | 'xdai'

// zkSync
'zksync' | 'zk-sync'

// Celo
'celo'

// Celo Testnet
'celo-alfajores' | 'alfajores'
```

## 📊 Estadísticas

- **Total de redes:** 14
- **Con soporte 1inch Fusion+:** 12
- **Testnets:** 1 (Celo Alfajores)
- **EVM Compatible:** 14/14 (100%)

## 🚀 Agregar Nuevas Redes

Si necesitas agregar una red personalizada:

```typescript
// bridjet/wagmi-config.ts
import { defineChain } from 'viem'

export const miRedCustom = defineChain({
  id: 12345,
  name: 'Mi Red Custom',
  nativeCurrency: {
    decimals: 18,
    name: 'Token',
    symbol: 'TKN',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mired.com'] },
    public: { http: ['https://rpc.mired.com'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.mired.com' },
  },
})

// Agregar a supportedChains
export const supportedChains = [
  mainnet,
  // ... otras redes
  miRedCustom,
] as const
```

## 📝 Notas Importantes

### 1inch Fusion+ Limitations

- **Mismo contrato en todas las redes:** `0x499943e74fb0ce105688beee8ef2abec5d936d31`
- **Requiere API Key:** Configura `VITE_1INCH_API_KEY` en tu `.env`
- **Slippage:** Ten en cuenta el slippage en operaciones cross-chain

### Gas Optimization

- Las operaciones cross-chain consumen más gas que las operaciones en una sola red
- Usa `estimateGas()` antes de ejecutar transacciones grandes
- Considera usar L2s (Base, Optimism, Arbitrum) para menores fees

### Security

- Siempre verifica las direcciones de contratos
- Usa allowlists para tokens conocidos
- Implementa límites de transacción para seguridad

## 🐛 Troubleshooting

### Red no soportada

```typescript
if (!supportsOneInch(chainId)) {
  console.error('Red no soporta 1inch Fusion+')
  // Fallback a transferencia directa
}
```

### Contract no encontrado

```typescript
const contract = getOneInchContract(chainId)
if (!contract) {
  throw new Error('No hay contrato de 1inch en esta red')
}
```

### RPC Issues

Si tienes problemas con RPCs públicos, configura RPCs custom:

```typescript
// vite.config.ts o wagmi-config.ts
rpcUrls: {
  default: { http: ['https://tu-rpc-custom.com'] },
}
```

## 📚 Referencias

- [1inch Fusion+ Docs](https://docs.1inch.io/docs/fusion-swap/introduction)
- [1inch SDK GitHub](https://github.com/1inch/cross-chain-sdk)
- [Wagmi Chains](https://wagmi.sh/react/chains)
- [Viem Chains](https://viem.sh/docs/chains/introduction)

---

**¿Necesitas agregar soporte para una red específica?** Abre un issue en el repositorio.
