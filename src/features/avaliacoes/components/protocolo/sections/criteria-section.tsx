import { AlertTriangle } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function CriteriaSection({ protocolo }: Props) {
  if (!protocolo.criteriosExclusao) return null

  return (
    <section>
      <SectionHeader icon={<AlertTriangle size={16} />} title="Critérios de Exclusão" />
      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{protocolo.criteriosExclusao}</p>
    </section>
  )
}
