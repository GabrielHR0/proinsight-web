import axios from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = extractErrorMessage(error)
    toast.error(message)
    return Promise.reject(error)
  },
)

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data?.message) return String(data.message)
    if (data?.error) return String(data.error)
    if (typeof data === 'string') return data
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Erro inesperado'
}

export { api, extractErrorMessage }
