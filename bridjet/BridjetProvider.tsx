import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { requireBridjetConfig } from './config'
import { getAdapterRegistry, initializeDefaultAdapters, setupAdapters } from './adapters/adapter-registry'
import { wagmiConfig } from './wagmi-config'

export type BridjetProviderType = string | null

interface BridjetContextType {
  provider: BridjetProviderType
  host: string
  apiBaseUrl: string
  apiEndpoints: {
    signIn: string
    signOut: string
    signUp: string
    refreshToken: string
    validateToken: string
    profile: string
  }
}

// QueryClient para React Query (requerido por wagmi)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const BridjetContext = createContext<BridjetContextType | undefined>(undefined)

interface BridjetProviderProps {
  children: ReactNode
}

function getDefaultDetectProvider(providerTypes: readonly string[]): (host: string) => string | null {
  return (host: string): string | null => {
    for (const providerType of providerTypes) {
      if (host.includes(`${providerType}.`)) {
        return providerType
      }
    }
    return null
  }
}

function detectProviderSync(config: ReturnType<typeof requireBridjetConfig>): { provider: BridjetProviderType; host: string } {
  if (typeof window === 'undefined') {
    return { provider: config.providers.defaultType || null, host: '' }
  }

  const currentHost = window.location.host
  
  const detectFn = config.providers.detectProvider || getDefaultDetectProvider(config.providers.types)
  const detectedProvider = detectFn(currentHost) || config.providers.defaultType || null
  
  return { provider: detectedProvider, host: currentHost }
}

export function BridjetProvider({ children }: BridjetProviderProps) {
  const config = requireBridjetConfig()
  
  const initialDetection = detectProviderSync(config)
  const [provider, setProvider] = useState<BridjetProviderType>(initialDetection.provider)
  const [host, setHost] = useState<string>(initialDetection.host)

  const apiBaseUrl = config.api?.baseUrl || ''
  const apiEndpoints = {
    signIn: config.api?.endpoints?.signIn || '/auth/signin',
    signOut: config.api?.endpoints?.signOut || '/auth/signout',
    signUp: config.api?.endpoints?.signUp || '/auth/signup',
    refreshToken: config.api?.endpoints?.refreshToken || '/auth/refresh',
    validateToken: config.api?.endpoints?.validateToken || '/auth/validate',
    profile: config.api?.endpoints?.profile || '/auth/profile',
  }

  useEffect(() => {
    if (config.autoInitializeAdapters !== false) {
      initializeDefaultAdapters()
    }

    if (config.providers.adapters && config.providers.adapters.length > 0) {
      setupAdapters(config.providers.adapters)
    }

    if (typeof window !== 'undefined') {
      const currentHost = window.location.host
      const registry = getAdapterRegistry()
      
      let detectedProvider: string | null = null
      
      const detectFn = config.providers.detectProvider || getDefaultDetectProvider(config.providers.types)
      detectedProvider = detectFn(currentHost)
      
      if (!detectedProvider && registry.getAll().length > 0) {
        for (const adapter of registry.getAll()) {
          if (adapter.detect(currentHost)) {
            detectedProvider = adapter.name
            break
          }
        }
      }
      
      if (!detectedProvider) {
        detectedProvider = config.providers.defaultType || null
      }
      
      setHost((prevHost) => {
        if (prevHost !== currentHost) return currentHost
        return prevHost
      })
      setProvider((prevProvider) => {
        if (prevProvider !== detectedProvider) return detectedProvider
        return prevProvider
      })
    }
  }, [config])

  const value: BridjetContextType = {
    provider,
    host,
    apiBaseUrl,
    apiEndpoints,
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BridjetContext.Provider value={value}>
          {children}
        </BridjetContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBridjet() {
  const context = useContext(BridjetContext)
  const config = requireBridjetConfig()
  const errorMessage = config.messages?.useBridjetError || 'useBridjet debe ser usado dentro de un BridjetProvider'
  
  if (context === undefined) {
    throw new Error(errorMessage)
  }
  return context
}

