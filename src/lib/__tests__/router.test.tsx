import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/stores/auth'
import { tokenStorage } from '@/lib/token'

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() / 1000, exp: Date.now() / 1000 + 86400 }))
  const signature = btoa('fake-signature')
  return `${header}.${body}.${signature}`
}

function TestProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

function ProtectedPage() {
  return <div>Protected Content</div>
}

function LoginPage() {
  return <div>Login Page</div>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <div>Redirecting to login...</div>
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <div>Redirecting to home...</div>
  return <>{children}</>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders children when authenticated', () => {
    const token = createMockJwt({
      userId: '123',
      userName: 'test',
      sub: 'test@test.com',
      academiaIds: [],
      academiaPermissoes: {},
    })
    tokenStorage.set(token, 'refresh')

    render(
      <TestProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><ProtectedPage /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </TestProvider>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('blocks access when not authenticated', () => {
    render(
      <TestProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><ProtectedPage /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </TestProvider>,
    )

    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders children when not authenticated', () => {
    render(
      <TestProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          </Routes>
        </MemoryRouter>
      </TestProvider>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('blocks access when authenticated', () => {
    const token = createMockJwt({
      userId: '123',
      userName: 'test',
      sub: 'test@test.com',
      academiaIds: [],
      academiaPermissoes: {},
    })
    tokenStorage.set(token, 'refresh')

    render(
      <TestProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          </Routes>
        </MemoryRouter>
      </TestProvider>,
    )

    expect(screen.getByText('Redirecting to home...')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
