import { createConfig, http } from 'wagmi'
import { mainnet, polygon, celo, celoAlfajores, arbitrum, optimism, base } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'



// Project ID de WalletConnect - debe ser configurado por el usuario
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

// Configurar las chains soportadas
export const supportedChains = [
  mainnet,
  polygon,
  celo,
  celoAlfajores,
  arbitrum,
  optimism,
  base,
] as const

// Metadata de la aplicación para WalletConnect
export const metadata = {
  name: 'Bridjet',
  description: 'Multi-chain payment and blockchain operations platform',
  url: 'https://bridjet.app',
  icons: ['https://bridjet.app/icon.png'],
}

// Configuración de wagmi
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({ 
      target: 'metaMask',
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
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
}

// Helper para obtener chain por nombre
export function getChainByName(name: string) {
  const chainId = chainNameToId[name.toLowerCase()]
  if (!chainId) return undefined
  return getChainById(chainId)
}
