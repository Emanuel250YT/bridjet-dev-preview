import { BridjetComponent } from '../BridjetComponent'

/**
 * Celo Native Wrapper
 * 
 * Re-exports from @celo/celo-composer
 * Note: @celo/celo-composer is primarily a CLI tool for project scaffolding.
 * For runtime Celo SDK usage, consider using @celo/contractkit or viem with Celo chains.
 */

// Celo Composer is a CLI tool, so we provide runtime utilities
export interface CeloConfig {
  network: 'mainnet' | 'alfajores' | 'baklava'
  rpcUrl?: string
}

// Celo chain IDs
export const CeloChainId = {
  MAINNET: 42220,
  ALFAJORES: 44787,
  BAKLAVA: 62320,
} as const

// Celo native token
export const CELO_TOKEN = 'CELO'
export const cUSD_TOKEN = 'cUSD'
export const cEUR_TOKEN = 'cEUR'

// Celo network configurations
export const CeloNetworks = {
  mainnet: {
    chainId: CeloChainId.MAINNET,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    explorer: 'https://explorer.celo.org',
  },
  alfajores: {
    chainId: CeloChainId.ALFAJORES,
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorer: 'https://alfajores.celoscan.io',
  },
  baklava: {
    chainId: CeloChainId.BAKLAVA,
    name: 'Celo Baklava Testnet',
    rpcUrl: 'https://baklava-forno.celo-testnet.org',
    explorer: 'https://baklava-blockscout.celo-testnet.org',
  },
} as const

export type CeloNetwork = keyof typeof CeloNetworks

/**
 * Helper function to get Celo network config
 */
export function getCeloNetwork(network: CeloNetwork) {
  return CeloNetworks[network]
}

/**
 * Check if running in Celo environment
 */
export function isCeloEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for Celo-specific indicators
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('celo') || userAgent.includes('valora')
}

/**
 * Celo Native Wrapper Component
 * Conditionally renders children only in Celo environments
 */
export function CeloNativeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BridjetComponent provider="celo">
      {children}
    </BridjetComponent>
  )
}

/**
 * Celo Component - Alias for easier usage
 */
export const CeloComponent = CeloNativeWrapper
