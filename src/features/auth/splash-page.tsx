import { Link } from 'react-router-dom'

export function SplashPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-8"
      style={{
        backgroundColor: 'var(--muted)',
        backgroundImage: 'radial-gradient(ellipse at 10% 30%, rgba(0,208,158,0.5) 0%, transparent 50%), radial-gradient(ellipse at 90% 70%, rgba(0,208,158,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 10%, rgba(0,208,158,0.2) 0%, transparent 40%)',
        backgroundSize: '200% 200%',
        animation: 'bg-drift 20s ease-in-out infinite',
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <img src="/logo_green.png" alt="Proinsight" className="mx-auto mb-1 h-72 w-auto dark:hidden" />
          <img src="/logo_white.png" alt="Proinsight" className="mx-auto mb-1 h-72 w-auto hidden dark:block" />
        <h1 className="text-foreground text-3xl font-bold tracking-tight -mt-3 uppercase">PROINSIGHT</h1>
        <p className="text-muted-foreground text-sm -mt-2">Gestão de avaliação física</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3 pb-16">
        <Link
          to="/login"
          className="bg-primary text-primary-foreground flex w-full items-center justify-center rounded-2xl border border-primary py-4 text-base font-bold shadow-sm transition-all active:scale-[0.97]"
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className="bg-card text-primary-foreground flex w-full items-center justify-center rounded-2xl py-4 text-base font-bold transition-all active:scale-[0.97]"
        >
          Criar conta
        </Link>
      </div>
    </div>
  )
}
