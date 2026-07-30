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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Proinsight</h1>
          <p className="text-muted-foreground mt-1 text-sm">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-foreground text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-foreground text-sm font-medium">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm"
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
            className="bg-primary text-primary-foreground w-full rounded-lg px-3 py-2.5 text-sm font-medium disabled:opacity-50"
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
// placeholder
