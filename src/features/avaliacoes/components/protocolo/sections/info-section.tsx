import { Clock, Ruler, Wrench, Info } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import type { ProtocoloDetalhe } from '@/types/protocolo'
import { cn } from '@/lib/utils'

interface Props {
  protocolo: ProtocoloDetalhe
}

function InfoBadge({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | null }) {
  if (!value) return null

  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
      <Icon size={14} className="text-muted-foreground shrink-0" />
      <div className="flex flex-col">
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{label}</span>
        <span className="text-foreground text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

export function InfoSection({ protocolo }: Props) {
  const tempo = protocolo.tempoMinimoSegundos || protocolo.tempoMaximoSegundos
    ? `${protocolo.tempoMinimoSegundos ?? 0}s - ${protocolo.tempoMaximoSegundos ?? '∞'}s`
    : null

  const hasInfo = tempo || protocolo.unidadeMedida || protocolo.equipamentoNecessario
  if (!hasInfo) return null

  return (
    <section>
      <SectionHeader icon={<Info size={16} />} title="Informações" />
      <div className={cn('flex flex-wrap gap-2')}>
        <InfoBadge icon={Clock} label="Tempo" value={tempo} />
        <InfoBadge icon={Ruler} label="Unidade" value={protocolo.unidadeMedida} />
        <InfoBadge icon={Wrench} label="Equipamento" value={protocolo.equipamentoNecessario} />
      </div>
    </section>
  )
}
