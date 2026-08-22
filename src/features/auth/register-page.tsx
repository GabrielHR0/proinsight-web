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
import { Mail, Lock, User, Building2, FileText, Phone, MapPin, AlertCircle, ChevronRight, UserCircle, Eye, EyeOff, BadgeCheck, CreditCard } from 'lucide-react'

type Tab = 'profissional' | 'academia'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('profissional')
  const [showPassword, setShowPassword] = useState(false)

  const isAcademia = tab === 'academia'

  const userForm = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
  })

  const academiaForm = useForm<RegisterAcademiaInput>({
    resolver: zodResolver(registerAcademiaSchema),
  })

  const form = isAcademia ? academiaForm : userForm
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

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
    userForm.reset()
    academiaForm.reset()
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        backgroundColor: 'var(--muted)',
        backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(0,208,158,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(0,208,158,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(0,208,158,0.2) 0%, transparent 40%)',
        backgroundSize: '200% 200%',
        animation: 'bg-drift 20s ease-in-out infinite',
      }}
    >
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <img src="/logo_green.png" alt="Proinsight" className="mx-auto mb-1 h-40 w-auto dark:hidden" />
          <img src="/logo_white.png" alt="Proinsight" className="mx-auto mb-1 h-40 w-auto hidden dark:block" />
          <h1 className="text-foreground text-2xl font-bold tracking-tight uppercase">PROINSIGHT</h1>
          <p className="text-muted-foreground mt-1 text-sm">Crie sua conta</p>
        </div>

        <div className="bg-background/80 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => switchTab('profissional')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === 'profissional'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCircle size={16} />
              Profissional
            </button>
            <button
              type="button"
              onClick={() => switchTab('academia')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === 'academia'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 size={16} />
              Academia
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="group">
              <label htmlFor="email" className="text-foreground mb-1.5 block text-sm font-medium">E-mail</label>
              <div className="relative">
                <Mail size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
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

            <div className="group">
              <label htmlFor="userName" className="text-foreground mb-1.5 block text-sm font-medium">Nome de usuário</label>
              <div className="relative">
                <User size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="userName"
                  className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                  {...register('userName')}
                />
              </div>
              {errors.userName && (
                <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> {errors.userName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <label htmlFor="cref" className="text-foreground mb-1.5 block text-sm font-medium">CREF</label>
                <div className="relative">
                  <BadgeCheck size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    id="cref"
                    className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                    placeholder="Ex: 012345-G/RN"
                    {...register('cref')}
                  />
                </div>
                {errors.cref && (
                  <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                    <AlertCircle size={12} /> {errors.cref.message}
                  </p>
                )}
              </div>
              <div className="group">
                <label htmlFor="cpf" className="text-foreground mb-1.5 block text-sm font-medium">CPF</label>
                <div className="relative">
                  <CreditCard size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    id="cpf"
                    className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                    placeholder="000.000.000-00"
                    {...register('cpf')}
                  />
                </div>
                {errors.cpf && (
                  <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                    <AlertCircle size={12} /> {errors.cpf.message}
                  </p>
                )}
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="text-foreground mb-1.5 block text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <div className="group">
              <label htmlFor="confirmPassword" className="text-foreground mb-1.5 block text-sm font-medium">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                  <AlertCircle size={12} /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {isAcademia && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-5">
                <div className="border-border/50 border-t pt-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Building2 size={16} className="text-primary shrink-0" />
                    <p className="text-foreground text-sm font-semibold">Dados da Academia</p>
                  </div>

                  <div className="group">
                    <label htmlFor="academiaNome" className="text-foreground mb-1.5 block text-sm font-medium">Nome da academia</label>
                    <div className="relative">
                      <Building2 size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                      <input
                        id="academiaNome"
                        className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2"
                        {...register('academiaNome')}
                      />
                    </div>
                    {errors.academiaNome && (
                      <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                        <AlertCircle size={12} /> {errors.academiaNome.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="group">
                      <label htmlFor="cnpj" className="text-foreground mb-1.5 block text-sm font-medium">CNPJ <span className="text-muted-foreground font-normal">(opcional)</span></label>
                      <div className="relative">
                        <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                        <input id="cnpj" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('cnpj')} />
                      </div>
                    </div>
                    <div className="group">
                      <label htmlFor="telefone" className="text-foreground mb-1.5 block text-sm font-medium">Telefone <span className="text-muted-foreground font-normal">(opcional)</span></label>
                      <div className="relative">
                        <Phone size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                        <input id="telefone" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('telefone')} />
                      </div>
                    </div>
                  </div>

                  <div className="group mt-3">
                    <label htmlFor="razaoSocial" className="text-foreground mb-1.5 block text-sm font-medium">Razão social <span className="text-muted-foreground font-normal">(opcional)</span></label>
                    <div className="relative">
                      <FileText size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                      <input id="razaoSocial" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('razaoSocial')} />
                    </div>
                  </div>
                </div>

                <div className="border-border/50 border-t pt-5">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <p className="text-foreground text-sm font-semibold">Endereço <span className="text-muted-foreground font-normal">(opcional)</span></p>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label htmlFor="endereco.rua" className="text-foreground mb-1.5 block text-sm font-medium">Rua</label>
                      <div className="relative">
                        <MapPin size={16} className="text-muted-foreground group-focus-within:text-primary absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
                        <input id="endereco.rua" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 pl-10 pr-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.rua')} />
                      </div>
                      {errors.endereco?.rua && (
                        <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                          <AlertCircle size={12} /> {errors.endereco.rua.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label htmlFor="endereco.numero" className="text-foreground mb-1.5 block text-sm font-medium">Número</label>
                        <input id="endereco.numero" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.numero')} />
                      </div>
                      <div className="group">
                        <label htmlFor="endereco.cidade" className="text-foreground mb-1.5 block text-sm font-medium">Cidade</label>
                        <input id="endereco.cidade" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cidade')} />
                        {errors.endereco?.cidade && (
                          <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                            <AlertCircle size={12} /> {errors.endereco.cidade.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <label htmlFor="endereco.estado" className="text-foreground mb-1.5 block text-sm font-medium">Estado</label>
                        <input id="endereco.estado" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.estado')} />
                        {errors.endereco?.estado && (
                          <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                            <AlertCircle size={12} /> {errors.endereco.estado.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <label htmlFor="endereco.cep" className="text-foreground mb-1.5 block text-sm font-medium">CEP</label>
                        <input id="endereco.cep" className="bg-background text-foreground ring-border focus:ring-primary/30 w-full rounded-xl border border-border py-2.5 px-3 text-sm outline-none ring-0 transition-all focus:ring-2" {...register('endereco.cep')} />
                        {errors.endereco?.cep && (
                          <p className="text-destructive mt-1 flex items-center gap-1 text-xs">
                            <AlertCircle size={12} /> {errors.endereco.cep.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ChevronRight size={16} />
                  Criar conta
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-muted-foreground text-center text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium transition-colors hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
