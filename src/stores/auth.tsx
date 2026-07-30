import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
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

function getInitialAuthState(): AuthState {
  const token = tokenStorage.getToken()
  if (!token) return { user: null, isAuthenticated: false, isLoading: false }

  const user = decodeUserFromToken(token)
  if (!user) {
    tokenStorage.clear()
    return { user: null, isAuthenticated: false, isLoading: false }
  }
  return { user, isAuthenticated: true, isLoading: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState)

  const login = useCallback(async (data: LoginInput) => {
    const { data: response } = await authService.login(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterInput) => {
    const { data: response } = await authService.register(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      tokenStorage.clear()
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
