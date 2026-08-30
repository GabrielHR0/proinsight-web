import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/stores/auth'
import { loginSchema, type LoginInput } from '@/types/auth'
import { isAxiosError } from 'axios'
import { AtSign, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
    <div
      className="flex min-h-screen flex-col px-4"
      style={{
        backgroundColor: 'var(--muted)',
        backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(90,161,127,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(90,161,127,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(90,161,127,0.2) 0%, transparent 40%)',
        backgroundSize: '200% 200%',
        animation: 'bg-drift 20s ease-in-out infinite',
      }}
    >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="pt-16 text-center">
          <img src="/logo_green.png" alt="Proinsight" className="mx-auto h-40 w-auto dark:hidden" />
          <img src="/logo_white.png" alt="Proinsight" className="mx-auto h-40 w-auto hidden dark:block" />
          <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight uppercase">PROINSIGHT</h1>
          <p className="text-muted-foreground mt-1 text-sm">Entre na sua conta</p>
        </div>

        <div className="flex flex-1 flex-col justify-center pb-8">
          <div className="bg-background/80 w-full rounded-2xl p-6 shadow-sm backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="group">
              <label htmlFor="login" className="text-foreground mb-1.5 block text-sm font-medium">E-mail ou usuário</label>
              <div className="relative">
                <AtSign size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="login"
                  type="text"
                  autoComplete="username"
                  className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                  {...register('login')}
                />
              </div>
              {errors.login && (
                <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> {errors.login.message}
                </p>
              )}
            </div>

            <div className="group">
              <label htmlFor="password" className="text-foreground mb-1.5 block text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-10 text-sm outline-none ring-0 transition-all focus:ring-2"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} />
                  Entrar
                </span>
              )}
            </button>
          </form>
          </div>

          <p className="text-muted-foreground mt-5 text-center text-sm">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary font-medium transition-colors hover:underline">
              Criar conta
            </Link>
          </p>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            <Link to="/esqueci-senha" className="text-primary font-medium transition-colors hover:underline">
              Esqueceu a senha?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
