import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/auth'
import type { User } from '@/types/auth'

function resolverPerfil(user: User | null): string {
  if (!user) return 'Profissional de avaliação'
  const todasPermissoes = new Set(
    Object.values(user.academiaPermissoes ?? {}).flatMap((perms) => perms),
  )
  if (todasPermissoes.has('SUPER_ADMIN')) return 'Super Administrador'
  if (
    todasPermissoes.has('ACADEMIAS_ATUALIZAR') ||
    todasPermissoes.has('USUARIOS_CRIAR')
  ) {
    return 'Administrador'
  }
  if (todasPermissoes.size > 0) return 'Profissional de avaliação'
  return 'Avaliador'
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <div className="flex-1">
            <h1 className="text-primary-foreground text-xl font-bold">Perfil</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">Suas informações profissionais</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Card do usuário */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm">
          <div className="relative flex size-20 items-center justify-center rounded-full bg-muted text-3xl font-black tracking-tight text-foreground">
            {user?.userName?.charAt(0)?.toUpperCase() ?? '?'}
            <span className="bg-primary absolute right-1 bottom-1 size-4 rounded-full border-2 border-card" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight">{user?.userName ?? 'Usuário'}</h2>
            <p className="text-muted-foreground text-sm">{user?.email ?? ''}</p>
          </div>
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.14em]">
            {resolverPerfil(user)}
          </span>
        </div>

        {/* Informações da conta */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Nome de usuário
            </span>
            <span className="text-foreground text-sm font-semibold truncate">{user?.userName ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              E-mail
            </span>
            <span className="text-foreground text-sm font-semibold truncate">{user?.email ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Academias vinculadas
            </span>
            <span className="text-foreground text-sm font-semibold truncate">
              {user?.academiaIds?.length ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Acesso
            </span>
            <span className="text-foreground text-sm font-semibold truncate">{resolverPerfil(user)}</span>
          </div>
        </div>

        {/* Sair */}
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-11 w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isLoggingOut ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut size={16} />
              Sair da conta
            </>
          )}
        </Button>
      </div>
    </PageLayout>
  )
}
