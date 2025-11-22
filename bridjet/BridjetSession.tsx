import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { requireBridjetConfig } from './config'
import { getAuthService, type User, type SignInCredentials, type SignUpData } from './auth-service'

interface BridjetSessionContextType {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  refreshToken: () => Promise<void>
  validateToken: () => Promise<boolean>
  updateToken: (token: string) => void
  clearError: () => void
  fetchProfile: () => Promise<void>
}

const BridjetSessionContext = createContext<BridjetSessionContextType | undefined>(undefined)

interface BridjetSessionProps {
  children: ReactNode
  onSessionExpired?: () => void
  onError?: (error: Error) => void
}

export function BridjetSession({ 
  children, 
  onSessionExpired,
  onError
}: BridjetSessionProps) {
  const authService = getAuthService()
  
  const [token, setToken] = useState<string | null>(authService.getToken())
  const [user, setUser] = useState<User | null>(authService.getUser())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signIn(credentials)
      setToken(authService.getToken())
      setUser(authService.getUser())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authService, onError])

  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signUp(data)
      setToken(authService.getToken())
      setUser(authService.getUser())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authService, onError])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signOut()
      setToken(null)
      setUser(null)
      onSessionExpired?.()
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err)
    } finally {
      setIsLoading(false)
    }
  }, [authService, onSessionExpired])

  const refreshToken = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      await authService.refreshToken()
      setToken(authService.getToken())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al refrescar el token'
      setError(errorMessage)
      setToken(null)
      setUser(null)
      onSessionExpired?.()
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [token, authService, onSessionExpired, onError])

  const validateToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false

    try {
      const isValid = await authService.validateToken()
      if (!isValid) {
        setToken(null)
        setUser(null)
        onSessionExpired?.()
      }
      return isValid
    } catch (err) {
      setToken(null)
      setUser(null)
      onSessionExpired?.()
      return false
    }
  }, [token, authService, onSessionExpired])

  const fetchProfile = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      await authService.fetchProfile()
      setUser(authService.getUser())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener el perfil'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [token, authService, onError])

  const updateToken = useCallback((newToken: string) => {
    authService.updateToken(newToken)
    setToken(newToken)
  }, [authService])

  // Suscribirse a cambios en el servicio de autenticación
  useEffect(() => {
    const unsubscribe = authService.subscribe((newToken, newUser) => {
      setToken(newToken)
      setUser(newUser)
      if (!newToken) {
        onSessionExpired?.()
      }
    })

    return unsubscribe
  }, [authService, onSessionExpired])

  // Auto-refresh token
  useEffect(() => {
    const config = requireBridjetConfig()
    if (!config.session?.autoRefresh || !token) return

    const interval = config.session.refreshInterval || 5 * 60 * 1000 // 5 minutos por defecto
    const intervalId = setInterval(() => {
      refreshToken().catch(console.error)
    }, interval)

    return () => clearInterval(intervalId)
  }, [token, refreshToken])

  // Validar token al montar si existe
  useEffect(() => {
    if (token) {
      validateToken().catch(console.error)
    }
  }, []) // Solo al montar

  const value: BridjetSessionContextType = {
    token,
    user,
    isAuthenticated: token !== null,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshToken,
    validateToken,
    updateToken,
    clearError,
    fetchProfile,
  }

  return (
    <BridjetSessionContext.Provider value={value}>
      {children}
    </BridjetSessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBridjetSession() {
  const context = useContext(BridjetSessionContext)
  const config = requireBridjetConfig()
  const errorMessage = config.messages?.useBridjetSessionError || 'useBridjetSession debe ser usado dentro de un BridjetSession'
  
  if (context === undefined) {
    throw new Error(errorMessage)
  }
  
  return context
}

// Hook para obtener headers de autenticación
// eslint-disable-next-line react-refresh/only-export-components
export function useBridjetAuthHeaders() {
  const { token } = useBridjetSession()
  
  return useCallback(() => {
    if (!token) return {}
    
    return {
      'Authorization': `Bearer ${token}`,
    }
  }, [token])
}

// Hook para hacer requests autenticados
// eslint-disable-next-line react-refresh/only-export-components
export function useBridjetRequest() {
  const authService = getAuthService()

  return useCallback(async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    return authService.request<T>(endpoint, options)
  }, [authService])
}
