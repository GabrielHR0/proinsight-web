import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AvaliacaoLayout } from '@/components/layout/avaliacao-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { avaliacaoService } from '@/services/avaliacao-service'
import type { DadosPreAvaliacao } from '@/services/avaliacao-service'
import { cn } from '@/lib/utils'

interface AvaliacaoState {
  clienteId: string
  clienteNome: string
  protocoloId: string
}

const STEPS = [
  { label: 'Dados' },
  { label: 'Protocolo' },
  { label: 'Resultado' },
]

export function Vo2MaxEsteiraPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as AvaliacaoState | null

  const [step, setStep] = useState(0)
  const [dados, setDados] = useState({
    sexo: '' as 'MASCULINO' | 'FEMININO' | '',
    idade: '',
    pesoKg: '',
    alturaCm: '',
  })

  const { data: preDados, isLoading: loadingPreDados } = useQuery<DadosPreAvaliacao>({
    queryKey: ['dados-pre-avaliacao', state?.protocoloId, state?.clienteId],
    queryFn: () => avaliacaoService.buscarDadosPreAvaliacao(state!.protocoloId, state!.clienteId),
    enabled: !!state?.protocoloId && !!state?.clienteId,
  })

  useEffect(() => {
    if (preDados) {
      setDados({
        sexo: preDados.sexo,
        idade: String(preDados.idade),
        pesoKg: String(preDados.peso_kg),
        alturaCm: String(preDados.altura_cm),
      })
    }
  }, [preDados])

  if (!state) {
    navigate('/avaliacao/nova')
    return null
  }

  if (loadingPreDados) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
        <Loader2 size={24} className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Carregando dados...</p>
      </div>
    )
  }

  const dadosOk = dados.sexo !== '' && dados.idade !== '' && dados.pesoKg !== '' && dados.alturaCm !== ''

  return (
    <AvaliacaoLayout
      title="Esteira Incremental"
      steps={STEPS}
      currentStep={step}
      onNext={() => {
        if (step < STEPS.length - 1) setStep(step + 1)
      }}
      onBack={() => {
        if (step > 0) setStep(step - 1)
      }}
      nextDisabled={!dadosOk}
    >
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
              Dados do aluno
            </h2>
            {preDados && (
              <p className="text-muted-foreground text-xs">
                Pré-preenchido — ajuste se necessário
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-xs font-medium">Sexo</Label>
            <RadioGroup
              value={dados.sexo}
              onValueChange={(v) => setDados((p) => ({ ...p, sexo: v as 'MASCULINO' | 'FEMININO' }))}
              className="flex gap-3"
            >
              {(['MASCULINO', 'FEMININO'] as const).map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                    dados.sexo === opt
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30',
                  )}
                >
                  <RadioGroupItem value={opt} className="sr-only" />
                  {opt === 'MASCULINO' ? 'Masculino' : 'Feminino'}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Idade</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="anos"
                value={dados.idade}
                onChange={(e) => setDados((p) => ({ ...p, idade: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Peso (kg)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="kg"
                value={dados.pesoKg}
                onChange={(e) => setDados((p) => ({ ...p, pesoKg: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-xs font-medium">Altura (cm)</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="cm"
              value={dados.alturaCm}
              onChange={(e) => setDados((p) => ({ ...p, alturaCm: e.target.value }))}
            />
          </div>

          {preDados?.data_ultima_avaliacao_imc && (
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-muted-foreground text-xs">Última avaliação IMC</p>
              <p className="text-foreground text-sm font-medium">
                {new Date(preDados.data_ultima_avaliacao_imc).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">Em breve — configuração do protocolo</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Check size={32} />
          </div>
          <p className="text-foreground text-base font-semibold">Resultado</p>
          <p className="text-muted-foreground mt-1 text-sm">Em breve</p>
        </div>
      )}
    </AvaliacaoLayout>
  )
}
