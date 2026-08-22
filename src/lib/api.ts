import axios, { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
import { dispatchSessionExpired, dispatchTokenRefreshed } from '@/lib/auth-events'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const academiaId = localStorage.getItem('proinsight_academia_id')
  if (academiaId) {
    config.headers['X-Academia-Id'] = academiaId
  }

  return config
})

// ── Violation helpers ──────────────────────────────────
interface Violation {
  field: string
  message: string
}

const fieldMessages: Record<string, string> = {
  cpf: 'CPF inválido',
  email: 'E-mail inválido',
  nome: 'Nome é obrigatório',
  dataNascimento: 'Data de nascimento inválida',
  telefone: 'Telefone inválido',
  senha: 'Senha deve ter no mínimo 6 caracteres',
}

function translateViolation(violation: Violation): string {
  return fieldMessages[violation.field] || violation.message
}

// ── Response interceptor ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const status = error.response?.status

    // 401 → refresh automático (uma única tentativa)
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const { data } = await authService.refresh(refreshToken)
          tokenStorage.set(data.token, data.refreshToken)
          dispatchTokenRefreshed(data.token)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          tokenStorage.clear()
          dispatchSessionExpired()
          return Promise.reject(error)
        }
      } else {
        tokenStorage.clear()
        dispatchSessionExpired()
        return Promise.reject(error)
      }
    }

    // /auth/me falhou por qualquer motivo (403, rede, 500...) → sessão inválida: limpa dados e desloga
    if (originalRequest?.url?.split('?')[0] === '/auth/me') {
      tokenStorage.clear()
      localStorage.removeItem('proinsight_academia_id')
      dispatchSessionExpired()
      return Promise.reject(error)
    }

    // Sem resposta (backend indisponível / erro de rede) → silencioso, sem toast
    if (!error.response) return Promise.reject(error)

    // 429 — Lockout / Rate limit
    if (status === 429) {
      const data = error.response?.data as Record<string, unknown> | undefined
      toast.error(String(data?.message ?? 'Muitas requisições'))
      return Promise.reject(error)
    }

    // 403 — Acesso negado
    if (status === 403) {
      toast.error('Acesso negado')
      return Promise.reject(error)
    }

    // Violations (RFC 7807)
    const data = error.response?.data as Record<string, unknown> | undefined
    const violations = data?.violations as Violation[] | undefined
    if (violations && violations.length > 0) {
      violations.forEach((v) => toast.error(translateViolation(v)))
      return Promise.reject(error)
    }

    // Fallback error messages
    const detail = data?.detail ? String(data.detail) : null
    const message = data?.message ? String(data.message) : null
    if (detail || message) {
      toast.error(detail || message || 'Erro')
    }

    return Promise.reject(error)
  },
)

export { api }
