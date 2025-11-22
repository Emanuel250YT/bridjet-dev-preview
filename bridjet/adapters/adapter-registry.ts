import type { ProviderAdapter, AdapterOptions } from './base-adapter'
import { WorldCoinAdapter } from './worldcoin-adapter'
import { LemonAdapter } from './lemon-adapter'
import { FarcasterAdapter } from './farcaster-adapter'
import { BaseAdapter } from './base-adapter-provider'
import { CeloAdapter } from './celo-adapter'
// TEMPORARILY DISABLED - Incompatibility issues
// import { RostockAdapter } from './rostock-adapter'
// import { XMTPAdapter } from './xmtp-adapter'

class AdapterRegistry {
  private adapters: Map<string, ProviderAdapter> = new Map()
  private defaultAdapter: ProviderAdapter | null = null

  register(adapter: ProviderAdapter, isDefault = false): void {
    this.adapters.set(adapter.name, adapter)
    if (isDefault) {
      this.defaultAdapter = adapter
    }
  }

  get(name: string): ProviderAdapter | undefined {
    return this.adapters.get(name)
  }

  getDefault(): ProviderAdapter | null {
    return this.defaultAdapter
  }

  getAll(): ProviderAdapter[] {
    return Array.from(this.adapters.values())
  }

  detectProvider(host: string): string | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.detect(host)) {
        return adapter.name
      }
    }
    return this.defaultAdapter?.name || null
  }

  clear(): void {
    this.adapters.clear()
    this.defaultAdapter = null
  }

  getProviderNames(): string[] {
    return Array.from(this.adapters.keys())
  }
}

const globalRegistry = new AdapterRegistry()

export const AdapterFactory = {
  createWorldCoin(options?: AdapterOptions): WorldCoinAdapter {
    return new WorldCoinAdapter(options)
  },

  createLemon(options?: AdapterOptions): LemonAdapter {
    return new LemonAdapter(options)
  },

  createFarcaster(options?: AdapterOptions): FarcasterAdapter {
    return new FarcasterAdapter(options)
  },

  createBase(options?: AdapterOptions): BaseAdapter {
    return new BaseAdapter(options)
  },

  createCelo(options?: AdapterOptions): CeloAdapter {
    return new CeloAdapter(options)
  },

  // TEMPORARILY DISABLED - Incompatibility issues
  // createRostock(options?: AdapterOptions): RostockAdapter {
  //   return new RostockAdapter(options)
  // },

  // createXMTP(options?: AdapterOptions): XMTPAdapter {
  //   return new XMTPAdapter(options)
  // },
}

export function initializeDefaultAdapters(): void {
  globalRegistry.register(AdapterFactory.createWorldCoin(), false)
  globalRegistry.register(AdapterFactory.createLemon(), false)
  globalRegistry.register(AdapterFactory.createFarcaster(), false)
  globalRegistry.register(AdapterFactory.createBase(), false)
  globalRegistry.register(AdapterFactory.createCelo(), false)
  
  // TEMPORARILY DISABLED - Incompatibility issues
  // globalRegistry.register(AdapterFactory.createRostock(), false)
  // globalRegistry.register(AdapterFactory.createXMTP(), false)
  
  if (!globalRegistry.getDefault()) {
    globalRegistry.register(AdapterFactory.createFarcaster(), true)
  }
}

export function getAdapterRegistry(): AdapterRegistry {
  return globalRegistry
}

export function setupAdapters(
  adapters: Array<{ adapter: ProviderAdapter; isDefault?: boolean }>
): void {
  globalRegistry.clear()
  adapters.forEach(({ adapter, isDefault = false }) => {
    globalRegistry.register(adapter, isDefault)
  })
}

export { AdapterRegistry }

