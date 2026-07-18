import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useProtocoloDetalhe } from '@/hooks/use-protocolo-hub'
import { ProtocoloLayout } from './protocolo/protocolo-layout'
import { DescriptionSection } from './protocolo/sections/description-section'
import { HowToSection } from './protocolo/sections/how-to-section'
import { CalculatorSection } from './protocolo/sections/calculator-section'
import { InfoSection } from './protocolo/sections/info-section'
import { CriteriaSection } from './protocolo/sections/criteria-section'
import { ClassificationSection } from './protocolo/sections/classification-section'
import { ObservationsSection } from './protocolo/sections/observations-section'
import { ReferencesSection } from './protocolo/sections/references-section'

export function ProtocoloDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: protocolo, isLoading } = useProtocoloDetalhe(id ?? '')

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  if (!protocolo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-muted-foreground text-sm">Protocolo não encontrado</p>
      </div>
    )
  }

  return (
    <ProtocoloLayout protocolo={protocolo}>
      <DescriptionSection protocolo={protocolo} />
      <HowToSection protocolo={protocolo} />
      <CalculatorSection protocolo={protocolo} />
      <InfoSection protocolo={protocolo} />
      <CriteriaSection protocolo={protocolo} />
      {protocolo.tabelaClassificacaoId && (
        <ClassificationSection tabelaClassificacaoId={protocolo.tabelaClassificacaoId} />
      )}
      <ObservationsSection protocolo={protocolo} />
      <ReferencesSection protocolo={protocolo} />
    </ProtocoloLayout>
  )
}
