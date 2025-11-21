import type { ProviderAdapter, ProviderConfig, AdapterOptions } from './base-adapter'

export class FarcasterAdapter implements ProviderAdapter {
  readonly name = 'farcaster'
  private hostPattern: string | RegExp
  private customDetect?: (host: string) => boolean
  private config?: Record<string, unknown>

  constructor(options: AdapterOptions = {}) {
    this.hostPattern = options.hostPattern || /farcaster\./i
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
        type: 'farcaster',
      },
      metadata: {
        adapter: 'farcaster',
        version: '1.0.0',
      },
    }
  }
}

