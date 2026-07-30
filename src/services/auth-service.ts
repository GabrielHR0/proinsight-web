import { api } from '@/lib/api'
import type { LoginInput, LoginResponse, RegisterInput, User } from '@/types/auth'

export const authService = {
  login(data: LoginInput) {
    return api.post<LoginResponse>('/auth/login', data)
  },

  register(data: RegisterInput) {
    return api.post<LoginResponse>('/auth/register', data)
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
}
