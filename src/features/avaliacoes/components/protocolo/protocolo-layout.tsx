import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/ui/back-button'
import { CategoryVisual } from '@/components/category-visual'
import type { ProtocoloDetalhe } from '@/types/protocolo'
import { PageLayout } from '@/components/layout/page-layout'

interface Props {
  protocolo: ProtocoloDetalhe
  children: ReactNode
}

export function ProtocoloLayout({ protocolo, children }: Props) {
  const navigate = useNavigate()

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/avaliacoes')} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-primary-foreground truncate text-xl font-bold">{protocolo.nome}</h1>
              <CategoryVisual categoria={protocolo.categoria} />
            </div>
            {protocolo.unidadeMedida && (
              <p className="text-primary-foreground/70 mt-0.5 text-xs">Unidade: {protocolo.unidadeMedida}</p>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </PageLayout>
  )
}
