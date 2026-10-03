import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Stepper } from '@/components/ui/stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  avaliacaoService,
  type DadosPreAvaliacao,
  type AvaliacaoFuncionalResponse,
} from '@/services/avaliacao-service'
import { protocoloService } from '@/services/protocolo-service'
import { useAuth } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { playBeep } from '@/lib/sound'
import { parseFuncionalError } from '@/features/avaliacao/funcional-utils'
import { GUIA_TESTS, TESTES_COM_CONTADOR } from '@/features/avaliacao/funcional-guide'
import {
  clearDraft,
  draftCompativel,
  formatarQuando,
  loadDraft,
  saveDraft,
  type FuncionalDraft,
} from '@/features/avaliacao/funcional-draft'
import type { ProtocoloDetalhe, TesteFuncionalDto } from '@/types/protocolo'

const STEPS = [
  { label: 'Dados' },
  { label: 'Bateria' },
  { label: 'Resultado' },
]

const MUTE_KEY = 'proinsight:funcional-mute'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatValor(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1)
}

interface TimerEstado {
  chave: string
  decorrido: number
  rodando: boolean
  preparando: boolean
  contagem: number
}

interface FuncionalIdosoWizardProps {
  clienteId: string
  clienteNome: string
  protocoloId: string
  onDone: () => void
  onNewEvaluation: () => void
}

export function FuncionalIdosoWizard({
  clienteId,
  clienteNome,
  protocoloId,
  onDone,
  onNewEvaluation,
}: FuncionalIdosoWizardProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)

  const [dados, setDados] = useState({
    sexo: '' as 'MASCULINO' | 'FEMININO' | '',
    idade: '',
  })

  const { data: preDados, isLoading: loadingPreDados } = useQuery<DadosPreAvaliacao>({
    queryKey: ['dados-pre-avaliacao', protocoloId, clienteId],
    queryFn: () => avaliacaoService.buscarDadosPreAvaliacao(protocoloId, clienteId),
  })

  const { data: protocoloDetalhe, isLoading: loadingProtocolo } = useQuery<ProtocoloDetalhe>({
    queryKey: ['protocolo-detalhe', protocoloId],
    queryFn: () => protocoloService.getDetalhe(protocoloId),
  })

  const testes = useMemo(() => protocoloDetalhe?.testes ?? [], [protocoloDetalhe])
  const ordemChaves = useMemo(() => testes.map((t) => t.teste), [testes])

  useEffect(() => {
    if (preDados) {
      setDados({
        sexo: preDados.sexo ?? '',
        idade: preDados.idade != null ? String(preDados.idade) : '',
      })
    }
  }, [preDados])

  const [valores, setValores] = useState<Record<string, string>>({})
  const [errosPorTeste, setErrosPorTeste] = useState<Record<string, string[]>>({})
  const [errosGlobais, setErrosGlobais] = useState<string[]>([])
  const [resumoErro, setResumoErro] = useState<string | null>(null)
  const [timer, setTimer] = useState<TimerEstado | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [serverResult, setServerResult] = useState<AvaliacaoFuncionalResponse | null>(null)
  const [mudo, setMudo] = useState(() => {
    try {
      return window.localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [telaCheia, setTelaCheia] = useState(false)
  const [rascunho, setRascunho] = useState<FuncionalDraft | null>(() => {
    const salvo = loadDraft()
    if (!salvo) return null
    if (!draftCompativel(salvo, clienteId, protocoloId)) {
      clearDraft()
      return null
    }
    return salvo
  })
  const timerAnterior = useRef<TimerEstado | null>(null)

  const alternarMudo = () => {
    setMudo((atual) => {
      const proximo = !atual
      try {
        window.localStorage.setItem(MUTE_KEY, proximo ? '1' : '0')
      } catch {
        return atual
      }
      return proximo
    })
  }

  useEffect(() => {
    if (!timer) return
    if (!timer.rodando && !timer.preparando) return
    const id = setInterval(() => {
      setTimer((t) => {
        if (!t) return t
        if (t.preparando) {
          if (t.contagem > 1) return { ...t, contagem: t.contagem - 1 }
          return { ...t, preparando: false, rodando: true, decorrido: 0 }
        }
        return t.rodando ? { ...t, decorrido: t.decorrido + 1 } : t
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timer?.chave, timer?.rodando, timer?.preparando])

  useEffect(() => {
    if (!timer?.rodando) return
    const def = testes.find((t) => t.teste === timer.chave)
    if (def?.timer === 'REGRESSIVA' && def.segundos != null && timer.decorrido >= def.segundos) {
      setTimer({
        chave: timer.chave,
        decorrido: def.segundos,
        rodando: false,
        preparando: false,
        contagem: 0,
      })
      if (!mudo) playBeep(440, 320)
    }
  }, [timer, testes, mudo])

  useEffect(() => {
    if (timer?.preparando && !mudo) playBeep(880, 90)
  }, [timer?.preparando, timer?.contagem, mudo])

  useEffect(() => {
    const antes = timerAnterior.current
    if (antes?.preparando && timer && !timer.preparando && timer.rodando && !mudo) {
      playBeep(1320, 180)
    }
    timerAnterior.current = timer
  }, [timer, mudo])

  useEffect(() => {
    if (step !== 1) {
      setTimer((t) => (t?.rodando || t?.preparando ? { ...t, rodando: false, preparando: false } : t))
    }
  }, [step])

  useEffect(() => {
    const onChange = () => setTelaCheia(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => undefined)
    }
  }

  useEffect(() => {
    if (step !== 1) return
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }
    if (!nav.wakeLock) return
    let ativo = true
    let sentinela: { release: () => Promise<void> } | null = null
    const solicitar = () => {
      nav
        .wakeLock!.request('screen')
        .then((s) => {
          if (ativo) sentinela = s
          else void s.release().catch(() => undefined)
        })
        .catch(() => undefined)
    }
    solicitar()
    const onVisibilidade = () => {
      if (document.visibilityState === 'visible') solicitar()
    }
    document.addEventListener('visibilitychange', onVisibilidade)
    return () => {
      ativo = false
      document.removeEventListener('visibilitychange', onVisibilidade)
      void sentinela?.release().catch(() => undefined)
    }
  }, [step])

  useEffect(() => {
    if (step > 1) return
    const relevante = step === 1 || Object.keys(valores).length > 0
    if (!relevante) return
    saveDraft({ clienteId, protocoloId, step, dados, valores, observacoes })
  }, [step, dados, valores, observacoes, clienteId, protocoloId])

  useEffect(() => {
    if (step !== 1) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [step])

  const preenchidos = ordemChaves.filter(
    (c) => valores[c] !== undefined && valores[c].trim() !== '' && Number.isFinite(Number(valores[c])),
  ).length

  const idadeValida = Number(dados.idade) > 0
  const dadosOk = dados.sexo !== '' && idadeValida

  const handleNext = () => {
    if (step === 0) {
      if (!dadosOk) return
      setErrosGlobais([])
      setStep(1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const alternarTimer = (teste: TesteFuncionalDto) => {
    setTimer((prev) => {
      if (prev?.chave === teste.teste) {
        if (prev.preparando) return { ...prev, preparando: false, rodando: false }
        if (prev.rodando) return { ...prev, rodando: false }
        const terminou =
          teste.timer === 'REGRESSIVA' &&
          teste.segundos != null &&
          prev.decorrido >= teste.segundos
        if (terminou || prev.decorrido === 0) {
          return { chave: teste.teste, decorrido: 0, rodando: false, preparando: true, contagem: 3 }
        }
        return { ...prev, rodando: true }
      }
      return { chave: teste.teste, decorrido: 0, rodando: false, preparando: true, contagem: 3 }
    })
  }

  const rotuloTimer = (teste: TesteFuncionalDto): string => {
    const estado = timer?.chave === teste.teste ? timer : null
    if (estado?.preparando) return 'Cancelar'
    if (estado?.rodando) return 'Parar'
    if (teste.timer === 'REGRESSIVA' && teste.segundos != null && estado && estado.decorrido >= teste.segundos) {
      return 'Reiniciar'
    }
    if (estado && estado.decorrido > 0) return 'Continuar'
    return 'Iniciar'
  }

  const alterarContador = (chave: string, delta: number) => {
    setValores((p) => {
      const atual = Number(p[chave] ?? 0)
      const base = Number.isFinite(atual) ? Math.round(atual) : 0
      return { ...p, [chave]: String(Math.max(base + delta, 0)) }
    })
    setErrosPorTeste((p) => {
      if (!p[chave]) return p
      const { [chave]: _, ...resto } = p
      return resto
    })
  }

  const retomarRascunho = () => {
    if (!rascunho) return
    setDados(rascunho.dados)
    setValores(rascunho.valores)
    setObservacoes(rascunho.observacoes)
    setErrosPorTeste({})
    setErrosGlobais([])
    setResumoErro(null)
    setStep(rascunho.step)
    setRascunho(null)
  }

  const descartarRascunho = () => {
    clearDraft()
    setRascunho(null)
  }

  const handleSubmit = async () => {
    const faltantes = ordemChaves.filter(
      (c) => valores[c] === undefined || valores[c].trim() === '' || !Number.isFinite(Number(valores[c])),
    )
    if (faltantes.length > 0) {
      setErrosPorTeste(
        Object.fromEntries(faltantes.map((c) => [c, ['Informe o valor do teste']])),
      )
      setResumoErro(null)
      return
    }

    setSubmitting(true)
    setErrosPorTeste({})
    setResumoErro(null)

    try {
      const response = await avaliacaoService.submitFuncional({
        cliente_id: clienteId,
        protocolo_id: protocoloId,
        avaliador_id: user!.id,
        observacoes: observacoes.trim() || undefined,
        testes: ordemChaves.map((c) => ({ teste: c, valor: Number(valores[c]) })),
      })
      setServerResult(response)
      clearDraft()
      setStep(2)
    } catch (error) {
      const parsed = parseFuncionalError(error, ordemChaves)

      if (parsed.voltarAoDados) {
        setErrosGlobais(
          parsed.global.length > 0 ? parsed.global : ['Verifique os dados do aluno (idade e sexo).'],
        )
        setStep(0)
      } else if (Object.keys(parsed.porTeste).length > 0 || parsed.resumo || parsed.global.length > 0) {
        setErrosPorTeste(parsed.porTeste)
        setResumoErro(parsed.resumo ?? (parsed.global.length > 0 ? parsed.global.join(' · ') : null))
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isFirst = step === 0
  const loading = loadingPreDados || loadingProtocolo

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <Loader2 size={24} className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Carregando dados...</p>
      </div>
    )
  }

  if (!testes.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Protocolo sem testes configurados.</p>
      </div>
    )
  }

  const percentis = (serverResult?.resultados ?? [])
    .map((r) => r.percentil)
    .filter((p): p is number => typeof p === 'number')
  const mediaPercentil = percentis.length > 0 ? Math.round(percentis.reduce((a, b) => a + b, 0) / percentis.length) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-6 pb-6">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="flex-1 px-6 pb-48 md:pb-32">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            {rascunho && (
              <div className="bg-card shadow-sm rounded-2xl border border-border/70 p-4">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Rascunho encontrado
                </p>
                <p className="text-foreground mt-1 text-sm">
                  Avaliação em andamento, salva {formatarQuando(rascunho.savedAt)}.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="rounded-xl" onClick={retomarRascunho}>
                    Retomar
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={descartarRascunho}>
                    Descartar
                  </Button>
                </div>
              </div>
            )}

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

            {errosGlobais.length > 0 && (
              <div className="flex flex-col gap-1">
                {errosGlobais.map((mensagem) => (
                  <p key={mensagem} className="text-destructive text-xs font-medium">
                    {mensagem}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Sexo</Label>
              <RadioGroup value={dados.sexo} disabled className="flex gap-3">
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
              {!preDados?.sexo && (
                <p className="text-destructive text-xs">Sexo não informado no cadastro do aluno.</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Idade</Label>
              {idadeValida ? (
                <p className="text-foreground text-base font-semibold">
                  {dados.idade}{' '}
                  <span className="text-muted-foreground text-xs font-medium">anos</span>
                </p>
              ) : (
                <p className="text-destructive text-xs font-medium">
                  Idade inválida ou ausente — corrija a data de nascimento na ficha do aluno.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-foreground text-base font-black tracking-tight">Bateria de testes</h2>
                <p className="text-muted-foreground truncate text-xs">{protocoloDetalhe?.nome}</p>
              </div>
              <div className="flex shrink-0 items-baseline gap-1">
                <span className="text-foreground text-2xl font-black leading-none tabular-nums">
                  {preenchidos}
                </span>
                <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em]">
                  /{testes.length} preenchidos
                </span>
              </div>
            </div>

            {resumoErro && <p className="text-destructive text-xs font-medium">{resumoErro}</p>}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {protocoloDetalhe?.equipamentoNecessario && (
                <p className="text-muted-foreground min-w-0 flex-1 text-[11px] leading-relaxed">
                  <span className="text-foreground font-semibold">Equipamento:</span>{' '}
                  {protocoloDetalhe.equipamentoNecessario}
                </p>
              )}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={alternarMudo}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
                >
                  {mudo ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {mudo ? 'Som desligado' : 'Som ligado'}
                </button>
                <button
                  type="button"
                  onClick={alternarTelaCheia}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
                >
                  {telaCheia ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
                </button>
              </div>
            </div>

            <div className="divide-y divide-border/50 border-y border-border/60">
              {testes.map((teste, i) => {
                const chave = teste.teste
                const temTimer = teste.timer !== 'NENHUM'
                const estado = timer?.chave === chave ? timer : null
                const rodando = estado?.rodando ?? false
                const decorrido = estado?.decorrido ?? 0
                const restante =
                  teste.timer === 'REGRESSIVA' && teste.segundos != null
                    ? Math.max(teste.segundos - decorrido, 0)
                    : decorrido
                const progresso =
                  teste.timer === 'REGRESSIVA' && teste.segundos != null
                    ? Math.min((decorrido / teste.segundos) * 100, 100)
                    : 0
                const erros = errosPorTeste[chave]
                const guia = GUIA_TESTS[chave]
                const comContador = TESTES_COM_CONTADOR.has(chave)
                const input = (
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder={comContador ? '0' : 'Valor'}
                    value={valores[chave] ?? ''}
                    onChange={(e) => {
                      setValores((p) => ({ ...p, [chave]: e.target.value }))
                      setErrosPorTeste((p) => {
                        if (!p[chave]) return p
                        const { [chave]: _, ...resto } = p
                        return resto
                      })
                    }}
                    disabled={submitting}
                    className={cn(
                      'h-11 text-base font-semibold tabular-nums',
                      comContador && 'text-center',
                      erros?.length && 'border-destructive',
                    )}
                  />
                )

                return (
                  <div key={chave} className="flex flex-col gap-3 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground/70 text-[11px] font-black tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <p className="text-foreground truncate text-sm font-semibold">{teste.nome}</p>
                        </div>
                        {teste.unidade && (
                          <p className="text-muted-foreground mt-0.5 text-[11px]">{teste.unidade}</p>
                        )}
                      </div>

                      {temTimer && (
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <div className="flex items-center gap-2">
                            <Timer size={14} className="text-muted-foreground" />
                            {estado?.preparando ? (
                              <span className="text-primary text-3xl font-black leading-none tabular-nums tracking-tight">
                                {estado.contagem}
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'text-2xl font-black leading-none tabular-nums tracking-tight',
                                  rodando ? 'text-primary' : 'text-foreground',
                                )}
                              >
                                {formatTime(restante)}
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-xl px-3 text-xs"
                              onClick={() => alternarTimer(teste)}
                              disabled={submitting}
                            >
                              {rotuloTimer(teste)}
                            </Button>
                          </div>
                          {estado?.preparando ? (
                            <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.12em]">
                              prepare-se
                            </span>
                          ) : (
                            <>
                              {teste.timer === 'REGRESSIVA' && (
                                <Progress value={progresso} className="h-1 w-36 [&>div]:bg-primary" />
                              )}
                              {teste.timer === 'CONTAGEM' && rodando && (
                                <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.12em]">
                                  contando
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {guia && (
                      <Collapsible>
                        <CollapsibleTrigger className="group text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors">
                          <ChevronDown
                            size={12}
                            className="transition-transform group-data-[state=open]:rotate-180"
                          />
                          Como executar
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <ol className="flex flex-col gap-1">
                            {guia.passos.map((passo, idx) => (
                              <li
                                key={passo}
                                className="text-muted-foreground flex gap-2 text-xs leading-relaxed"
                              >
                                <span className="text-foreground/60 font-black tabular-nums">
                                  {idx + 1}.
                                </span>
                                {passo}
                              </li>
                            ))}
                          </ol>
                          {guia.atencao && (
                            <p className="text-foreground mt-2 text-xs leading-relaxed">
                              <span className="font-bold">Atenção:</span> {guia.atencao}
                            </p>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {comContador ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-11 shrink-0 rounded-xl"
                            onClick={() => alterarContador(chave, -1)}
                            disabled={submitting}
                            aria-label="Diminuir"
                          >
                            <Minus size={16} />
                          </Button>
                          {input}
                          <Button
                            type="button"
                            className="h-11 w-11 shrink-0 rounded-xl"
                            onClick={() => alterarContador(chave, 1)}
                            disabled={submitting}
                            aria-label="Aumentar"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      ) : (
                        input
                      )}
                      {erros?.length ? (
                        <div className="flex flex-col gap-0.5">
                          {erros.map((mensagem) => (
                            <p key={mensagem} className="text-destructive text-xs">
                              {mensagem}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Observações</Label>
              <Textarea
                placeholder="Observações da avaliação (opcional)..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                disabled={submitting}
                className="min-h-24"
              />
            </div>
          </div>
        )}

        {step === 2 && serverResult && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center py-6">
              <NumberTicker
                value={mediaPercentil ?? 0}
                className="text-foreground text-5xl font-black leading-none tracking-tight tabular-nums"
              />
              <span className="text-muted-foreground mt-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Percentil médio
              </span>
              <p className="text-muted-foreground mt-3 text-xs">
                {serverResult.resultados.length} testes avaliados
              </p>
            </div>

            <div className="border-border/60 border-y">
              <div className="divide-border/50 divide-y">
                {serverResult.resultados.map((r) => (
                  <div key={r.teste} className="flex items-center justify-between gap-3 px-1 py-3">
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-semibold">{r.teste_nome}</p>
                      <p className="text-muted-foreground truncate text-[11px]">
                        {r.classificacao_legivel ?? r.classificacao}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2">
                      <span className="text-foreground text-base font-bold tabular-nums">
                        {formatValor(r.valor)}
                      </span>
                      {r.unidade && (
                        <span className="text-muted-foreground text-[11px]">{r.unidade}</span>
                      )}
                      {typeof r.percentil === 'number' && (
                        <span className="text-primary text-[11px] font-black tabular-nums">
                          P{r.percentil}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-border bg-background/80 fixed inset-x-0 z-[55] border-t px-6 py-4 pb-8 backdrop-blur-lg bottom-[72px] md:bottom-0 md:pb-6">
        <div className="flex gap-3">
          {!isFirst && !submitting && !(step === 2 && serverResult) && (
            <Button variant="outline" className="flex-1 rounded-full" onClick={handleBack}>
              <ChevronLeft size={16} className="mr-1" />
              Voltar
            </Button>
          )}

          {step === 0 && (
            <Button className="flex-1 rounded-full" onClick={handleNext} disabled={!dadosOk}>
              Próximo
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}

          {step === 1 && (
            <Button className="flex-1 rounded-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar resultados
                  <ChevronRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          )}

          {step === 2 && !submitting && (
            <>
              <Button variant="outline" className="flex-1 rounded-full" onClick={onNewEvaluation}>
                Nova avaliação
              </Button>
              <Button className="flex-1 rounded-full" onClick={onDone}>
                <Check size={16} className="mr-1" />
                Concluir
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
