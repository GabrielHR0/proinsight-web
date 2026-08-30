import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/auth-service'
import { isAxiosError } from 'axios'
import { AtSign, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ForgotInput = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotInput) {
    setError(null)
    try {
      await authService.forgotPassword(data.email)
      setSuccess(true)
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const msg = err.response.data?.message
        if (err.response.status === 429) {
          setError(msg ?? 'Muitas tentativas. Tente novamente mais tarde.')
        } else {
          setError(msg ?? 'Erro ao enviar e-mail')
        }
      } else {
        setError('Erro de conexão. Tente novamente.')
      }
    }
  }

  if (success) {
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
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
          <div className="bg-background/80 w-full rounded-2xl p-6 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <h1 className="text-foreground text-xl font-bold">E-mail enviado</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link
              to="/login"
              className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    )
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
          <p className="text-muted-foreground mt-1 text-sm">Recupere sua senha</p>
        </div>

        <div className="flex flex-1 flex-col justify-center pb-8">
          <div className="bg-background/80 w-full rounded-2xl p-6 shadow-sm backdrop-blur-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="text-foreground mb-1.5 block text-sm font-medium">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <AtSign size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                    <AlertCircle size={12} /> {errors.email.message}
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
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Enviar link de recuperação
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="text-muted-foreground mt-5 text-center text-sm">
            Lembrou a senha?{' '}
            <Link to="/login" className="text-primary font-medium transition-colors hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
