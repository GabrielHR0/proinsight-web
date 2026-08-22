import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/services/auth-service'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login calls POST /auth/login with data', async () => {
    const mockResponse = { data: { token: 'jwt', refreshToken: 'refresh' } }
    vi.mocked(api.post).mockResolvedValue(mockResponse as never)

    const result = await authService.login({ login: 'test@test.com', password: '123' })

    expect(api.post).toHaveBeenCalledWith('/auth/login', { login: 'test@test.com', password: '123' })
    expect(result).toBe(mockResponse)
  })

  it('register calls POST /auth/register with data', async () => {
    const mockResponse = { data: { token: 'jwt', refreshToken: 'refresh' } }
    vi.mocked(api.post).mockResolvedValue(mockResponse as never)

    await authService.register({
      email: 'test@test.com',
      password: '12345678',
      userName: 'joao',
      confirmPassword: '12345678',
      cref: 'CREF-123',
      cpf: '11122233344',
      academiaNome: 'Academia',
    })

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@test.com',
      password: '12345678',
      userName: 'joao',
      cref: 'CREF-123',
      cpf: '11122233344',
      academiaNome: 'Academia',
    })
  })

  it('refresh calls POST /auth/refresh with refreshToken', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} } as never)

    await authService.refresh('my-refresh-token')

    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'my-refresh-token' })
  })

  it('logout calls POST /auth/logout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null } as never)

    await authService.logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
  })

  it('getMe calls GET /auth/me', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { userId: '123' } } as never)

    await authService.getMe()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })
})
