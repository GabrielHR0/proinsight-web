import { FileText } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function DescriptionSection({ protocolo }: Props) {
  if (!protocolo.descricao) return null

  return (
    <section>
      <SectionHeader icon={<FileText size={16} />} title="Descrição" />
      <p className="text-muted-foreground text-sm leading-relaxed">{protocolo.descricao}</p>
    </section>
  )
}
