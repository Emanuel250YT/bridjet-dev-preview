export interface ProviderAdapter {
  readonly name: string
  detect(host: string): boolean
  getConfig(): Promise<ProviderConfig> | ProviderConfig
  initialize?(): Promise<void> | void
  cleanup?(): Promise<void> | void
}
export interface ProviderConfig {
  provider: string
  config?: Record<string, unknown>
  headers?: Record<string, string>
  metadata?: Record<string, unknown>
}

export interface AdapterOptions {
  hostPattern?: string | RegExp
  config?: Record<string, unknown>
  customDetect?: (host: string) => boolean
}

