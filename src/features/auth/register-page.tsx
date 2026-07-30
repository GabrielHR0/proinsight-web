import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/stores/auth'
import { registerSchema, type RegisterInput } from '@/types/auth'
import { isAxiosError } from 'axios'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Proinsight</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-foreground text-sm font-medium">E-mail</label>
            <input id="email" type="email" autoComplete="email" className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm" {...register('email')} />
            {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="userName" className="text-foreground text-sm font-medium">Nome de usuário</label>
            <input id="userName" className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm" {...register('userName')} />
            {errors.userName && <p className="text-destructive mt-1 text-xs">{errors.userName.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-foreground text-sm font-medium">Senha</label>
            <input id="password" type="password" autoComplete="new-password" className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm" {...register('password')} />
            {errors.password && <p className="text-destructive mt-1 text-xs">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="academiaNome" className="text-foreground text-sm font-medium">Nome da academia</label>
            <input id="academiaNome" className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm" {...register('academiaNome')} />
            {errors.academiaNome && <p className="text-destructive mt-1 text-xs">{errors.academiaNome.message}</p>}
          </div>

          <div>
            <label htmlFor="cnpj" className="text-foreground text-sm font-medium">CNPJ <span className="text-muted-foreground">(opcional)</span></label>
            <input id="cnpj" className="text-foreground bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm" {...register('cnpj')} />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground w-full rounded-lg px-3 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
// placeholder
