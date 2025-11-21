interface NextRequestLike {
  url: string
  headers: Headers | { get: (key: string) => string | null }
}

import { getBridjetConfig } from '../config'

export interface SwitchAdapterConfig {
  mode?: 'nextjs' | 'standalone'
  
  serverUrl?: string
  
  routingRules?: RoutingRule[]
  
  defaultConfig?: string | object | (() => Promise<string | object>)
  
  path?: string
}

export interface RoutingRule {
  condition: (request: AdapterRequest) => boolean
  
  config: string | object | (() => Promise<string | object>)
}

export interface AdapterRequest {
  url: string
  host: string
  headers: Record<string, string>
  pathname: string
  searchParams: URLSearchParams
}

export type SwitchResponse = {
  config: string | object
  headers?: Record<string, string>
}

export class SwitchAdapter {
  private mode: 'nextjs' | 'standalone'
  private serverUrl?: string
  private routingRules: RoutingRule[]
  private defaultConfig?: string | object | (() => Promise<string | object>)
  private path: string

  constructor(config: SwitchAdapterConfig = {}) {
    this.mode = config.mode || this.detectMode()
    this.serverUrl = config.serverUrl
    this.routingRules = config.routingRules || []
    
    const globalConfig = getBridjetConfig()
    this.path = config.path || globalConfig?.switchAdapter?.defaultPath || '/.well-known/farcaster.json'
    this.defaultConfig = config.defaultConfig || globalConfig?.switchAdapter?.defaultConfig || 'default'
  }

  getMode(): 'nextjs' | 'standalone' {
    return this.mode
  }

  private detectMode(): 'nextjs' | 'standalone' {
    if (typeof window !== 'undefined') {
      return 'standalone'
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalProcess = (globalThis as any).process
      if (globalProcess && globalProcess.env) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processEnv = globalProcess.env as any
        if (processEnv.NEXT_RUNTIME) {
          return 'nextjs'
        }
      }
    } catch {
      // no
    }

    return 'standalone'
  }

  async resolveConfig(request: AdapterRequest): Promise<SwitchResponse> {
    for (const rule of this.routingRules) {
      if (rule.condition(request)) {
        const config = typeof rule.config === 'function'
          ? await rule.config()
          : rule.config

        return { config }
      }
    }

    const defaultConfig = this.defaultConfig || 'default'
    const config = typeof defaultConfig === 'function'
      ? await defaultConfig()
      : defaultConfig
    return { config }
  }

  createNextJsHandler() {
    return async (request: NextRequestLike | Request): Promise<Response> => {
      try {
        let adapterRequest: AdapterRequest

        if (request instanceof Request) {
          const url = new URL(request.url)
          const headers = request.headers instanceof Headers 
            ? Object.fromEntries(request.headers.entries())
            : {}
          const host = request.headers instanceof Headers
            ? request.headers.get('host') || ''
            : (request.headers as { get: (key: string) => string | null }).get('host') || ''

          adapterRequest = {
            url: request.url,
            host,
            headers,
            pathname: url.pathname,
            searchParams: url.searchParams,
          }
        } else {
          adapterRequest = this.createRequestFromNextReq(request as never)
        }

        const response = await this.resolveConfig(adapterRequest)

        const headers = new Headers(response.headers || {})
        headers.set('Content-Type', 'application/json')

        return new Response(JSON.stringify(response.config), {
          status: 200,
          headers,
        })
      } catch (error) {
        console.error('SwitchAdapter error:', error)
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }
  }

  createNextJsMiddleware() {
    return async (req: { url: string; headers: Record<string, string> }, res: { setHeader: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void }; json: (body: unknown) => void }) => {
      try {
        const request = this.createRequestFromNextReq(req)
        const response = await this.resolveConfig(request)

        // Establecer headers
        if (response.headers) {
          Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value)
          })
        }

        res.setHeader('Content-Type', 'application/json')
        res.status(200).json(response.config)
      } catch (error) {
        console.error('SwitchAdapter error:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }

  createExpressMiddleware() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (req: any, res: any, next: any) => {
      try {
        if (req.path !== this.path) {
          return next()
        }

        const request = this.createRequestFromExpressReq(req)
        const response = await this.resolveConfig(request)

        if (response.headers) {
          Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value)
          })
        }

        res.setHeader('Content-Type', 'application/json')
        res.status(200).json(response.config)
      } catch (error) {
        console.error('SwitchAdapter error:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }

  async fetchConfig(requestInfo?: Partial<AdapterRequest>): Promise<SwitchResponse> {
    if (!this.serverUrl) {
      throw new Error(
        'SwitchAdapter: serverUrl es requerido para usar fetchConfig(). ' +
        'Proporciona una URL de servidor en la configuración: createSwitchAdapter({ serverUrl: "https://..." })'
      )
    }

    const request = requestInfo || this.createRequestFromBrowser()

    try {
      const headers: Record<string, string> = {
        ...(request.headers || {}),
      }

      if (request.host) {
        headers['Host'] = request.host
      }

      const response = await fetch(`${this.serverUrl}${this.path}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Error al obtener configuración: ${response.statusText}`)
      }

      const config = await response.json()
      return { config }
    } catch (error) {
      console.error('SwitchAdapter fetch error:', error)
      throw error
    }
  }

  private createRequestFromNextReq(req: { url: string; headers: Record<string, string> }): AdapterRequest {
    const url = new URL(req.url, `http://${req.headers.host}`)
    return {
      url: req.url,
      host: req.headers.host || '',
      headers: req.headers || {},
      pathname: url.pathname,
      searchParams: url.searchParams,
    }
  }

  private createRequestFromExpressReq(req: { 
    originalUrl?: string
    url: string
    get: (key: string) => string | undefined
    headers: Record<string, string>
    protocol?: string
  }): AdapterRequest {
    const protocol = req.protocol || 'http'
    const host = req.get('host') || req.headers.host || ''
    const url = `${protocol}://${host}${req.originalUrl || req.url}`
    const urlObj = new URL(url)

    return {
      url: req.originalUrl || req.url,
      host: host,
      headers: req.headers || {},
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams,
    }
  }

  private createRequestFromBrowser(): AdapterRequest {
    if (typeof window === 'undefined') {
      throw new Error('createRequestFromBrowser solo está disponible en el navegador')
    }

    const url = new URL(window.location.href)
    return {
      url: window.location.href,
      host: window.location.host,
      headers: {},
      pathname: url.pathname,
      searchParams: url.searchParams,
    }
  }

  addRule(rule: RoutingRule): void {
    this.routingRules.push(rule)
  }

  clearRules(): void {
    this.routingRules = []
  }
}

export const createRoutingRules = {
  byHost: (hostPattern: string, config: string | object | (() => Promise<string | object>)): RoutingRule => ({
    condition: (request) => request.host.startsWith(hostPattern),
    config,
  }),

  byPathname: (pathPattern: string | RegExp, config: string | object | (() => Promise<string | object>)): RoutingRule => {
    const pattern = typeof pathPattern === 'string' ? new RegExp(pathPattern) : pathPattern
    return {
      condition: (request) => pattern.test(request.pathname),
      config,
    }
  },

  byQueryParam: (param: string, value: string, config: string | object | (() => Promise<string | object>)): RoutingRule => ({
    condition: (request) => request.searchParams.get(param) === value,
    config,
  }),

  custom: (condition: (request: AdapterRequest) => boolean, config: string | object | (() => Promise<string | object>)): RoutingRule => ({
    condition,
    config,
  }),
}

let globalAdapter: SwitchAdapter | null = null

export function createSwitchAdapter(config?: SwitchAdapterConfig): SwitchAdapter {
  if (globalAdapter && !config) {
    return globalAdapter
  }

  globalAdapter = new SwitchAdapter(config)
  return globalAdapter
}

export function getSwitchAdapter(): SwitchAdapter | null {
  return globalAdapter
}

