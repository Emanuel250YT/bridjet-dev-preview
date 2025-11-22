import type { ReactNode } from 'react'
import { BridjetComponent } from '../BridjetComponent'

/**
 * Farcaster Native Wrapper
 * 
 * Re-exports from @farcaster/miniapp-sdk
 * Full MiniApp SDK with Frame integration
 */

// Re-export everything from Farcaster MiniApp SDK
export * from '@farcaster/miniapp-sdk'
import sdk from '@farcaster/miniapp-sdk'

// Export default SDK instance
export { sdk as FarcasterSDK }
export default sdk

/**
 * Check if running in Farcaster environment
 */
export function isFarcasterEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for Farcaster-specific indicators
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('farcaster') || userAgent.includes('warpcast')
}

/**
 * Farcaster Native Wrapper Component
 * Conditionally renders children only in Farcaster environments
 */
export function FarcasterNativeWrapper({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <BridjetComponent provider="farcaster" fallback={fallback}>
      {children}
    </BridjetComponent>
  )
}

/**
 * Farcaster Component - Alias for easier usage
 */
export const FarcasterComponent = FarcasterNativeWrapper
