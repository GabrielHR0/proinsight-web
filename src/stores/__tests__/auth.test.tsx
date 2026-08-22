import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/stores/auth'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'

vi.mock('@/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}))

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>
  }
}

describe('AuthProvider + useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('login stores token and sets user', async () => {
    const mockToken = createMockJwt({
      userId: 'user-123',
      userName: 'joao',
      sub: 'joao@test.com',
      academiaIds: ['acad-1'],
      academiaPermissoes: { 'acad-1': ['CLIENTES_CRIAR'] },
    })

    vi.mocked(authService.login).mockResolvedValue({
      data: { token: mockToken, refreshToken: 'refresh-123', tokenType: 'Bearer', expiresIn: 86400, userId: 'user-123', userName: 'joao', email: 'joao@test.com', academiaPermissoes: {} },
    } as never)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.login({ login: 'joao@test.com', password: '123' })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.id).toBe('user-123')
    expect(result.current.user?.userName).toBe('joao')
    expect(tokenStorage.getToken()).toBe(mockToken)
  })

  it('logout clears token and user', async () => {
    const mockToken = createMockJwt({
      userId: 'user-123',
      userName: 'joao',
      sub: 'joao@test.com',
      academiaIds: [],
      academiaPermissoes: {},
    })

    tokenStorage.set(mockToken, 'refresh-123')

    vi.mocked(authService.logout).mockResolvedValue({ data: null } as never)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    // Should start authenticated because token is in localStorage
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(tokenStorage.getToken()).toBeNull()
  })

  it('logout clears state even if API call fails', async () => {
    const mockToken = createMockJwt({
      userId: 'user-123',
      userName: 'joao',
      sub: 'joao@test.com',
      academiaIds: [],
      academiaPermissoes: {},
    })

    tokenStorage.set(mockToken, 'refresh-123')

    vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(tokenStorage.getToken()).toBeNull()
  })

  it('starts authenticated when valid token in localStorage', () => {
    const mockToken = createMockJwt({
      userId: 'user-456',
      userName: 'maria',
      sub: 'maria@test.com',
      academiaIds: ['acad-2'],
      academiaPermissoes: {},
    })

    tokenStorage.set(mockToken, 'refresh-456')

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.id).toBe('user-456')
    expect(result.current.user?.userName).toBe('maria')
  })

  it('clears invalid token from localStorage on init', () => {
    tokenStorage.set('invalid-token', 'refresh')

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    expect(result.current.isAuthenticated).toBe(false)
    expect(tokenStorage.getToken()).toBeNull()
  })

  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth deve ser usado dentro de AuthProvider')
  })
})

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() / 1000, exp: Date.now() / 1000 + 86400 }))
  const signature = btoa('fake-signature')
  return `${header}.${body}.${signature}`
}
