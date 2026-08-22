import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, ChevronLeft, ChevronRight, Loader2, Heart, Timer, TrendingUp, Dumbbell, Clock, Zap } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Stepper } from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { avaliacaoService, type DadosPreAvaliacao, type AvaliacaoVo2MaxResponse } from '@/services/avaliacao-service'
import { useAuth } from '@/stores/auth'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Dados' },
  { label: 'Execução' },
  { label: 'Resultado' },
]

const DEFAULTS = {
  inclinacao: 1,
  startSpeed: 6,
  speedIncrement: 1,
  stageDuration: 60,
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface HeartRateReading {
  time: number
  bpm: number
}

interface Vo2MaxWizardProps {
  clienteId: string
  clienteNome: string
  protocoloId: string
  onExit: () => void
  onDone: () => void
}

export function Vo2MaxWizard({ clienteId, clienteNome, protocoloId, onDone }: Vo2MaxWizardProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)

  /* ── step 0: dados ── */
  const [dados, setDados] = useState({
    sexo: '' as 'MASCULINO' | 'FEMININO' | '',
    idade: '',
    pesoKg: '',
    alturaCm: '',
  })

  const { data: preDados, isLoading: loadingPreDados } = useQuery<DadosPreAvaliacao>({
    queryKey: ['dados-pre-avaliacao', protocoloId, clienteId],
    queryFn: () => avaliacaoService.buscarDadosPreAvaliacao(protocoloId, clienteId),
  })

  const originalPesoRef = useRef<string>('')
  const originalAlturaRef = useRef<string>('')
  const imcProtocoloIdRef = useRef('')
  const imcSentRef = useRef(false)

  useEffect(() => {
    if (preDados) {
      const peso = preDados.peso_kg != null && preDados.peso_kg > 0 ? String(preDados.peso_kg) : ''
      const altura = preDados.altura_cm != null && preDados.altura_cm > 0 ? String(preDados.altura_cm) : ''
      originalPesoRef.current = peso
      originalAlturaRef.current = altura
      imcProtocoloIdRef.current = preDados.protocolo_imc_id ?? ''
      imcSentRef.current = false
      setDados({
        sexo: preDados.sexo,
        idade: String(preDados.idade ?? ''),
        pesoKg: peso,
        alturaCm: altura,
      })
    }
  }, [preDados])

  /* ── step 1: protocolo — config ── */
  const [inclinacao, setInclinacao] = useState(String(DEFAULTS.inclinacao))
  const [startSpeed, setStartSpeed] = useState(String(DEFAULTS.startSpeed))
  const [speedIncrement, setSpeedIncrement] = useState(String(DEFAULTS.speedIncrement))
  const [stageDuration, setStageDuration] = useState(String(DEFAULTS.stageDuration))

  /* ── step 1: protocolo — runtime ── */
  const [testPhase, setTestPhase] = useState<'config' | 'running'>('config')
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(DEFAULTS.startSpeed)
  const [stage, setStage] = useState(1)
  const [stageElapsed, setStageElapsed] = useState(0)
  const [hrReadings, setHrReadings] = useState<HeartRateReading[]>([])
  const [currentHr, setCurrentHr] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stageElapsedRef = useRef(0)
  const stageRef = useRef(1)

  /* ── step 2: resultado ── */
  const [serverResult, setServerResult] = useState<AvaliacaoVo2MaxResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  /* ── timer ── */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const stageDurationSec = Number(stageDuration)
  const stageProgressPct = stageDurationSec > 0 ? Math.min((stageElapsed / stageDurationSec) * 100, 100) : 0

  const handleStartTest = useCallback(() => {
    setTestPhase('running')
    setElapsed(0)
    setStage(1)
    setStageElapsed(0)
    setSpeed(Number(startSpeed))
    setHrReadings([])
    stageElapsedRef.current = 0
    stageRef.current = 1

    const startSpd = Number(startSpeed)
    const inc = Number(speedIncrement)
    const stageDur = Number(stageDuration)

    const tick = () => {
      setElapsed((prev) => prev + 1)

      const nextSe = stageElapsedRef.current + 1
      if (nextSe >= stageDur) {
        const newStage = stageRef.current + 1
        stageRef.current = newStage
        stageElapsedRef.current = 0
        setStage(newStage)
        setStageElapsed(0)
        setSpeed(startSpd + (newStage - 1) * inc)
      } else {
        stageElapsedRef.current = nextSe
        setStageElapsed(nextSe)
      }
    }

    clearTimer()
    tick()
    intervalRef.current = setInterval(tick, 1000)
  }, [startSpeed, speedIncrement, stageDuration, clearTimer])

  const handleFinishTest = useCallback(() => {
    clearTimer()
    setStep(2)
  }, [clearTimer])

  const handleAddHr = useCallback(() => {
    const bpm = parseInt(currentHr, 10)
    if (isNaN(bpm) || bpm < 30 || bpm > 250) return
    setHrReadings((prev) => [...prev, { time: elapsed, bpm }])
    setCurrentHr('')
  }, [currentHr, elapsed])

  const handleSubmitResult = useCallback(async () => {
    setSubmitting(true)
    try {
      const response = await avaliacaoService.submitVo2Max({
        cliente_id: clienteId,
        protocolo_id: protocoloId,
        avaliador_id: user!.id,
        resultado: speed,
        inclinacao_percent: Number(inclinacao),
        frequencia_cardiaca: hrReadings.length > 0 ? hrReadings[hrReadings.length - 1].bpm : undefined,
        peso_kg: dados.pesoKg ? Number(dados.pesoKg) : undefined,
        observacoes: observacoes.trim() || undefined,
      })
      setServerResult(response)
    } catch {
      // handled by api.ts toast
    } finally {
      setSubmitting(false)
    }
  }, [clienteId, protocoloId, user, speed, inclinacao, hrReadings, dados, observacoes])

  /* ── derived ── */
  const dadosOk = dados.sexo !== '' && Number(dados.pesoKg) > 0 && Number(dados.alturaCm) > 0
  const isFirst = step === 0

  const displayedSteps = testPhase === 'running'
    ? STEPS.map((s, i) => (i === 1 ? { label: 'Teste' } : s))
    : STEPS

  const handleNext = async () => {
    if (step === 0) {
      const pesoVal = Number(dados.pesoKg)
      const alturaVal = Number(dados.alturaCm)

      if (pesoVal <= 0 || alturaVal <= 0) {
        return
      }

      const originalEmpty = originalPesoRef.current === '' || originalAlturaRef.current === ''
      const pesoEdited = dados.pesoKg !== originalPesoRef.current
      const alturaEdited = dados.alturaCm !== originalAlturaRef.current
      const edited = pesoEdited || alturaEdited

      if (!imcSentRef.current && (originalEmpty || edited)) {
        if (!imcProtocoloIdRef.current) {
          return
        }
        if (originalEmpty) {
          imcSentRef.current = true
          try {
            await avaliacaoService.submitImc({
              cliente_id: clienteId,
              protocolo_id: imcProtocoloIdRef.current,
              avaliador_id: user!.id,
              peso_gramas: Math.round(pesoVal * 1000),
              altura_cm: Math.round(alturaVal),
            })
          } catch {
            imcSentRef.current = false
            return
          }
        } else {
          const confirmed = window.confirm(
            'Os dados de peso/altura foram alterados. Deseja salvar os novos valores?'
          )
          if (confirmed) {
            imcSentRef.current = true
            try {
              await avaliacaoService.submitImc({
                cliente_id: clienteId,
                protocolo_id: imcProtocoloIdRef.current,
                avaliador_id: user!.id,
                peso_gramas: Math.round(pesoVal * 1000),
                altura_cm: Math.round(alturaVal),
              })
            } catch {
              imcSentRef.current = false
              return
            }
          } else {
            imcSentRef.current = true
            setDados((p) => ({
              ...p,
              pesoKg: originalPesoRef.current,
              alturaCm: originalAlturaRef.current,
            }))
          }
        }
      }

      setStep(1)
    } else if (step === 1) {
      setStep(2)
    } else {
      onDone()
    }
  }

  const handleBack = () => {
    if (step === 2 && testPhase === 'running') {
      clearTimer()
      setTestPhase('config')
      setStep(1)
    } else if (step === 1 && testPhase === 'running') {
      clearTimer()
      setTestPhase('config')
      stageElapsedRef.current = 0
      stageRef.current = 1
    } else {
      setStep(step - 1)
    }
  }

  if (loadingPreDados) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <Loader2 size={24} className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-6 pb-6">
        <Stepper steps={displayedSteps} currentStep={step} />
      </div>

      <div className="flex-1 px-6 pb-48 md:pb-32">
        {/* ═══════════ STEP 0: DADOS ═══════════ */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="bg-card shadow-sm rounded-2xl border border-border/70 p-4">
              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                Dados do aluno
              </p>
              <p className="text-foreground mt-0.5 text-base font-bold">{clienteNome}</p>
              {preDados && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Pré-preenchido, ajuste se necessário
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Sexo</Label>
              <RadioGroup
                value={dados.sexo}
                disabled
                className="flex gap-3"
              >
                {(['MASCULINO', 'FEMININO'] as const).map((opt) => (
                  <label
                    key={opt}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all opacity-60 cursor-not-allowed',
                      dados.sexo === opt
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-border text-muted-foreground',
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
                  disabled
                  className="opacity-60 cursor-not-allowed"
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
              <p className="text-muted-foreground/70 text-[11px]">
                Última medição de peso e altura em{' '}
                {new Date(preDados.data_ultima_avaliacao_imc).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {/* ═══════════ STEP 1: PROTOCOLO ═══════════ */}
        {step === 1 && testPhase === 'config' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
                Configuração do Teste
              </h2>
              <p className="text-muted-foreground text-xs">Esteira Incremental — {clienteNome}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground text-xs font-medium">Inclinação (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={inclinacao}
                  onChange={(e) => setInclinacao(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground text-xs font-medium">Velocidade inicial (km/h)</Label>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  step={0.5}
                  value={startSpeed}
                  onChange={(e) => setStartSpeed(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground text-xs font-medium">Incremento (km/h)</Label>
                <Input
                  type="number"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={speedIncrement}
                  onChange={(e) => setSpeedIncrement(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-foreground text-xs font-medium">Duração estágio (seg)</Label>
                <Input
                  type="number"
                  min={30}
                  max={600}
                  step={30}
                  value={stageDuration}
                  onChange={(e) => setStageDuration(e.target.value)}
                />
              </div>
            </div>

            <Card className="p-4">
              <p className="text-muted-foreground text-xs">
                O teste será iniciado com velocidade de <strong>{startSpeed} km/h</strong>, incrementando{' '}
                <strong>{speedIncrement} km/h</strong> a cada{' '}
                <strong>{formatTime(Number(stageDuration))}</strong> de estágio.
              </p>
            </Card>
          </div>
        )}

        {/* ═══════════ STEP 1: TESTE RODANDO ═══════════ */}
        {step === 1 && testPhase === 'running' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <Badge variant="outline" className="border-accent text-accent text-xs">
              TESTE EM ANDAMENTO
            </Badge>

            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Velocidade</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-accent text-6xl font-black tabular-nums tracking-tight">
                  {speed.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-lg font-medium">km/h</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Inclinação: <span className="text-foreground font-semibold">{inclinacao}%</span>
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <Timer size={18} className="text-muted-foreground" />
              <span className="text-foreground text-4xl font-black tabular-nums tracking-wider">
                {formatTime(elapsed)}
              </span>
            </div>

            <div className="w-full max-w-xs">
              <Progress value={stageProgressPct} className="[&>div]:bg-accent h-2" />
              <p className="text-muted-foreground mt-1.5 text-center text-xs">
                Estágio {stage} — {formatTime(stageElapsed)} / {formatTime(stageDurationSec)}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="relative">
                <Heart size={14} className="text-red-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <Input
                  type="number"
                  min={30}
                  max={250}
                  placeholder="FC"
                  className="bg-muted h-10 w-24 pl-8 text-center text-lg tabular-nums"
                  value={currentHr}
                  onChange={(e) => setCurrentHr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddHr() }}
                />
              </div>
              <Button variant="outline" size="sm" className="h-10 gap-1.5" onClick={handleAddHr} disabled={!currentHr}>
                <Heart size={14} className="text-red-400" />
                Registrar
              </Button>
            </div>

            {hrReadings.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {hrReadings.map((r, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full px-3 py-1.5 text-sm tabular-nums">
                    <span className="text-muted-foreground mr-1.5 text-sm tabular-nums">{formatTime(r.time)}</span>
                    {r.bpm} bpm
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ STEP 2: RESULTADO ═══════════ */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {submitting ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={24} className="text-muted-foreground animate-spin" />
                <p className="text-muted-foreground mt-3 text-sm">Salvando avaliação...</p>
              </div>
            ) : serverResult ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-accent/10 text-accent mb-4 flex size-16 items-center justify-center rounded-2xl">
                    <Check size={32} />
                  </div>
                  <p className="text-foreground text-base font-semibold">Avaliação Concluída</p>
                  <p className="text-muted-foreground mt-1 text-sm">{clienteNome}</p>
                </div>

                <Card className="flex flex-col items-center gap-1 p-4 text-center">
                  <TrendingUp size={18} className="text-accent" />
                  <span className="text-foreground text-2xl font-black tabular-nums">
                    {serverResult.classificacao.valor_vo2max}
                  </span>
                  <span className="text-muted-foreground text-xs">VO₂max (mL/kg/min)</span>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Classificação</span>
                    <Badge className="bg-accent text-accent-foreground text-sm">
                      {serverResult.classificacao.nome}
                    </Badge>
                  </div>
                  {serverResult.classificacao.descricao && (
                    <p className="text-muted-foreground mt-2 text-xs">{serverResult.classificacao.descricao}</p>
                  )}
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="flex flex-col items-center gap-1 p-3 text-center">
                    <Dumbbell size={16} className="text-accent" />
                    <span className="text-foreground text-lg font-black tabular-nums">{stage}</span>
                    <span className="text-muted-foreground text-xs">estágios</span>
                  </Card>
                  <Card className="flex flex-col items-center gap-1 p-3 text-center">
                    <Clock size={16} className="text-accent" />
                    <span className="text-foreground text-lg font-black tabular-nums">{formatTime(elapsed)}</span>
                    <span className="text-muted-foreground text-xs">duração</span>
                  </Card>
                  <Card className="flex flex-col items-center gap-1 p-3 text-center">
                    <Zap size={16} className="text-accent" />
                    <span className="text-foreground text-lg font-black tabular-nums">{speed.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs">km/h final</span>
                  </Card>
                  <Card className="flex flex-col items-center gap-1 p-3 text-center">
                    <Heart size={16} className="text-red-400" />
                    <span className="text-foreground text-lg font-black tabular-nums">
                      {hrReadings.length > 0 ? hrReadings[hrReadings.length - 1].bpm : '—'}
                    </span>
                    <span className="text-muted-foreground text-xs">FC final</span>
                  </Card>
                </div>

                {hrReadings.length > 0 && (
                  <Card className="p-4">
                    <h3 className="mb-2 text-sm font-semibold">FC Registradas</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {hrReadings.map((r, i) => (
                        <Badge key={i} variant="secondary" className="text-xs tabular-nums">
                          {formatTime(r.time)} — {r.bpm} bpm
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Label className="text-foreground text-xs font-medium">Observações</Label>
                <Textarea
                  placeholder="Digite as observações da avaliação..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  disabled={submitting}
                  className="min-h-40"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ BOTTOM NAV ═══════════ */}
      <div className="border-border bg-background/80 fixed inset-x-0 z-[55] border-t px-6 py-4 pb-8 backdrop-blur-lg bottom-[72px] md:bottom-0 md:pb-6">
        <div className="flex gap-3">
          {!isFirst && !submitting && (testPhase !== 'running' || step === 2) && (
            <Button variant="outline" className="flex-1 rounded-full" onClick={handleBack}>
              <ChevronLeft size={16} className="mr-1" />
              Voltar
            </Button>
          )}

          {step === 1 && testPhase === 'config' && (
            <Button className="flex-1 rounded-full" onClick={handleStartTest}>
              Iniciar Teste
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}

          {step === 1 && testPhase === 'running' && (
            <Button className="flex-1 rounded-full" onClick={handleFinishTest}>
              Finalizar Teste
              <Check size={16} className="ml-1" />
            </Button>
          )}

          {step === 0 && (
            <Button
              className="flex-1 rounded-full"
              onClick={handleNext}
              disabled={!dadosOk}
            >
              Próximo
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}

          {step === 2 && !submitting && (
            serverResult ? (
              <Button className="flex-1 rounded-full" onClick={onDone}>
                Concluir
                <Check size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                className="flex-1 rounded-full"
                onClick={handleSubmitResult}
              >
                Enviar Resultado
                <ChevronRight size={16} className="ml-1" />
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
