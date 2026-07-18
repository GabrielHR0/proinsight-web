import { BarChart3 } from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { EmptyState } from '@/components/empty-state'

export function AnalysisPage() {
  return (
    <PageLayout
      header={
        <div>
          <h1 className="text-primary-foreground text-2xl font-bold">Análise</h1>
          <p className="text-primary-foreground/80 mt-0.5 text-sm">Acompanhe a evolução dos seus alunos</p>
        </div>
      }
    >
      <EmptyState
        icon={<BarChart3 size={40} strokeWidth={1.5} />}
        title="Nenhum dado disponível"
        description="Os resultados das avaliações aparecerão aqui com gráficos e comparativos"
      />
    </PageLayout>
  )
}