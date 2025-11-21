import type { ProviderAdapter, AdapterOptions } from './adapters/base-adapter'

export interface BridjetConfig {
  providers: {
    types: readonly string[]
    defaultType?: string
    detectProvider?: (host: string) => string | null
    adapters?: Array<{
      adapter: ProviderAdapter
      isDefault?: boolean
    }>
    adapterOptions?: Record<string, AdapterOptions>
  }
  switchAdapter?: {
    defaultPath?: string
    defaultConfig?: string | object | (() => Promise<string | object>)
  }
  messages?: {
    useBridjetError?: string
  }
  autoInitializeAdapters?: boolean
}

let globalConfig: BridjetConfig | null = null

export function setupBridjet(config: BridjetConfig): void {
  if (globalConfig) {
    console.warn('Bridjet ya está configurado. La nueva configuración reemplazará la anterior.')
  }
  globalConfig = config
}

export function getBridjetConfig(): BridjetConfig | null {
  return globalConfig
}

export function requireBridjetConfig(): BridjetConfig {
  if (!globalConfig) {
    throw new Error(
      'Bridjet no está configurado. Por favor, llama a setupBridjet() antes de usar BridjetProvider o SwitchAdapter.'
    )
  }
  return globalConfig
}

