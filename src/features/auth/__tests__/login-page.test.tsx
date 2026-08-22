import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/features/auth/login-page'
import { AuthProvider } from '@/stores/auth'

vi.mock('@/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders login and password fields', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByLabelText(/e-mail ou usuário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('renders link to register', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText(/criar conta/i)).toBeInTheDocument()
  })

  it('shows error for empty login', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText(/e-mail ou nome de usuário é obrigatório/i)).toBeInTheDocument()
  })

  it('shows error for empty password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />)

    await user.type(screen.getByLabelText(/e-mail ou usuário/i), 'test@test.com')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
  })
})
