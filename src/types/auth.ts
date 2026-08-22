import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(1, 'E-mail ou nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// ── Base para registro (inclui confirmPassword) ─────────
const baseRegisterSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  userName: z.string().min(2, 'Mínimo de 2 caracteres').max(50),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  cref: z.string().min(1, 'CREF é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
})

// ── Registro sem academia ──────────────────────────────
export const registerUserSchema = baseRegisterSchema.refine(
  data => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] },
)

// ── Registro com academia (campos completos) ───────────
export const enderecoSchema = z.object({
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
})

export const registerAcademiaSchema = baseRegisterSchema.extend({
  academiaNome: z.string().min(2, 'Nome da academia é obrigatório'),
  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  telefone: z.string().optional(),
  endereco: enderecoSchema.optional(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] },
)

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type RegisterAcademiaInput = z.infer<typeof registerAcademiaSchema>
/** Union dos dois fluxos de registro */
export type RegisterInput = RegisterUserInput | RegisterAcademiaInput

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
