import type { ReactNode } from 'react'
import { BridjetComponent } from '../BridjetComponent'

/**
 * Re-exporta todos los componentes y utilidades del MiniKit SDK de WorldCoin
 * Los usuarios pueden importar directamente desde bridjet en lugar del SDK original
 * 
 * Ejemplo:
 * import { NativeWorldCoinMiniKit, MiniKit, Tokens } from 'bridjet'
 */

// Re-exportar todo el SDK de WorldCoin MiniKit
export {
  MiniKit,
  // Commands & Types
  type VerifyCommandInput,
  type VerifyCommandPayload,
  type PayCommandInput,
  type PayCommandPayload,
  type WalletAuthInput,
  type WalletAuthPayload,
  type SendTransactionInput,
  type SendTransactionPayload,
  type SignMessageInput,
  type SignMessagePayload,
  type SignTypedDataInput,
  type SignTypedDataPayload,
  type ShareContactsInput,
  type ShareContactsPayload,
  type RequestPermissionInput,
  type RequestPermissionPayload,
  type GetPermissionsInput,
  type GetPermissionsPayload,
  type SendHapticFeedbackInput,
  type SendHapticFeedbackPayload,
  type ShareInput,
  type SharePayload,
  
  // Response Types
  type MiniAppVerifyActionPayload,
  type MiniAppVerifyActionSuccessPayload,
  type MiniAppVerifyActionErrorPayload,
  type MiniAppPaymentPayload,
  type MiniAppPaymentSuccessPayload,
  type MiniAppPaymentErrorPayload,
  type MiniAppWalletAuthPayload,
  type MiniAppWalletAuthSuccessPayload,
  type MiniAppWalletAuthErrorPayload,
  type MiniAppSendTransactionPayload,
  type MiniAppSendTransactionSuccessPayload,
  type MiniAppSendTransactionErrorPayload,
  type MiniAppSignMessagePayload,
  type MiniAppSignMessageSuccessPayload,
  type MiniAppSignMessageErrorPayload,
  type MiniAppSignTypedDataPayload,
  type MiniAppSignTypedDataSuccessPayload,
  type MiniAppSignTypedDataErrorPayload,
  type MiniAppShareContactsPayload,
  type MiniAppShareContactsSuccessPayload,
  type MiniAppShareContactsErrorPayload,
  type MiniAppRequestPermissionPayload,
  type MiniAppRequestPermissionSuccessPayload,
  type MiniAppRequestPermissionErrorPayload,
  type MiniAppGetPermissionsPayload,
  type MiniAppGetPermissionsSuccessPayload,
  type MiniAppGetPermissionsErrorPayload,
  type MiniAppSendHapticFeedbackPayload,
  type MiniAppSendHapticFeedbackSuccessPayload,
  type MiniAppSendHapticFeedbackErrorPayload,
  type MiniAppSharePayload,
  type MiniAppShareSuccessPayload,
  type MiniAppShareErrorPayload,
  
  // User & Device
  type User,
  type UserNameService,
  type DeviceProperties,
  type Contact,
  
  // Enums
  Command,
  ResponseEvent,
  Tokens,
  Network,
  Permission,
  
  // Error Codes & Messages
  PaymentErrorCodes,
  PaymentErrorMessage,
  PaymentValidationErrors,
  WalletAuthErrorCodes,
  WalletAuthErrorMessage,
  SendTransactionErrorCodes,
  SendTransactionErrorMessage,
  SignMessageErrorCodes,
  SignMessageErrorMessage,
  SignTypedDataErrorCodes,
  SignTypedDataErrorMessage,
  MiniKitInstallErrorCodes,
  MiniKitInstallErrorMessage,
  ShareContactsErrorCodes,
  ShareContactsErrorMessage,
  RequestPermissionErrorCodes,
  RequestPermissionErrorMessage,
  GetPermissionsErrorCodes,
  GetPermissionsErrorMessage,
  SendHapticFeedbackErrorCodes,
  SendHapticFeedbackErrorMessage,
  ShareFilesErrorCodes,
  ShareFilesErrorMessage,
  MicrophoneErrorCodes,
  MicrophoneErrorMessage,
  VerificationErrorMessage,
  
  // Other Types
  type TokensPayload,
  TokenDecimals,
  type MiniKitInstallReturnType,
  type PermissionSettings,
  type SiweMessage,
  type EventHandler,
  type EventPayload,
  type AsyncHandlerReturn,
  type CommandReturnPayload,
  type WebViewBasePayload,
  
  // Utilities from @worldcoin/idkit-core
  VerificationLevel,
  type ISuccessResult,
  
  // Backend verification
  verifyCloudProof,
  type IVerifyResponse,
  
  // SIWE utilities
  parseSiweMessage,
  verifySiweMessage,
  
  // Other utilities
  tokenToDecimals,
  getIsUserVerified,
} from '@worldcoin/minikit-js'

// También exportar bajo un namespace para compatibilidad
import * as WorldCoinMiniKitSDK from '@worldcoin/minikit-js'
export const NativeWorldCoinMiniKit = WorldCoinMiniKitSDK

// Wrapper component para componentes nativos de WorldCoin
interface WorldCoinNativeWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper que renderiza componentes nativos de WorldCoin solo cuando el provider es 'worldcoin'
 * 
 * Ejemplo de uso:
 * <WorldCoinNativeWrapper>
 *   <WorldCoinVerifyButton />
 *   <WorldCoinPaymentButton />
 * </WorldCoinNativeWrapper>
 */
export function WorldCoinNativeWrapper({ children, fallback }: WorldCoinNativeWrapperProps) {
  return (
    <BridjetComponent provider="worldcoin" fallback={fallback}>
      {children}
    </BridjetComponent>
  )
}

// Componentes específicos de WorldCoin con wrapper automático
interface WorldCoinComponentProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que embebe componentes nativos de WorldCoin con wrapper automático
 * Se renderiza solo cuando el provider activo es 'worldcoin'
 */
export function WorldCoinComponent({ children, fallback }: WorldCoinComponentProps) {
  return (
    <WorldCoinNativeWrapper fallback={fallback}>
      {children}
    </WorldCoinNativeWrapper>
  )
}

// Re-exportar el namespace para fácil acceso
export { NativeWorldCoinMiniKit as WorldCoin }

// Tipos de utilidad para TypeScript
export type WorldCoinMiniKitType = typeof NativeWorldCoinMiniKit
