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

const INFO_ROWS = [
  { label: 'Nome de usuário', getValue: (u: User | null) => u?.userName ?? '—' },
  { label: 'E-mail', getValue: (u: User | null) => u?.email ?? '—' },
  { label: 'Academias vinculadas', getValue: (u: User | null) => String(u?.academiaIds?.length ?? 0) },
  { label: 'Acesso', getValue: (u: User | null) => resolverPerfil(u) },
] as const

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
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-black tracking-tight text-foreground">
              {user?.userName?.charAt(0)?.toUpperCase() ?? '?'}
              <span className="bg-primary absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-2 border-card" />
            </div>
            <div className="min-w-0">
              <h2 className="text-foreground truncate text-base font-bold tracking-tight">{user?.userName ?? 'Usuário'}</h2>
              <p className="text-muted-foreground truncate text-xs">{user?.email ?? ''}</p>
              <span className="text-muted-foreground mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-[0.14em]">
                {resolverPerfil(user)}
              </span>
            </div>
          </div>

          <div className="border-t border-border/70 divide-y divide-border/70">
            {INFO_ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {row.label}
                </span>
                <span className="text-foreground text-sm font-semibold truncate max-w-[60%] text-right">
                  {row.getValue(user)}
                </span>
              </div>
            ))}
          </div>
        </div>

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
