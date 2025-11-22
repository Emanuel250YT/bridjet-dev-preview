export { BridjetProvider, useBridjet } from './BridjetProvider'
export type { BridjetProviderType } from './BridjetProvider'
export { BridjetComponent } from './BridjetComponent'
export { BridjetSession, useBridjetSession, useBridjetAuthHeaders, useBridjetRequest } from './BridjetSession'

export {
  authService,
  getAuthService,
  type User,
  type SignInCredentials,
  type SignUpData,
  type AuthResponse,
} from './auth-service'

export {
  blockchainService,
  getBlockchainService,
  type WalletData,
  type ContractActionPayload,
  type PaymentPayload,
  type TokenTransferPayload,
  type CreateWalletPayload,
  type AddWalletPayload,
  type TransactionResponse,
  type WalletResponse,
} from './blockchain-service'

export {
  useBridjetBlockchain,
} from './BridjetBlockchain'

// Blockchain Atomic Components
export {
  SendContractAction,
  SendPayment,
  SendTokens,
  CreateWallet,
  AddWallet,
  // Web Components (wagmi)
  SendPaymentWeb,
  SendTokensWeb,
  SendContractActionWeb,
  // API Components
  SendPaymentAPI,
  SendTokensAPI,
  SendContractActionAPI,
  // Wallet Connector
  WalletConnector,
} from './components'

export type {
  SendPaymentWebPayload,
  SendPaymentWebResponse,
  SendTokensWebPayload,
  SendTokensWebResponse,
  SendContractActionWebPayload,
  SendContractActionWebResponse,
} from './components/web'

export type {
  SendPaymentAPIPayload,
  SendTokensAPIPayload,
  SendContractActionAPIPayload,
} from './components/api'

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
export { CeloAdapter } from './adapters/celo-adapter'
// TEMPORARILY DISABLED - Incompatibility issues
// export { RostockAdapter } from './adapters/rostock-adapter'
// export { XMTPAdapter } from './adapters/xmtp-adapter'

// Native SDK Exports - Re-exports de SDKs nativos de cada proveedor
export * from './native'

// Export default provider types constant
export { DEFAULT_PROVIDER_TYPES } from './config'

// Wagmi configuration and utilities
export {
  wagmiConfig,
  supportedChains,
  getChainById,
  isChainSupported,
  getChainByName,
  chainNameToId,
  metadata as wagmiMetadata,
  // Custom chains
  sonic,
  unichain,
  // 1inch Fusion+ utilities
  oneInchFusionContracts,
  getOneInchContract,
  supportsOneInch,
} from './wagmi-config'

// Cross-chain service (1inch Aqua)
export {
  crossChainService,
  getCrossChainService,
  type CrossChainQuoteParams,
  type CrossChainQuote,
  type SwapExecutionResult,
} from './services/cross-chain-service'

// Re-export wagmi hooks for convenience
export {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useBalance,
  useReadContract,
  useWriteContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi'

// Re-export RainbowKit components
export { ConnectButton } from '@rainbow-me/rainbowkit'
export type { Address } from 'viem'

