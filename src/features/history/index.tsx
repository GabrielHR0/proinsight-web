import { History } from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { EmptyState } from '@/components/empty-state'

export function HistoryPage() {
  return (
    <PageLayout
      header={
        <div>
          <h1 className="text-primary-foreground text-2xl font-bold">Histórico</h1>
          <p className="text-primary-foreground/80 mt-0.5 text-sm">Histórico completo de avaliações</p>
        </div>
      }
    >
      <EmptyState
        icon={<History size={40} strokeWidth={1.5} />}
        title="Nenhuma avaliação registrada"
        description="As avaliações realizadas aparecerão aqui em ordem cronológica"
      />
    </PageLayout>
  )
}