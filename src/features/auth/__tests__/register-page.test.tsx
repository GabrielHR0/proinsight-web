import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegisterPage } from '@/features/auth/register-page'
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

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders form fields on profissional tab', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument()
  })

  it('renders tabs', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByRole('button', { name: /profissional/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /academia/i })).toBeInTheDocument()
  })

  it('renders register button', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('renders link to login', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByText(/já tem conta/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument()
    expect(screen.getByText(/mínimo de 2 caracteres/i)).toBeInTheDocument()
    expect(screen.getByText(/mínimo de 8 caracteres/i)).toBeInTheDocument()
  })

  it('shows error for short password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText(/^senha/i), '1234567')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(screen.getByText(/mínimo de 8 caracteres/i)).toBeInTheDocument()
  })

  it('shows academia fields when academia tab is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /academia/i }))

    expect(screen.getByLabelText(/nome da academia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
    expect(screen.getByText(/endereço/i)).toBeInTheDocument()
  })

  it('resets form when switching tabs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.type(screen.getByLabelText(/e-mail/i), 'test@test.com')
    await user.click(screen.getByRole('button', { name: /academia/i }))

    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('')
  })

  it('requires academiaNome on academia tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /academia/i }))
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(screen.getByText(/nome da academia é obrigatório/i)).toBeInTheDocument()
  })
})
