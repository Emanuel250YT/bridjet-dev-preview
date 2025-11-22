import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { 
  mainnet, 
  polygon, 
  celo, 
  celoAlfajores, 
  arbitrum, 
  optimism, 
  base,
  avalanche,
  bsc,
  linea,
  gnosis,
  zkSync
} from 'wagmi/chains'
import { defineChain } from 'viem'

// Project ID de WalletConnect - debe ser configurado por el usuario
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

// Definir chains custom que no están en wagmi por defecto
export const sonic = defineChain({
  id: 146,
  name: 'Sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
    public: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'Sonicscan', url: 'https://sonicscan.org' },
  },
  contracts: {
    multicall3: {
      address: '0x499943e74fb0ce105688beee8ef2abec5d936d31',
    },
  },
})

export const unichain = defineChain({
  id: 1301,
  name: 'Unichain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.unichain.org'] },
    public: { http: ['https://sepolia.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://sepolia.uniscan.xyz' },
  },
  contracts: {
    multicall3: {
      address: '0x499943e74fb0ce105688beee8ef2abec5d936d31',
    },
  },
})

// Configurar las chains soportadas por 1inch Fusion+
export const supportedChains = [
  mainnet,         // Ethereum Mainnet
  base,            // Base
  optimism,        // Optimism
  polygon,         // Polygon
  arbitrum,        // Arbitrum
  avalanche,       // Avalanche
  bsc,             // Binance Smart Chain
  linea,           // Linea
  sonic,           // Sonic
  unichain,        // Unichain
  gnosis,          // Gnosis
  zkSync,          // zkSync
  celo,            // Celo (adicional)
  celoAlfajores,   // Celo Alfajores (testnet)
] as const

// Metadata de la aplicación
export const metadata = {
  name: 'Bridjet',
  description: 'Multi-chain payment and blockchain operations platform',
  url: 'https://bridjet.app',
  icons: ['https://bridjet.app/icon.png'],
}

// Configuración de wagmi con RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: metadata.name,
  projectId,
  chains: supportedChains,
  ssr: false,
})

// Helper para obtener chain por ID
export function getChainById(chainId: number) {
  return supportedChains.find(chain => chain.id === chainId)
}

// Helper para validar si una chain está soportada
export function isChainSupported(chainId: number): boolean {
  return supportedChains.some(chain => chain.id === chainId)
}

// Mapeo de nombres de red a chain IDs
export const chainNameToId: Record<string, number> = {
  ethereum: mainnet.id,
  mainnet: mainnet.id,
  polygon: polygon.id,
  celo: celo.id,
  'celo-alfajores': celoAlfajores.id,
  alfajores: celoAlfajores.id,
  arbitrum: arbitrum.id,
  optimism: optimism.id,
  base: base.id,
  avalanche: avalanche.id,
  avax: avalanche.id,
  bsc: bsc.id,
  'binance-smart-chain': bsc.id,
  bnb: bsc.id,
  linea: linea.id,
  sonic: sonic.id,
  unichain: unichain.id,
  gnosis: gnosis.id,
  xdai: gnosis.id,
  zksync: zkSync.id,
  'zk-sync': zkSync.id,
}

// Mapeo de chain IDs a contrato de 1inch Fusion+
export const oneInchFusionContracts: Record<number, string> = {
  [mainnet.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',      // Ethereum
  [base.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',         // Base
  [optimism.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',     // Optimism
  [polygon.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',      // Polygon
  [arbitrum.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',     // Arbitrum
  [avalanche.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',    // Avalanche
  [bsc.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',          // BSC
  [linea.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',        // Linea
  [sonic.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',        // Sonic
  [unichain.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',     // Unichain
  [gnosis.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',       // Gnosis
  [zkSync.id]: '0x499943e74fb0ce105688beee8ef2abec5d936d31',       // zkSync
}

// Helper para obtener el contrato de 1inch Fusion+ en una red
export function getOneInchContract(chainId: number): string | undefined {
  return oneInchFusionContracts[chainId]
}

// Helper para verificar si una red soporta 1inch Fusion+
export function supportsOneInch(chainId: number): boolean {
  return chainId in oneInchFusionContracts
}

// Helper para obtener chain por nombre
export function getChainByName(name: string) {
  const chainId = chainNameToId[name.toLowerCase()]
  if (!chainId) return undefined
  return getChainById(chainId)
}
