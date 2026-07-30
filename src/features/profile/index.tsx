import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/stores/auth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <PageLayout
      header={
        <div>
          <h1 className="text-primary-foreground text-2xl font-bold">Perfil</h1>
          <p className="text-primary-foreground/80 mt-0.5 text-sm">Suas informações profissionais</p>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="bg-accent/10 text-accent flex size-24 items-center justify-center rounded-full text-4xl font-bold">
          {user?.userName?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        <div className="w-full space-y-3">
          <Card className="p-4">
            <p className="text-foreground text-sm font-medium">{user?.userName ?? 'Usuário'}</p>
            <p className="text-muted-foreground text-xs">Avaliador</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-xs">{user?.email ?? ''}</p>
          </Card>
          <Card className="p-4">
            <p className="text-muted-foreground text-xs">Configure suas informações profissionais em Configurações</p>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
