import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { useMinhaAcademia } from '@/hooks/use-minha-academia'
import { CriarAcademiaForm } from './criar-academia-form'
import {
  Building2, Ticket, LogOut, ArrowLeft, ExternalLink, Loader2
} from 'lucide-react'

type Step = 'choose' | 'create' | 'invite'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data: academia, isLoading } = useMinhaAcademia()
  const [step, setStep] = useState<Step>('choose')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="text-primary animate-spin" />
      </div>
    )
  }

  if (academia) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          backgroundColor: 'var(--muted)',
          backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(0,208,158,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(0,208,158,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(0,208,158,0.2) 0%, transparent 40%)',
          backgroundSize: '200% 200%',
          animation: 'bg-drift 20s ease-in-out infinite',
        }}
      >
        <div className="w-full max-w-sm">
          <div className="bg-background/80 rounded-2xl p-6 shadow-sm backdrop-blur-xl text-center">
            <Building2 size={32} className="text-primary mx-auto mb-4" />
            <h2 className="text-foreground text-lg font-bold mb-1">Você já está vinculado!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sua academia <span className="text-foreground font-semibold">{academia.nomeFantasia}</span> já está registrada.
            </p>
            <button
              onClick={() => navigate('/minha-academia')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <ExternalLink size={16} />
              Ver minha academia
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground mt-3 w-full rounded-xl py-2 text-sm transition-colors"
            >
              Ir para o início
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'create') {
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
        <div className="w-full max-w-lg">
          <div className="bg-background/80 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="text-muted-foreground hover:text-foreground mb-5 flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="mb-1 flex items-center gap-2">
              <Building2 size={20} className="text-primary shrink-0" />
              <h2 className="text-foreground text-lg font-bold">Criar minha academia</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">Preencha os dados para criar sua academia e começar a usar o Proinsight.</p>
            <CriarAcademiaForm onSuccess={() => {}} />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'invite') {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          backgroundColor: 'var(--muted)',
          backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(0,208,158,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(0,208,158,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(0,208,158,0.2) 0%, transparent 40%)',
          backgroundSize: '200% 200%',
          animation: 'bg-drift 20s ease-in-out infinite',
        }}
      >
        <div className="w-full max-w-sm">
          <div className="bg-background/80 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="text-muted-foreground hover:text-foreground mb-5 flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="mb-1 flex items-center gap-2">
              <Ticket size={20} className="text-primary shrink-0" />
              <h2 className="text-foreground text-lg font-bold">Código de convite</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              Insira o código de convite enviado pelo administrador da sua academia.
            </p>
            <div className="bg-muted/50 flex items-center justify-center rounded-xl border border-dashed border-border py-8">
              <p className="text-muted-foreground text-xs">Em breve...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--muted)',
        backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(0,208,158,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(0,208,158,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(0,208,158,0.2) 0%, transparent 40%)',
        backgroundSize: '200% 200%',
        animation: 'bg-drift 20s ease-in-out infinite',
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src="/logo_green.png" alt="Proinsight" className="mx-auto h-32 w-auto dark:hidden" />
          <img src="/logo_white.png" alt="Proinsight" className="mx-auto h-32 w-auto hidden dark:block" />
          <h1 className="text-foreground mt-2 text-2xl font-bold tracking-tight uppercase">Bem-vindo ao Proinsight</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Olá, <span className="text-foreground font-semibold">{user?.userName}</span>!<br />
            Você ainda não está vinculado a nenhuma academia.
          </p>
        </div>

        <div className="bg-background/80 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setStep('create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2.5 rounded-xl px-3 py-4 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <Building2 size={18} />
              Criar minha academia
            </button>
            <button
              type="button"
              onClick={() => setStep('invite')}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border px-3 py-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] hover:bg-muted/50"
            >
              <Ticket size={18} />
              Tenho um código de convite
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
