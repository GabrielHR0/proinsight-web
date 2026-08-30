import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Heart,
  Play,
  SkipForward,
  Timer,
  TrendingUp,
  Dumbbell,
  Clock,
  Gauge,
  CheckCircle2,
  X,
  Search,
  Zap,
  Activity,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/stores/auth'
import { clienteService } from '@/services/cliente-service'
import { avaliacaoService } from '@/services/avaliacao-service'
import type { AvaliacaoVo2MaxResponse } from '@/services/avaliacao-service'
import { cn } from '@/lib/utils'
import type { Cliente } from '@/types/cliente'

/* ── helpers ── */

function calcVo2Max(speedKmh: number, inclinePercent: number): number {
  const velMmin = (speedKmh * 1000) / 60
  if (inclinePercent > 0) {
    return (0.2 * velMmin) + (0.9 * velMmin * inclinePercent / 100) + 3.5
  }
  return (0.2 * velMmin) + 3.5
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type Phase = 'setup' | 'warmup' | 'test' | 'result' | 'submitting' | 'done'

interface HeartRateReading {
  time: number
  bpm: number
}

/* ── default protocol params ── */

const DEFAULTS = {
  warmupSpeed: 5,
  warmupMinutes: 5,
  startSpeed: 6,
  speedIncrement: 1,
  stageDuration: 180,
  incline: 1,
}

const PROTOCOLO_ID = 'protocolo_vo2max_esteira_incremental'

export function AvaliacaoIncrementalPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  /* ── setup state ── */
  const [phase, setPhase] = useState<Phase>('setup')
  const [client, setClient] = useState<Cliente | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [sexo, setSexo] = useState<'MASCULINO' | 'FEMININO'>('MASCULINO')
  const [idade, setIdade] = useState('')
  const [pesoKg, setPesoKg] = useState('')
  const [fcRepouso, setFcRepouso] = useState('')
  const [inclinacao, setInclinacao] = useState(String(DEFAULTS.incline))
  const [warmupEnabled, setWarmupEnabled] = useState(true)
  const [warmupSpeed, setWarmupSpeed] = useState(String(DEFAULTS.warmupSpeed))
  const [warmupMinutos, setWarmupMinutos] = useState(String(DEFAULTS.warmupMinutes))
  const [startSpeedVal, setStartSpeedVal] = useState(String(DEFAULTS.startSpeed))
  const [speedIncrement, setSpeedIncrement] = useState(String(DEFAULTS.speedIncrement))
  const [stageDuration, setStageDuration] = useState(String(DEFAULTS.stageDuration))

  /* ── test runtime state ── */
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(DEFAULTS.startSpeed)
  const [stage, setStage] = useState(1)
  const [stageElapsed, setStageElapsed] = useState(0)
  const [hrReadings, setHrReadings] = useState<HeartRateReading[]>([])
  const [currentHr, setCurrentHr] = useState('')
  const [warmupElapsed, setWarmupElapsed] = useState(0)

  /* ── result state ── */
  const [result, setResult] = useState<AvaliacaoVo2MaxResponse | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── client query ── */
  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.listarTodos(),
  })

  const clientesList = Array.isArray(clientes) ? clientes : []
  const clientesFiltrados = clientesList.filter(
    (c) =>
      c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  /* ── timer logic ── */

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback((tick: () => void) => {
    clearTimer()
    tick()
    intervalRef.current = setInterval(tick, 1000)
  }, [clearTimer])

  useEffect(() => clearTimer, [clearTimer])

  /* ── warmup ── */

  const warmupTotalSeconds = Number(warmupMinutos) * 60

  const handleStartWarmup = useCallback(() => {
    setPhase('warmup')
    setWarmupElapsed(0)
    setSpeed(Number(warmupSpeed))
    const warmupTick = () => {
      setWarmupElapsed((prev) => {
        const next = prev + 1
        if (next >= warmupTotalSeconds) {
          clearTimer()
          setTimeout(() => handleStartTest(), 600)
        }
        return next
      })
    }
    startTimer(warmupTick)
  }, [warmupSpeed, warmupTotalSeconds, clearTimer, startTimer])

  const handleSkipWarmup = useCallback(() => {
    clearTimer()
    handleStartTest()
  }, [clearTimer])

  /* ── test ── */

  const stageDurationSec = Number(stageDuration)

  const handleStartTest = useCallback(() => {
    setPhase('test')
    setElapsed(0)
    setStage(1)
    setStageElapsed(0)
    const finalStartSpeed = phase === 'warmup' ? Number(startSpeedVal) : Number(startSpeedVal)
    setSpeed(finalStartSpeed)
    const testTick = () => {
      setElapsed((e) => e + 1)
      setStageElapsed((se) => {
        const next = se + 1
        if (next >= stageDurationSec) {
          setStage((s) => {
            const newStage = s + 1
            setSpeed(Number(startSpeedVal) + (newStage - 1) * Number(speedIncrement))
            return newStage
          })
          return 0
        }
        return next
      })
    }
    startTimer(testTick)
  }, [phase, startSpeedVal, speedIncrement, stageDurationSec, startTimer])

  const handleFinishTest = useCallback(() => {
    clearTimer()
    setPhase('result')
  }, [clearTimer])

  const handleAddHr = useCallback(() => {
    const bpm = parseInt(currentHr, 10)
    if (isNaN(bpm) || bpm < 30 || bpm > 250) return
    setHrReadings((prev) => [...prev, { time: elapsed + (phase === 'warmup' ? warmupElapsed : 0), bpm }])
    setCurrentHr('')
  }, [currentHr, elapsed, phase, warmupElapsed])

  /* ── submit ── */

  const handleSubmit = async () => {
    if (!client) return
    setPhase('submitting')
    try {
      const response = await avaliacaoService.submitVo2Max({
        cliente_id: client.id,
        protocolo_id: PROTOCOLO_ID,
        avaliador_id: user!.id,
        resultado: speed,
        inclinacao_percent: Number(inclinacao),
        frequencia_cardiaca: hrReadings.length > 0 ? hrReadings[hrReadings.length - 1].bpm : undefined,
        peso_kg: pesoKg ? Number(pesoKg) : undefined,
        idade: idade ? Number(idade) : undefined,
        sexo,
        observacoes: `Teste incremental: ${stage} estágios, ${formatTime(elapsed)} de duração. FC registradas: ${hrReadings.length}`,
      })
      setResult(response)
      setPhase('done')
    } catch {
      toast.error('Erro ao salvar avaliação. Tente novamente.')
      setPhase('result')
    }
  }

  const estimatedVo2 = calcVo2Max(speed, Number(inclinacao))

  /* ── computed values ── */
  const stageSpeed = Number(startSpeedVal) + (stage - 1) * Number(speedIncrement)
  const stageProgressPct = stageDurationSec > 0 ? Math.min((stageElapsed / stageDurationSec) * 100, 100) : 0

  /* ═══════════════ SETUP PHASE ═══════════════ */
  if (phase === 'setup') {
    return (
      <PageLayout
        header={
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate('/avaliacao/nova')} />
            <div>
              <h1 className="text-primary-foreground text-xl font-bold">Teste Incremental</h1>
              <p className="text-primary-foreground/80 mt-0.5 text-sm">VO₂max — Esteira</p>
            </div>
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
          {/* client selection */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Aluno</Label>
            {client ? (
              <div className="border-border flex items-center gap-3 rounded-xl border px-4 py-3">
                <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full text-sm font-bold">
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{client.fullName}</p>
                  <p className="text-muted-foreground text-xs">{client.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setClient(null)}>
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div>
                <div className="relative mb-2">
                  <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar aluno..."
                    className="bg-background pl-9"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                  {clientesFiltrados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClient(c)}
                      className="border-border hover:border-accent/50 hover:bg-accent/[0.02] flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all"
                    >
                      <div className="bg-accent/10 text-accent flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-medium">{c.fullName}</p>
                        <p className="text-muted-foreground text-xs">{c.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* client data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Sexo</Label>
              <Select value={sexo} onValueChange={(v: 'MASCULINO' | 'FEMININO') => setSexo(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Idade</Label>
              <Input type="number" min={10} max={120} placeholder="ex: 30" value={idade} onChange={(e) => setIdade(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Peso (kg)</Label>
              <Input type="number" min={20} max={300} step={0.1} placeholder="ex: 75" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">FC Repouso</Label>
              <Input type="number" min={30} max={200} placeholder="ex: 72" value={fcRepouso} onChange={(e) => setFcRepouso(e.target.value)} />
            </div>
          </div>

          <Separator />

          {/* test config */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Gauge size={16} />Configuração do Teste</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Inclinação (%)</Label>
                <Input type="number" min={0} max={30} step={0.5} value={inclinacao} onChange={(e) => setInclinacao(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Velocidade inicial (km/h)</Label>
                <Input type="number" min={1} max={25} step={0.5} value={startSpeedVal} onChange={(e) => setStartSpeedVal(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Incremento (km/h)</Label>
                <Input type="number" min={0.1} max={5} step={0.1} value={speedIncrement} onChange={(e) => setSpeedIncrement(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Duração estágio (seg)</Label>
                <Input type="number" min={30} max={600} step={30} value={stageDuration} onChange={(e) => setStageDuration(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* warmup config */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} />Aquecimento</h3>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={warmupEnabled} onChange={(e) => setWarmupEnabled(e.target.checked)} />
                <div className="bg-muted-foreground/30 peer-checked:bg-accent h-5 w-9 rounded-full after:absolute after:top-0.5 after:start-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            {warmupEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Velocidade (km/h)</Label>
                  <Input type="number" min={1} max={15} step={0.5} value={warmupSpeed} onChange={(e) => setWarmupSpeed(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Duração (min)</Label>
                  <Input type="number" min={1} max={20} step={1} value={warmupMinutos} onChange={(e) => setWarmupMinutos(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <Button
            className="mt-2 w-full gap-2"
            size="lg"
            disabled={!client || !idade}
            onClick={warmupEnabled ? handleStartWarmup : handleStartTest}
          >
            <Play size={18} />
            {warmupEnabled ? 'Iniciar com Aquecimento' : 'Iniciar Teste'}
          </Button>
        </div>
      </PageLayout>
    )
  }

  /* ═══════════════ WARMUP / TEST — immersive overlay ═══════════════ */
  if (phase === 'warmup' || phase === 'test') {
    const isWarmup = phase === 'warmup'
    const displayTime = isWarmup ? warmupElapsed : elapsed
    const displaySpeed = isWarmup ? Number(warmupSpeed) : stageSpeed
    const progressVal = isWarmup
      ? Math.min((warmupElapsed / warmupTotalSeconds) * 100, 100)
      : stageProgressPct

    return (
      <div className="bg-background fixed inset-0 z-[100] flex flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { clearTimer(); navigate('/avaliacao/nova') }} className="text-muted-foreground size-8 rounded-full">
              <X size={20} />
            </Button>
            <span className="text-muted-foreground text-sm">
              {isWarmup ? 'Aquecimento' : `Estágio ${stage}`}
            </span>
          </div>
          <Badge variant="outline" className={cn('text-xs', isWarmup ? 'border-amber-400 text-amber-500' : 'border-accent text-accent')}>
            {isWarmup ? 'PREPARAÇÃO' : 'TESTE'}
          </Badge>
        </div>

        {/* main content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
          {/* speed */}
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            {isWarmup ? 'Velocidade de Aquecimento' : 'Velocidade'}
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'text-7xl font-black tabular-nums tracking-tight transition-colors',
              isWarmup ? 'text-amber-500' : 'text-accent',
            )}>
              {displaySpeed.toFixed(1)}
            </span>
            <span className="text-muted-foreground ml-1 text-lg font-medium">km/h</span>
          </div>

          {/* incline */}
          <p className="text-muted-foreground mt-1 text-xs">
            Inclinação: <span className="text-foreground font-semibold">{inclinacao}%</span>
          </p>

          {/* timer */}
          <div className="mt-8 flex items-baseline gap-2">
            <Timer size={20} className="text-muted-foreground" />
            <span className="text-foreground text-5xl font-black tabular-nums tracking-wider">
              {formatTime(displayTime)}
            </span>
          </div>

          {/* progress bar */}
          <div className="mt-6 w-full max-w-xs">
            <Progress value={progressVal} className={cn('h-2', isWarmup ? '[&>div]:bg-amber-500' : '[&>div]:bg-accent')} />
            <p className="text-muted-foreground mt-1.5 text-center text-xs">
              {isWarmup
                ? `${formatTime(warmupElapsed)} / ${formatTime(warmupTotalSeconds)}`
                : `${formatTime(stageElapsed)} / ${formatTime(stageDurationSec)}`}
            </p>
          </div>

          {/* HR input (test only) */}
          {!isWarmup && (
            <div className="mt-8 flex items-center gap-3">
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
          )}

          {/* FC readings summary */}
          {!isWarmup && hrReadings.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {hrReadings.map((r, i) => (
                <Badge key={i} variant="secondary" className="text-xs tabular-nums">
                  {r.bpm} bpm
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* bottom actions */}
        <div className="px-6 pb-12">
          {isWarmup ? (
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600" onClick={handleSkipWarmup}>
                <SkipForward size={18} />
                Pular Aquecimento
              </Button>
            </div>
          ) : (
            <Button size="lg" variant="destructive" className="w-full gap-2" onClick={handleFinishTest}>
              <CheckCircle2 size={18} />
              Finalizar Teste
            </Button>
          )}
        </div>
      </div>
    )
  }

  /* ═══════════════ RESULT PHASE ═══════════════ */
  if (phase === 'result') {
    return (
      <PageLayout
        header={
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate('/avaliacao/nova')} />
            <div>
              <h1 className="text-primary-foreground text-xl font-bold">Resultado</h1>
              <p className="text-primary-foreground/80 mt-0.5 text-sm">Teste Incremental</p>
            </div>
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
          {/* client */}
          {client && (
            <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
              <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full text-sm font-bold">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">{client.fullName}</p>
                <p className="text-muted-foreground text-xs">VO₂max — Esteira Incremental</p>
              </div>
            </div>
          )}

          {/* stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="flex flex-col items-center gap-1 p-4 text-center">
              <TrendingUp size={18} className="text-accent" />
              <span className="text-foreground text-2xl font-black tabular-nums">{speed.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">km/h final</span>
            </Card>
            <Card className="flex flex-col items-center gap-1 p-4 text-center">
              <Dumbbell size={18} className="text-accent" />
              <span className="text-foreground text-2xl font-black tabular-nums">{stage}</span>
              <span className="text-muted-foreground text-xs">estágios</span>
            </Card>
            <Card className="flex flex-col items-center gap-1 p-4 text-center">
              <Clock size={18} className="text-accent" />
              <span className="text-foreground text-2xl font-black tabular-nums">{formatTime(elapsed)}</span>
              <span className="text-muted-foreground text-xs">duração</span>
            </Card>
            <Card className="flex flex-col items-center gap-1 p-4 text-center">
              <Zap size={18} className="text-accent" />
              <span className="text-foreground text-2xl font-black tabular-nums">{Math.round(estimatedVo2)}</span>
              <span className="text-muted-foreground text-xs">VO₂ estimado</span>
            </Card>
          </div>

          {/* VO2max detail */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Heart size={16} className="text-red-400" /> Detalhes do Cálculo
            </h3>
            <div className="text-muted-foreground space-y-1 text-xs">
              <p>Velocidade: {speed.toFixed(1)} km/h → {((speed * 1000) / 60).toFixed(1)} m/min</p>
              <p>Inclinação: {inclinacao}%</p>
              <p className="text-foreground mt-2 font-mono text-xs">
                VO₂ = (0.2 × {(speed * 1000 / 60).toFixed(1)}) + (0.9 × {(speed * 1000 / 60).toFixed(1)} × {Number(inclinacao)}/100) + 3.5
              </p>
              <p className="text-accent mt-1 font-semibold">
                = {estimatedVo2.toFixed(2)} mL/kg/min
              </p>
            </div>
          </Card>

          {/* HR readings */}
          {hrReadings.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Heart size={14} className="text-red-400" /> FC Registradas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {hrReadings.map((r, i) => (
                  <Badge key={i} variant="secondary" className="text-xs tabular-nums">
                    {formatTime(r.time)} — {r.bpm} bpm
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/avaliacao/nova')}>
              Cancelar
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSubmit}>
              Salvar Avaliação
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  /* ═══════════════ SUBMITTING ═══════════════ */
  if (phase === 'submitting') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background">
        <div className="border-accent size-12 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Salvando avaliação...</p>
      </div>
    )
  }

  /* ═══════════════ DONE ═══════════════ */
  if (phase === 'done') {
    return (
      <PageLayout
        header={
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate('/avaliacoes')} />
            <div>
              <h1 className="text-primary-foreground text-xl font-bold">Avaliação Concluída</h1>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5 py-4">
          {result && (
            <>
              <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-primary/10 to-background px-6 pt-8 pb-6">
                <div className="relative flex items-center justify-center">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/40" />
                    <circle
                      cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.min((result.classificacao.valor_vo2max || 0) / 60, 1))}`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-foreground text-5xl font-black tracking-tight tabular-nums leading-none">
                      {result.classificacao.valor_vo2max}
                    </span>
                    <span className="text-muted-foreground mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                      VO₂max
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">mL/kg/min</p>
                <Badge variant="secondary" className="mt-3 rounded-full px-3 py-0.5 text-xs font-semibold">
                  {result.classificacao.nome_legivel || result.classificacao.nome}
                </Badge>
              </div>

              <div className="border-y border-border/60">
                <div className="grid grid-cols-2 divide-x divide-border/60">
                  <div className="flex flex-col items-center py-3">
                    <span className="text-foreground text-2xl font-black tabular-nums leading-none">
                      {result.classificacao.mets_calculado ?? '—'}
                    </span>
                    <span className="text-muted-foreground mt-1.5 text-[10px] font-semibold uppercase tracking-wider">
                      METs
                    </span>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <span className="text-foreground text-2xl font-black tabular-nums leading-none">
                      {result.classificacao.valor_vo2max}
                    </span>
                    <span className="text-muted-foreground mt-1.5 text-[10px] font-semibold uppercase tracking-wider">
                      VO₂max
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          <Button className="rounded-full" onClick={() => navigate('/avaliacoes')}>
            Ver Avaliações
          </Button>
        </div>
      </PageLayout>
    )
  }

  return null
}
