/**
 * XMTP Native Wrapper
 * 
 * ⚠️ TEMPORARILY DISABLED
 * This adapter is currently disabled to avoid compatibility issues.
 * Will be re-enabled when proper SDK integration is ready.
 */

// Placeholder exports - XMTP adapter temporarily disabled
export interface XMTPConfig {
  disabled: true
}

/**
 * @deprecated XMTP adapter is temporarily disabled
 */
export function useXMTP() {
  console.warn('XMTP adapter is temporarily disabled')
  return {
    disabled: true,
    messages: [],
    isConnected: false,
    sendMessage: async () => { throw new Error('XMTP temporarily disabled') },
    connect: async () => { throw new Error('XMTP temporarily disabled') },
    disconnect: async () => { throw new Error('XMTP temporarily disabled') },
  }
}

/**
 * @deprecated XMTP adapter is temporarily disabled
 */
export function XMTPNativeWrapper({ children: _children }: { children: React.ReactNode }) {
  console.warn('XMTP adapter is temporarily disabled')
  return null
}

/**
 * @deprecated XMTP adapter is temporarily disabled
 */
export const XMTPComponent = XMTPNativeWrapper
