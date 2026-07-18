import { BookOpen } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function ReferencesSection({ protocolo }: Props) {
  if (!protocolo.referenciaBibliografica) return null

  return (
    <section>
      <SectionHeader icon={<BookOpen size={16} />} title="Referências" />
      <p className="text-muted-foreground text-sm leading-relaxed italic whitespace-pre-line">{protocolo.referenciaBibliografica}</p>
    </section>
  )
}
