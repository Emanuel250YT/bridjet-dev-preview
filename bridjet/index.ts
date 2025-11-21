export { BridjetProvider, useBridjet } from './BridjetProvider'
export type { BridjetProviderType } from './BridjetProvider'
export { BridjetComponent } from './BridjetComponent'

export {
  setupBridjet,
  getBridjetConfig,
  requireBridjetConfig,
  type BridjetConfig,
} from './config'

export {
  SwitchAdapter,
  createSwitchAdapter,
  getSwitchAdapter,
  createRoutingRules,
  type SwitchAdapterConfig,
  type RoutingRule,
  type AdapterRequest,
  type SwitchResponse,
} from './adapters/switch-adapter.ts'

export {
  AdapterFactory,
  initializeDefaultAdapters,
  getAdapterRegistry,
  setupAdapters,
  AdapterRegistry,
} from './adapters/adapter-registry'

export type {
  ProviderAdapter,
  ProviderConfig,
  AdapterOptions,
} from './adapters/base-adapter'

export { WorldCoinAdapter } from './adapters/worldcoin-adapter'
export { LemonAdapter } from './adapters/lemon-adapter'
export { FarcasterAdapter } from './adapters/farcaster-adapter'
export { BaseAdapter } from './adapters/base-adapter-provider'
export { RostockAdapter } from './adapters/rostock-adapter'
export { XMTPAdapter } from './adapters/xmtp-adapter'

