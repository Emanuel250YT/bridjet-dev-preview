import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { requireBridjetConfig } from './config'
import { getAdapterRegistry, initializeDefaultAdapters, setupAdapters } from './adapters/adapter-registry'

export type BridjetProviderType = string | null

interface BridjetContextType {
  provider: BridjetProviderType
  host: string
}

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
  }

  return (
    <BridjetContext.Provider value={value}>
      {children}
    </BridjetContext.Provider>
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

