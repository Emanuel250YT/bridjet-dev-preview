import type { ProviderAdapter, ProviderConfig, AdapterOptions } from './base-adapter'

export class WorldCoinAdapter implements ProviderAdapter {
  readonly name = 'worldcoin'
  private hostPattern: string | RegExp
  private customDetect?: (host: string) => boolean
  private config?: Record<string, unknown>

  constructor(options: AdapterOptions = {}) {
    this.hostPattern = options.hostPattern || /worldcoin\./i
    this.customDetect = options.customDetect
    this.config = options.config
  }

  detect(host: string): boolean {
    if (this.customDetect) {
      return this.customDetect(host)
    }

    if (typeof this.hostPattern === 'string') {
      return host.toLowerCase().includes(this.hostPattern.toLowerCase())
    }

    return this.hostPattern.test(host)
  }

  getConfig(): ProviderConfig {
    return {
      provider: this.name,
      config: {
        ...this.config,
        type: 'worldcoin',
      },
      metadata: {
        adapter: 'worldcoin',
        version: '1.0.0',
      },
    }
  }
}

