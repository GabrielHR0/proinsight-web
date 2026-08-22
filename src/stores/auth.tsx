import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
import { AUTH_EVENTS } from '@/lib/auth-events'
import type { User, LoginInput, RegisterInput, JwtPayload } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeUserFromToken(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    return {
      id: payload.userId,
      userName: payload.userName,
      email: payload.sub,
      academiaPermissoes: payload.academiaPermissoes,
      academiaIds: payload.academiaIds,
    }
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function getInitialAuthState(): AuthState {
  const token = tokenStorage.getToken()
  if (!token) return { user: null, isAuthenticated: false, isLoading: false }

  const user = decodeUserFromToken(token)
  if (!user) {
    tokenStorage.clear()
    localStorage.removeItem('proinsight_academia_id')
    return { user: null, isAuthenticated: false, isLoading: false }
  }

  if (isTokenExpired(token)) {
    return { user: null, isAuthenticated: false, isLoading: true }
  }

  return { user, isAuthenticated: true, isLoading: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState)

  function setActiveAcademia(user: User | null) {
    const current = localStorage.getItem('proinsight_academia_id')

    // 1. Se já tem um valor válido, mantém
    if (current && user?.academiaIds?.includes(current)) return

    // 2. Tenta usar a primeira academiaId do user
    const first = user?.academiaIds?.[0]
    if (first) {
      localStorage.setItem('proinsight_academia_id', first)
      return
    }

    // 3. Fallback: usa a primeira chave de academiaPermissoes (defesa em profundidade)
    const permKeys = user?.academiaPermissoes ? Object.keys(user.academiaPermissoes) : []
    if (permKeys.length > 0) {
      localStorage.setItem('proinsight_academia_id', permKeys[0])
      return
    }

    // 4. Personal autônomo: sem academia — não seta tenant
    localStorage.removeItem('proinsight_academia_id')
  }

  // Token expirado no boot → tenta refresh silencioso
  useEffect(() => {
    const token = tokenStorage.getToken()
    if (!token || !isTokenExpired(token)) return

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      tokenStorage.clear()
      localStorage.removeItem('proinsight_academia_id')
      setState({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    authService
      .refresh(refreshToken)
      .then(({ data }) => {
        tokenStorage.set(data.token, data.refreshToken)
        const user = decodeUserFromToken(data.token)
        setActiveAcademia(user)
        setState({ user, isAuthenticated: true, isLoading: false })
      })
      .catch(() => {
        tokenStorage.clear()
        localStorage.removeItem('proinsight_academia_id')
        setState({ user: null, isAuthenticated: false, isLoading: false })
      })
  }, [])

  // Sessão expirada globalmente (401 sem refresh válido) → limpa tudo
  useEffect(() => {
    function onSessionExpired() {
      tokenStorage.clear()
      localStorage.removeItem('proinsight_academia_id')
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
    window.addEventListener(AUTH_EVENTS.sessionExpired, onSessionExpired)
    return () => window.removeEventListener(AUTH_EVENTS.sessionExpired, onSessionExpired)
  }, [])

  // Token renovado pelo interceptor → sincroniza user/permissões
  useEffect(() => {
    function onTokenRefreshed(event: Event) {
      const { token } = (event as CustomEvent<{ token: string }>).detail
      const user = decodeUserFromToken(token)
      if (!user) return
      setActiveAcademia(user)
      setState({ user, isAuthenticated: true, isLoading: false })
    }
    window.addEventListener(AUTH_EVENTS.tokenRefreshed, onTokenRefreshed)
    return () => window.removeEventListener(AUTH_EVENTS.tokenRefreshed, onTokenRefreshed)
  }, [])

  const login = useCallback(async (data: LoginInput) => {
    const { data: response } = await authService.login(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setActiveAcademia(user)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterInput) => {
    const { data: response } = await authService.register(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setActiveAcademia(user)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignora erro de rede — limpa estado local mesmo assim
    } finally {
      tokenStorage.clear()
      localStorage.removeItem('proinsight_academia_id')
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
