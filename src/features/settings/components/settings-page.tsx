import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { SettingsContent } from './settings-content'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <div>
            <h1 className="text-foreground text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground text-sm">Personalize sua experiência</p>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </PageLayout>
  )
}
