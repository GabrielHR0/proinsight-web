import { api } from '@/lib/api'
import type { LoginInput, LoginResponse, RegisterInput, User } from '@/types/auth'

function stripConfirmPassword(data: RegisterInput): Record<string, unknown> {
  const { confirmPassword, ...payload } = data
  return payload
}

export const authService = {
  login(data: LoginInput) {
    return api.post<LoginResponse>('/auth/login', data)
  },

  register(data: RegisterInput) {
    return api.post<LoginResponse>('/auth/register', stripConfirmPassword(data))
  },

  refresh(refreshToken: string) {
    return api.post<LoginResponse>('/auth/refresh', { refreshToken })
  },

  logout() {
    return api.post<void>('/auth/logout')
  },

  getMe() {
    return api.get<User>('/auth/me')
  },

  forgotPassword(email: string) {
    return api.post<void>('/auth/forgot-password', { email })
  },

  resetPassword(token: string, newPassword: string) {
    return api.post<void>('/auth/reset-password', { token, newPassword })
  },
}
