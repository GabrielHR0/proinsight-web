import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { SettingsContent } from './settings-content'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
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
