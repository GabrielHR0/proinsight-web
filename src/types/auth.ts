import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  userName: z.string().min(2, 'Mínimo de 2 caracteres').max(50),
  academiaNome: z.string().min(2, 'Nome da academia é obrigatório'),
  cnpj: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export interface LoginResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: string
  userName: string
  email: string
  academiaPermissoes: Record<string, string[]>
}

export interface User {
  id: string
  userName: string
  email: string
  academiaPermissoes: Record<string, string[]>
  academiaIds: string[]
}

export interface AcademiaInfo {
  id: string
  permissoes: string[]
}

export interface JwtPayload {
  jti: string
  iss: string
  sub: string
  userId: string
  userName: string
  academiaIds: string[]
  academiaPermissoes: Record<string, string[]>
  iat: number
  exp: number
}
