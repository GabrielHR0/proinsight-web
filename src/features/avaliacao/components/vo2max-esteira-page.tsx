import { useLocation, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Vo2MaxWizard } from './vo2max-wizard'

interface AvaliacaoState {
  clienteId: string
  clienteNome: string
  protocoloId: string
}

export function Vo2MaxEsteiraPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as AvaliacaoState | null

  if (!state) {
    navigate('/avaliacao/nova')
    return null
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/avaliacao/nova')} />
          <div>
            <h1 className="text-primary-foreground text-xl font-bold">Esteira Incremental</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">VO₂max</p>
          </div>
        </div>
      }
    >
      <Vo2MaxWizard
        clienteId={state.clienteId}
        clienteNome={state.clienteNome}
        protocoloId={state.protocoloId}
        onExit={() => navigate('/avaliacao/nova')}
        onNewEvaluation={() => navigate('/avaliacao/nova')}
        onDone={() => navigate('/avaliacoes')}
      />
    </PageLayout>
  )
}
