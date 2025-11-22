import { getBridjetConfig } from './config'

export interface User {
  id: string
  email?: string
  name?: string
  [key: string]: any
}

export interface SignInCredentials {
  email?: string
  username?: string
  password: string
  [key: string]: any
}

export interface SignUpData {
  email?: string
  username?: string
  password: string
  name?: string
  [key: string]: any
}

export interface AuthResponse {
  token: string
  user?: User
}

const DEFAULT_STORAGE_KEY = 'bridjet_bearer_token'
const USER_STORAGE_KEY = 'bridjet_user'

class BridjetAuthService {
  private token: string | null = null
  private user: User | null = null
  private listeners: Array<(token: string | null, user: User | null) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
      this.setupStorageListener()
    }
  }

  private loadFromStorage(): void {
    try {
      const config = getBridjetConfig()
      const storageKey = config?.session?.storageKey || DEFAULT_STORAGE_KEY
      
      this.token = localStorage.getItem(storageKey)
      
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Error al cargar datos desde localStorage:', error)
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (e: StorageEvent) => {
      const config = getBridjetConfig()
      const storageKey = config?.session?.storageKey || DEFAULT_STORAGE_KEY
      
      if (e.key === storageKey) {
        this.token = e.newValue
        if (!e.newValue) {
          this.user = null
        }
        this.notifyListeners()
      } else if (e.key === USER_STORAGE_KEY) {
        try {
          this.user = e.newValue ? JSON.parse(e.newValue) : null
        } catch (error) {
          console.error('Error al parsear usuario:', error)
        }
        this.notifyListeners()
      }
    })
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.token, this.user))
  }

  public subscribe(listener: (token: string | null, user: User | null) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private saveToken(token: string): void {
    try {
      const config = getBridjetConfig()
      const storageKey = config?.session?.storageKey || DEFAULT_STORAGE_KEY
      
      localStorage.setItem(storageKey, token)
      this.token = token
      this.notifyListeners()
    } catch (error) {
      console.error('Error al guardar el token:', error)
      throw error
    }
  }

  private saveUser(user: User): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      this.user = user
      this.notifyListeners()
    } catch (error) {
      console.error('Error al guardar el usuario:', error)
    }
  }

  private clearSession(): void {
    try {
      const config = getBridjetConfig()
      const storageKey = config?.session?.storageKey || DEFAULT_STORAGE_KEY
      
      localStorage.removeItem(storageKey)
      localStorage.removeItem(USER_STORAGE_KEY)
      this.token = null
      this.user = null
      this.notifyListeners()
    } catch (error) {
      console.error('Error al limpiar la sesión:', error)
    }
  }

  private getApiConfig(): { baseUrl: string; endpoints: Record<string, string> } {
    const config = getBridjetConfig()
    
    if (!config) {
      throw new Error('Bridjet no está configurado. Llama a setupBridjet() primero.')
    }

    const baseUrl = config.api?.baseUrl || ''
    const endpoints = {
      signIn: config.api?.endpoints?.signIn || '/auth/signin',
      signOut: config.api?.endpoints?.signOut || '/auth/signout',
      signUp: config.api?.endpoints?.signUp || '/auth/signup',
      refreshToken: config.api?.endpoints?.refreshToken || '/auth/refresh',
      validateToken: config.api?.endpoints?.validateToken || '/auth/validate',
      profile: config.api?.endpoints?.profile || '/auth/profile',
    }

    return { baseUrl, endpoints }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const config = getBridjetConfig()
    const { baseUrl } = this.getApiConfig()
    const url = `${baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config?.api?.headers || {}),
      ...(options.headers as Record<string, string> || {}),
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const timeout = config?.api?.timeout || 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession()
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('La solicitud excedió el tiempo de espera')
        }
        throw err
      }
      throw new Error('Error desconocido en la solicitud')
    }
  }

  public getToken(): string | null {
    return this.token
  }

  public getUser(): User | null {
    return this.user
  }

  public isAuthenticated(): boolean {
    return this.token !== null
  }

  public async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const { endpoints } = this.getApiConfig()
    
    const response = await this.makeRequest<AuthResponse>(
      endpoints.signIn,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    )

    this.saveToken(response.token)
    if (response.user) {
      this.saveUser(response.user)
    }

    return response
  }

  public async signUp(data: SignUpData): Promise<AuthResponse> {
    const { endpoints } = this.getApiConfig()
    
    const response = await this.makeRequest<AuthResponse>(
      endpoints.signUp,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    )

    this.saveToken(response.token)
    if (response.user) {
      this.saveUser(response.user)
    }

    return response
  }

  public async signOut(): Promise<void> {
    const { endpoints } = this.getApiConfig()
    
    try {
      if (this.token) {
        await this.makeRequest(endpoints.signOut, {
          method: 'POST',
        })
      }
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      this.clearSession()
    }
  }

  public async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No hay token para refrescar')
    }

    const { endpoints } = this.getApiConfig()
    
    const response = await this.makeRequest<{ token: string }>(
      endpoints.refreshToken,
      {
        method: 'POST',
      }
    )

    this.saveToken(response.token)
    return response.token
  }

  public async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false
    }

    const { endpoints } = this.getApiConfig()
    
    try {
      await this.makeRequest(endpoints.validateToken, {
        method: 'GET',
      })
      return true
    } catch (err) {
      this.clearSession()
      return false
    }
  }

  public async fetchProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('No hay sesión activa')
    }

    const { endpoints } = this.getApiConfig()
    
    const userData = await this.makeRequest<User>(
      endpoints.profile,
      {
        method: 'GET',
      }
    )

    this.saveUser(userData)
    return userData
  }

  public updateToken(token: string): void {
    this.saveToken(token)
  }

  public updateUser(user: User): void {
    this.saveUser(user)
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, options, true)
  }

  public getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      return {}
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
    }
  }
}

// Singleton instance
let authServiceInstance: BridjetAuthService | null = null

export function getAuthService(): BridjetAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new BridjetAuthService()
  }
  return authServiceInstance
}

// Funciones de conveniencia para usar directamente
export const authService = {
  signIn: (credentials: SignInCredentials) => getAuthService().signIn(credentials),
  signUp: (data: SignUpData) => getAuthService().signUp(data),
  signOut: () => getAuthService().signOut(),
  refreshToken: () => getAuthService().refreshToken(),
  validateToken: () => getAuthService().validateToken(),
  fetchProfile: () => getAuthService().fetchProfile(),
  getToken: () => getAuthService().getToken(),
  getUser: () => getAuthService().getUser(),
  isAuthenticated: () => getAuthService().isAuthenticated(),
  updateToken: (token: string) => getAuthService().updateToken(token),
  updateUser: (user: User) => getAuthService().updateUser(user),
  request: <T>(endpoint: string, options?: RequestInit) => getAuthService().request<T>(endpoint, options),
  getAuthHeaders: () => getAuthService().getAuthHeaders(),
  subscribe: (listener: (token: string | null, user: User | null) => void) => getAuthService().subscribe(listener),
}

export default authService
