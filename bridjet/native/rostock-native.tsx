/**
 * Rootstock (RSK) Native Wrapper
 * 
 * ⚠️ TEMPORARILY DISABLED
 * This adapter is currently disabled to avoid compatibility issues.
 * Will be re-enabled when proper SDK integration is ready.
 */

// Placeholder exports - Rootstock adapter temporarily disabled
export interface RootstockConfig {
  disabled: true
}

/**
 * @deprecated Rootstock adapter is temporarily disabled
 */
export function useRootstock() {
  console.warn('Rootstock adapter is temporarily disabled')
  return {
    disabled: true,
    wallet: null,
    isConnected: false,
    connect: async () => { throw new Error('Rootstock temporarily disabled') },
    disconnect: async () => { throw new Error('Rootstock temporarily disabled') },
  }
}

/**
 * @deprecated Rootstock adapter is temporarily disabled
 */
export function RootstockNativeWrapper({ children: _children }: { children: React.ReactNode }) {
  console.warn('Rootstock adapter is temporarily disabled')
  return null
}

/**
 * @deprecated Rootstock adapter is temporarily disabled
 */
export const RootstockComponent = RootstockNativeWrapper
