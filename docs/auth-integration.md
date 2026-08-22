# Proinsight Web — Autenticação e Autorização

> Documento oficial de implementação do sistema de auth do front-end React.
> Stack: React 19 · TypeScript 6 · TanStack Query 5 · React Router 7 · Axios · Zod

---

## Sumário

1. [Arquitetura](#1-arquitetura)
2. [Mapeamento de Endpoints](#2-mapeamento-de-endpoints)
3. [Implementação Passo a Passo](#3-implementação-passo-a-passo)
4. [Segurança](#4-segurança)
5. [Plano de Implementação](#5-plano-de-implementação)

---

## 1. Arquitetura

```
┌────────────────────────────────────────────────────┐
│  AuthProvider (Context)                             │
│  ├── user: User | null                             │
│  ├── academiaAtiva: AcademiaInfo | null             │
│  ├── isAuthenticated: boolean                       │
│  ├── isLoading: boolean                             │
│  ├── login(email, password) → Promise<void>         │
│  ├── register(data) → Promise<void>                 │
│  ├── logout() → Promise<void>                       │
│  └── switchAcademia(id) → void                      │
└──────────────┬─────────────────────────────────────┘
               │ fornece estado
    ┌──────────┴──────────┐
    ▼                     ▼
┌──────────────┐  ┌──────────────────┐
│  TanStack    │  │  Axios Client    │
│  Query       │  │  (api.ts)        │
│  (mutations  │  │  ├─ req interceptor: Bearer + X-Academia-Id
│   + cache)   │  │  └─ res interceptor: refresh 401 → retry
└──────────────┘  └──────────────────┘
```

### 1.1 Stack de Segurança (Backend)

| Componente | Tecnologia | Detalhe |
|---|---|---|
| Hash de senha | BCrypt | 12 rounds |
| JWT | HMAC-SHA256 | 24h de expiração |
| Refresh Token | UUID v7 | 7 dias, rotação (one-time use) |
| Sessão | Stateless | Sem cookies de sessão |
| Lockout | 5 tentativas → 15 min bloqueio |
| Rate Limit | 5 req/min por IP no `/login` |

### 1.2 Fluxo de Dados

```
Login bem-sucedido:
  Front → POST /auth/login → Back → 200 { token, refreshToken, user }
  Front → localStorage.set(token, refreshToken)
  Front → AuthContext.set(user)
  Front → React Query cache populado
  Front → Redirect para /

Token expirado (401):
  Axios interceptor detecta 401
  → Tenta POST /auth/refresh com refreshToken
  → Se OK: repete requisição original
  → Se falha: limpa sessão, redirect /login

Logout:
  Front → POST /auth/logout (invalida refresh tokens no back)
  Front → localStorage.clear()
  Front → AuthContext.reset()
  Front → Redirect para /login
```

---

## 2. Mapeamento de Endpoints

### 2.1 POST /api/v1/auth/login

```
Request:
  POST /api/v1/auth/login
  Content-Type: application/json

Body:
{
  "email": "user@email.com",
  "password": "minha-senha"
}

Success 200:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "0194f1a2-b3c4-5d6e-7f89-0abcdef12345",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "userId": "66c8f1a2b3c4d5e6f7a8b9c0",
  "userName": "joao",
  "email": "user@email.com",
  "academiaPermissoes": {
    "academia-id-1": ["CLIENTES_CRIAR", "AVALIACOES_CRIAR"]
  }
}

Error 401:
  { "message": "Credenciais inválidas" }

Error 429 (lockout):
  { "message": "Conta temporariamente bloqueada. Tente novamente em 15 minuto(s)." }

Error 429 (rate limit):
  { "message": "Muitas tentativas de login. Tente novamente em 1 minuto." }
```

### 2.2 POST /api/v1/auth/register

Dois fluxos: **Profissional** (sem academia) e **Academia** (cria academia junto).

#### Fluxo Profissional — sem academia

```
Request:
  POST /api/v1/auth/register
  Content-Type: application/json

Body:
{
  "email": "user@email.com",
  "password": "senha-forte-123",
  "userName": "joao"
}

Success 201: mesmo shape do /login (auto-login, academiaPermissoes vazio)
```

#### Fluxo Academia — cria academia junto

```
Request:
  POST /api/v1/auth/register
  Content-Type: application/json

Body:
{
  "email": "user@email.com",
  "password": "senha-forte-123",
  "userName": "joao",
  "academiaNome": "Minha Academia",
  "cnpj": "12.345.678/0001-90",       // opcional
  "razaoSocial": "Academia LTDA",     // opcional
  "telefone": "(11) 99999-9999",      // opcional
  "endereco": {                       // opcional (se enviar, todos os campos obrigatórios)
    "rua": "Rua Exemplo",
    "numero": "123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  }
}

Success 201: mesmo shape do /login (auto-login)
Error 400: RFC 7807 Problem Details
  {
    "type": "proinsight://problems/validation-error",
    "status": 400,
    "detail": "Um ou mais campos estão inválidos",
    "violations": [
      { "field": "email", "message": "E-mail já cadastrado" }
    ]
  }
```

### 2.3 POST /api/v1/auth/refresh

```
Request:
  POST /api/v1/auth/refresh
  Content-Type: application/json

Body:
{
  "refreshToken": "uuid-do-refresh-token"
}

Success 200: mesmo shape do /login (novo token + novo refresh)
Error 400:
  { "message": "Refresh token inválido ou já revogado" }
```

### 2.4 POST /api/v1/auth/logout

```
Request:
  POST /api/v1/auth/logout
  Authorization: Bearer <jwt>

Success 204: sem corpo
```

### 2.5 GET /api/v1/auth/me

```
Request:
  GET /api/v1/auth/me
  Authorization: Bearer <jwt>

Success 200:
{
  "userId": "...",
  "userName": "joao",
  "email": "user@email.com",
  "academiaPermissoes": { "acad-id": ["CLIENTES_LER"] },
  "academiaIds": ["acad-id"]
}
```

---

## 3. Implementação Passo a Passo

### 3.1 Camada de Tipos e Schemas — `src/types/auth.ts`

```typescript
import { z } from 'zod'

// ── Schemas de validação ──────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// Base para registro (inclui confirmPassword)
const baseRegisterSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  userName: z.string().min(2, 'Mínimo de 2 caracteres').max(50),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
})

// Registro sem academia
export const registerUserSchema = baseRegisterSchema.refine(
  data => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] },
)

// Registro com academia (campos completos)
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
export type RegisterInput = RegisterUserInput | RegisterAcademiaInput

// ── Respostas da API ──────────────────────────────────

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

// ── JWT Payload ───────────────────────────────────────

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
```

### 3.2 Serviço de Auth — `src/services/auth-service.ts`

```typescript
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
```

### 3.3 Token Management — `src/lib/token.ts`

```typescript
const TOKEN_KEY = 'proinsight_token'
const REFRESH_KEY = 'proinsight_refresh'

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },

  set(token: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
```

### 3.4 AuthContext — `src/stores/auth.tsx`

```typescript
import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
import type { User, LoginInput, RegisterInput } from '@/types/auth'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeUserFromToken(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token)
    return {
      id: payload.userId,
      userName: payload.userName,
      email: payload.sub,
      academiaPermissoes: payload.academiaPermissoes,
      academiaIds: payload.academiaIds,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = tokenStorage.getToken()
    if (!token) return { user: null, isAuthenticated: false, isLoading: false }

    const user = decodeUserFromToken(token)
    if (!user) {
      tokenStorage.clear()
      return { user: null, isAuthenticated: false, isLoading: false }
    }
    return { user, isAuthenticated: true, isLoading: false }
  })

  const login = useCallback(async (data: LoginInput) => {
    const { data: response } = await authService.login(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const register = useCallback(async (data: RegisterInput) => {
    const { data: response } = await authService.register(data)
    tokenStorage.set(response.token, response.refreshToken)
    const user = decodeUserFromToken(response.token)
    setState({ user, isAuthenticated: true, isLoading: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      tokenStorage.clear()
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
```

### 3.5 Axios Interceptor — `src/lib/api.ts`

```typescript
import axios, { isAxiosError } from 'axios'
import { authService } from '@/services/auth-service'
import { tokenStorage } from '@/lib/token'
import { toast } from 'sonner'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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

// ── Response interceptor ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config
    const status = error.response?.status

    // 401 → refresh automático (uma única tentativa)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const { data } = await authService.refresh(refreshToken)
          tokenStorage.set(data.token, data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          tokenStorage.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } else {
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // 403 — Acesso negado
    if (status === 403) {
      toast.error('Acesso negado')
    }

    // 429 — Lockout / Rate limit
    if (status === 429) {
      const data = error.response?.data as Record<string, unknown> | undefined
      toast.error(String(data?.message ?? 'Muitas requisições'))
    }

    return Promise.reject(error)
  },
)
```

### 3.6 Provider — `src/components/providers/app-provider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/stores/theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/stores/auth'
import type { ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

### 3.7 Rotas Protegidas — `src/lib/router.tsx`

```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { RootLayout } from '@/components/layout/root-layout'

// Pages
import { LoginPage } from '@/features/auth/login-page'
import { RegisterPage } from '@/features/auth/register-page'
import { HomePage } from '@/features/home'
import { MenuPage } from '@/features/menu'
import { HubPage } from '@/features/avaliacoes'
// ... imports

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Rotas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="avaliacoes" element={<HubPage />} />
        <Route path="avaliacoes/protocolo/:id" element={<ProtocoloDetailPage />} />
        <Route path="analise" element={<AnalysisPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="clientes" element={<AlunosPage />} />
        <Route path="clientes/:id" element={<ClienteDetailPage />} />
        <Route path="avaliacao/nova" element={<NovaAvaliacaoPage />} />
        <Route path="avaliacao/incremental" element={<AvaliacaoIncrementalPage />} />
        <Route path="avaliacao/vo2max-esteira" element={<Vo2MaxEsteiraPage />} />
        <Route path="agenda" element={<AgendaPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

### 3.8 Página de Login — `src/features/auth/login-page.tsx`

```typescript
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/stores/auth'
import { loginSchema, type LoginInput } from '@/types/auth'
import { isAxiosError } from 'axios'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setError(null)
    try {
      await login(data)
      navigate('/', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const msg = err.response.data?.message
        if (err.response.status === 429) {
          setError(msg ?? 'Muitas tentativas. Tente novamente mais tarde.')
        } else {
          setError(msg ?? 'Erro ao fazer login')
        }
      } else {
        setError('Erro de conexão. Tente novamente.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Proinsight</h1>
          <p className="text-muted-foreground mt-1 text-sm">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 3.9 Página de Cadastro — `src/features/auth/register-page.tsx`

A página tem um **seletor de abas** (Profissional / Academia). A aba "Profissional" só pede os dados básicos (email, userName, senha). A aba "Academia" exibe campos adicionais da academia.

```typescript
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/stores/auth'
import {
  registerUserSchema,
  registerAcademiaSchema,
  type RegisterUserInput,
  type RegisterAcademiaInput,
} from '@/types/auth'
import { isAxiosError } from 'axios'

type Tab = 'profissional' | 'academia'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('profissional')

  const schema = tab === 'academia' ? registerAcademiaSchema : registerUserSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserInput | RegisterAcademiaInput>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: RegisterUserInput | RegisterAcademiaInput) {
    setError(null)
    try {
      await registerUser(data)
      navigate('/', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data as Record<string, unknown>
        const violations = body.violations as Array<{ field: string; message: string }> | undefined
        if (violations?.length) {
          setError(violations[0].message)
        } else {
          setError(String(body.detail ?? body.message ?? 'Erro ao criar conta'))
        }
      } else {
        setError('Erro de conexão. Tente novamente.')
      }
    }
  }

  function switchTab(newTab: Tab) {
    setTab(newTab)
    setError(null)
    reset()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Proinsight</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie sua conta</p>
        </div>

        {/* Seletor de abas */}
        <div className="flex rounded-xl bg-muted p-1">
          <button onClick={() => switchTab('profissional')} className="...">Profissional</button>
          <button onClick={() => switchTab('academia')} className="...">Academia</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* email, userName, password — sempre visíveis */}
          ...

          {tab === 'academia' && (
            <>
              {/* Dados da academia: nome, CNPJ, razão social, telefone */}
              {/* Endereço: rua, numero, cidade, estado, cep */}
            </>
          )}

          <button type="submit">Criar conta</button>
        </form>
      </div>
    </div>
  )
}
```

### 3.10 Integração com React Query

Para cachear dados do usuário e academias após o login:

```typescript
// src/hooks/use-user.ts
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth-service'
import { useAuth } from '@/stores/auth'

export function useCurrentUser() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,   // 5 min antes de revalidar
    gcTime: 30 * 60 * 1000,      // 30 min no cache
    refetchOnWindowFocus: false,
  })
}
```

### 3.11 Substituir MOCK_USER_ID nos Serviços

Atualizar hooks que usam `MOCK_USER_ID`:

```typescript
// hooks/use-protocolo-hub.ts
import { useAuth } from '@/stores/auth'

export function useProtocoloHub() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['protocolo-hub', user?.id],
    queryFn: () => protocoloService.getHub(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
```

---

## 4. Segurança

### 4.1 Armazenamento de Tokens

| O quê | Onde | Por quê |
|-------|------|---------|
| JWT (24h) | `localStorage` | Expira rápido. Não contém dados sensíveis. |
| Refresh Token (7d) | `localStorage` | Rotação (one-time use). Se vazar, o anterior já foi invalidado. |

> **Nota:** `sessionStorage` é uma alternativa para janelas/abas, mas `localStorage` é mais prático para refresh automático. Em nenhum caso use `document.cookie` sem `HttpOnly` — JS consegue ler cookies normais, então não há ganho real de segurança.

### 4.2 CSP (Content Security Policy)

Adicionar no `<head>` do `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' http://localhost:8080 https://api.proinsight.app;
    img-src 'self' data:;
    font-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
/>
```

### 4.3 Boas Práticas

- **Nunca** exibir o JWT ou refresh token no console ou em logs
- **Nunca** enviar tokens em URLs (query params)
- **Sempre** validar inputs com Zod (tanto no form quanto em dados da API)
- **Sempre** sanitizar dados exibidos (React já faz escaping por padrão, mas cuidado com `dangerouslySetInnerHTML`)
- **Configurar** proxy do Vite em dev para evitar misturar origens:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 5. Plano de Implementação

### Fase 1 — Fundação (AuthContext + Token)

| # | Tarefa | Arquivos |
|---|---|---|
| 1 | Tipos e schemas Zod | `src/types/auth.ts` |
| 2 | Serviço de auth | `src/services/auth-service.ts` |
| 3 | Token storage | `src/lib/token.ts` |
| 4 | AuthContext + AuthProvider | `src/stores/auth.tsx` |
| 5 | Adicionar AuthProvider no AppProvider | `src/components/providers/app-provider.tsx` |

### Fase 2 — Axios e Rotas

| # | Tarefa | Arquivos |
|---|---|---|
| 6 | Request interceptor (Bearer + X-Academia-Id) | `src/lib/api.ts` |
| 7 | Response interceptor (refresh 401, tratamento 403/429) | `src/lib/api.ts` |
| 8 | ProtectedRoute + PublicRoute | `src/lib/router.tsx` |
| 9 | Rotas públicas (/login, /register) e proteção das existentes | `src/lib/router.tsx` |

### Fase 3 — Páginas de Auth

| # | Tarefa | Arquivos |
|---|---|---|
| 10 | Página de Login | `src/features/auth/login-page.tsx` |
| 11 | Página de Cadastro | `src/features/auth/register-page.tsx` |
| 12 | Hook useCurrentUser (React Query) | `src/hooks/use-user.ts` |

### Fase 4 — Integração

| # | Tarefa | Arquivos |
|---|---|---|
| 13 | Substituir MOCK_USER_ID no useProtocoloHub | `src/hooks/use-protocolo-hub.ts` |
| 14 | Substituir MOCK_USER_ID nas páginas de avaliação | `src/features/avaliacao/**/*.tsx` |
| 15 | Perfil do usuário com dados reais | `src/features/profile/index.tsx` |
| 16 | Saudação no dashboard com userName | `src/features/home/**/*.tsx` |

### Fase 5 — Multi-Tenancy (Academias)

| # | Tarefa | Arquivos |
|---|---|---|
| 17 | Seletor de academia ativa | Sidebar + `src/stores/auth.tsx` |
| 18 | Enviar X-Academia-Id no interceptor | `src/lib/api.ts` |
| 19 | Persistir academia selecionada | `localStorage` |

### Fase 6 — Finalização

| # | Tarefa | Arquivos |
|---|---|---|
| 20 | CSP no index.html | `index.html` |
| 21 | Proxy Vite para dev | `vite.config.ts` |
| 22 | Testar fluxo completo: login → navegação → refresh → logout | Manual |
| 23 | Testar fluxo de erro: 401 → refresh → retry | Manual |
| 24 | Testar fluxo de registro → auto-login → redirect | Manual |
