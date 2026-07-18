import { ClipboardList } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function HowToSection({ protocolo }: Props) {
  if (!protocolo.comoRealizar) return null

  return (
    <section>
      <SectionHeader icon={<ClipboardList size={16} />} title="Como Realizar" />
      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{protocolo.comoRealizar}</p>
    </section>
  )
}
