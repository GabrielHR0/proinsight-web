import { MessageSquareText } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function ObservationsSection({ protocolo }: Props) {
  if (!protocolo.observacoes) return null

  return (
    <section>
      <SectionHeader icon={<MessageSquareText size={16} />} title="Observações" />
      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{protocolo.observacoes}</p>
    </section>
  )
}
