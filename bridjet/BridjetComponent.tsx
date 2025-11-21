import { type ReactNode } from 'react'
import { useBridjet, type BridjetProviderType } from './BridjetProvider'

interface BridjetComponentProps {
  provider: BridjetProviderType | BridjetProviderType[]
  children: ReactNode
  fallback?: ReactNode
}

export function BridjetComponent({ 
  provider, 
  children, 
  fallback = null 
}: BridjetComponentProps) {
  const { provider: currentProvider } = useBridjet()

  const shouldRender = Array.isArray(provider)
    ? provider.includes(currentProvider)
    : provider === currentProvider

  if (!shouldRender) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

