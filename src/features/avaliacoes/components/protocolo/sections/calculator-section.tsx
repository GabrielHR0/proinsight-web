import { Calculator } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { SmartCalculator } from '../smart-calculator'
import type { ProtocoloDetalhe } from '@/types/protocolo'

interface Props {
  protocolo: ProtocoloDetalhe
}

export function CalculatorSection({ protocolo }: Props) {
  if (!protocolo.calculadora) return null

  return (
    <section>
      <SectionHeader icon={<Calculator size={16} />} title="Calculadora" className="mb-3" />
      <SmartCalculator formula={protocolo.calculadora} />
    </section>
  )
}
