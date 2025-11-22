import type { ReactNode } from 'react'
import { BridjetComponent } from '../BridjetComponent'

/**
 * Lemon Native Wrapper
 * 
 * Re-exports from @lemoncash/mini-app-sdk
 * Lemon Cash MiniApp SDK for deposits, withdrawals, and smart contract calls
 */

// Re-export everything from Lemon MiniApp SDK
export {
  // Main functions
  authenticate,
  deposit,
  withdraw,
  callSmartContract,
  isWebView,
  
  // Types
  type Address,
  type Hex,
  type MiniAppError,
  type Permit,
  type ContractParams,
  
  // WebView Actions
  WebViewAction,
  type WebViewMessage,
  type AuthenticateMessage,
  type AuthenticateData,
  type DepositMessage,
  type DepositData,
  type WithdrawMessage,
  type WithdrawData,
  type CallSmartContractMessage,
  type CallSmartContractData,
  
  // App Responses
  ActionResponse,
  TransactionResult,
  type AppMessage,
  type AuthenticateResponse,
  type DepositResponse,
  type WithdrawResponse,
  type CallSmartContractResponse,
  
  // Enums
  ChainId,
  TokenName,
  ContractStandard,
} from '@lemoncash/mini-app-sdk'

/**
 * Check if running in Lemon environment
 */
export function isLemonEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if running in Lemon WebView
  return !!window.ReactNativeWebView
}

/**
 * Lemon Native Wrapper Component
 * Conditionally renders children only in Lemon environments
 */
export function LemonNativeWrapper({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <BridjetComponent provider="lemon" fallback={fallback}>
      {children}
    </BridjetComponent>
  )
}

/**
 * Lemon Component - Alias for easier usage
 */
export const LemonComponent = LemonNativeWrapper
