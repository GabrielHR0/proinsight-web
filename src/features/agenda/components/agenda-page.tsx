import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CalendarPlus, ChevronLeft, ChevronRight,
  Clock, MapPin, Plus, Dot,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MESES_ABR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type Status = 'confirmado' | 'pendente' | 'concluído' | 'cancelado'
type TipoEvento = 'avaliação' | 'reavaliação' | 'retorno' | 'consulta'

interface Evento {
  id: string
  dia: number
  mes: number
  ano: number
  hora: string
  cliente: string
  tipo: TipoEvento
  status: Status
  local?: string
  observacao?: string
}

const STATUS_PROPS: Record<Status, { label: string; class: string }> = {
  confirmado: { label: 'Confirmado', class: 'bg-accent/10 text-accent border-accent/20' },
  pendente: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' },
  concluído: { label: 'Concluído', class: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
  cancelado: { label: 'Cancelado', class: 'bg-muted text-muted-foreground border-border' },
}

const TIPO_CORES: Record<TipoEvento, string> = {
  avaliação: 'bg-accent text-accent-foreground',
  reavaliação: 'bg-primary text-primary-foreground',
  retorno: 'bg-secondary text-secondary-foreground',
  consulta: 'bg-muted text-muted-foreground',
}

const EVENTOS_MOCK: Evento[] = [
  { id: '1', dia: 13, mes: 6, ano: 2026, hora: '08:00', cliente: 'João Silva', tipo: 'avaliação', status: 'confirmado', local: 'Sala 1' },
  { id: '2', dia: 13, mes: 6, ano: 2026, hora: '09:30', cliente: 'Maria Costa', tipo: 'reavaliação', status: 'confirmado', local: 'Sala 2' },
  { id: '3', dia: 13, mes: 6, ano: 2026, hora: '11:00', cliente: 'Carlos Mendes', tipo: 'avaliação', status: 'pendente' },
  { id: '4', dia: 13, mes: 6, ano: 2026, hora: '14:00', cliente: 'Ana Pereira', tipo: 'retorno', status: 'confirmado', local: 'Sala 1' },
  { id: '5', dia: 14, mes: 6, ano: 2026, hora: '07:30', cliente: 'Pedro Santos', tipo: 'avaliação', status: 'confirmado', local: 'Sala 3' },
  { id: '6', dia: 14, mes: 6, ano: 2026, hora: '10:00', cliente: 'Lucia Oliveira', tipo: 'consulta', status: 'pendente' },
  { id: '7', dia: 15, mes: 6, ano: 2026, hora: '08:00', cliente: 'Rafael Souza', tipo: 'avaliação', status: 'confirmado', local: 'Sala 1' },
  { id: '8', dia: 15, mes: 6, ano: 2026, hora: '09:00', cliente: 'Beatriz Lima', tipo: 'reavaliação', status: 'confirmado' },
  { id: '9', dia: 15, mes: 6, ano: 2026, hora: '10:30', cliente: 'Thiago Alves', tipo: 'avaliação', status: 'concluído', local: 'Sala 2' },
  { id: '10', dia: 15, mes: 6, ano: 2026, hora: '13:00', cliente: 'Fernanda Rocha', tipo: 'retorno', status: 'cancelado' },
  { id: '11', dia: 18, mes: 6, ano: 2026, hora: '08:30', cliente: 'Gabriel Torres', tipo: 'avaliação', status: 'pendente' },
  { id: '12', dia: 20, mes: 6, ano: 2026, hora: '07:00', cliente: 'Amanda Dias', tipo: 'avaliação', status: 'confirmado', local: 'Sala 1' },
]

function getCalendarGrid(ano: number, mes: number) {
  const primeiro = new Date(ano, mes, 1)
  const ultimo = new Date(ano, mes + 1, 0)
  const grid: (number | null)[] = []
  for (let i = 0; i < primeiro.getDay(); i++) grid.push(null)
  for (let d = 1; d <= ultimo.getDate(); d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function formatarData(dia: number, mes: number) {
  return `${dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}`
}

function diaSemanaExtenso(dia: number, mes: number, ano: number) {
  const nomes = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return nomes[new Date(ano, mes, dia).getDay()]
}

export function AgendaPage() {
  const navigate = useNavigate()
  const hoje = useMemo(() => new Date(), [])
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [selectedDay, setSelectedDay] = useState<number>(hoje.getDate())

  const grid = getCalendarGrid(ano, mes)

  const eventosDoDia = EVENTOS_MOCK.filter(
    (e) => e.dia === selectedDay && e.mes === mes && e.ano === ano,
  ).sort((a, b) => a.hora.localeCompare(b.hora))

  const proximosEventos = EVENTOS_MOCK
    .filter((e) => {
      const data = new Date(e.ano, e.mes, e.dia)
      return data >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) && e.status !== 'cancelado'
    })
    .sort((a, b) => {
      const da = new Date(a.ano, a.mes, a.dia)
      const db = new Date(b.ano, b.mes, b.dia)
      if (da.getTime() !== db.getTime()) return da.getTime() - db.getTime()
      return a.hora.localeCompare(b.hora)
    })
    .slice(0, 3)

  const temEvento = (dia: number) =>
    EVENTOS_MOCK.some((e) => e.dia === dia && e.mes === mes && e.ano === ano && e.status !== 'cancelado')

  const navegar = (dir: -1 | 1) => {
    const d = new Date(ano, mes + dir, 1)
    setAno(d.getFullYear())
    setMes(d.getMonth())
  }

  const irHoje = () => {
    setAno(hoje.getFullYear())
    setMes(hoje.getMonth())
    setSelectedDay(hoje.getDate())
  }

  return (
    <PageLayout
      header={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-primary-foreground text-xl font-bold">Agenda</h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">Gerencie seus agendamentos</p>
          </div>
          <Button variant="secondary" size="sm" className="rounded-full text-xs" onClick={irHoje}>
            Hoje
          </Button>
        </div>
      }
    >
      {/* Próximos eventos — resumo */}
      {proximosEventos.length > 0 && (
        <div className="mb-5">
          <h2 className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Próximos</h2>
          <div className="flex flex-col gap-2">
            {proximosEventos.map((e) => (
              <div key={e.id} className="bg-accent/[0.04] flex items-center gap-3 rounded-xl px-4 py-2.5">
                <div className="flex flex-col items-center">
                  <span className="text-accent text-lg font-bold leading-tight tabular-nums">{e.dia}</span>
                  <span className="text-muted-foreground text-[10px] font-medium uppercase leading-tight">{MESES_ABR[e.mes]}</span>
                </div>
                <Dot className="text-muted-foreground/30 shrink-0" size={8} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{e.cliente}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Clock size={11} />
                    {e.hora}
                    <span className="text-muted-foreground/50 mx-1">·</span>
                    {e.tipo}
                  </p>
                </div>
                <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', STATUS_PROPS[e.status].class)}>
                  {STATUS_PROPS[e.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendário mensal */}
      <div className="mb-5 rounded-2xl border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navegar(-1)} className="rounded-full">
            <ChevronLeft size={18} />
          </Button>
          <span className="text-foreground text-sm font-semibold">{MESES[mes]} {ano}</span>
          <Button variant="ghost" size="icon" onClick={() => navegar(1)} className="rounded-full">
            <ChevronRight size={18} />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {DIAS_SEMANA_CURTO.map((d) => (
            <div key={d} className="text-muted-foreground py-1 text-center text-[10px] font-medium uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((dia, i) => {
            if (dia === null) return <div key={i} />
            const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()
            const isSelected = dia === selectedDay
            const hasEvent = temEvento(dia)

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(dia)}
                className={cn(
                  'relative mx-auto flex size-8 items-center justify-center rounded-full text-xs transition-all',
                  isSelected && 'bg-accent text-accent-foreground font-bold shadow-sm',
                  !isSelected && isHoje && 'border-accent border-2 font-bold text-accent',
                  !isSelected && !isHoje && 'text-foreground hover:bg-muted',
                )}
              >
                {dia}
                {hasEvent && !isSelected && (
                  <span className="bg-accent absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Linha do tempo do dia selecionado */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              {diaSemanaExtenso(selectedDay, mes, ano)}
            </h2>
            <p className="text-muted-foreground text-xs">{formatarData(selectedDay, mes)}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs">
            <Plus size={14} />
            Novo
          </Button>
        </div>

        {eventosDoDia.length > 0 ? (
          <div className="relative pl-5">
            {/* Linha vertical da timeline */}
            <div className="bg-border absolute left-[9px] top-2 bottom-2 w-px" />

            <div className="flex flex-col gap-4">
              {eventosDoDia.map((evento) => (
                <div key={evento.id} className="relative">
                  {/* Bolinha da timeline */}
                  <div className={cn(
                    'absolute -left-[17px] top-1.5 size-[18px] rounded-full border-2 flex items-center justify-center',
                    evento.status === 'cancelado' ? 'border-muted-foreground/30 bg-background' : 'border-accent bg-accent',
                  )}>
                    <div className={cn(
                      'size-[6px] rounded-full',
                      evento.status === 'cancelado' ? 'bg-muted-foreground/30' : 'bg-background',
                    )} />
                  </div>

                  <div className={cn(
                    'rounded-xl border p-4 transition-all',
                    evento.status === 'cancelado' ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-background hover:border-accent/30',
                  )}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          TIPO_CORES[evento.tipo],
                        )}>
                          {evento.tipo}
                        </span>
                        <span className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          STATUS_PROPS[evento.status].class,
                        )}>
                          {STATUS_PROPS[evento.status].label}
                        </span>
                      </div>
                    </div>

                    <p className="text-foreground text-sm font-medium">{evento.cliente}</p>

                    <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {evento.hora}
                      </span>
                      {evento.local && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {evento.local}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 text-center">
            <CalendarPlus size={28} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Nenhum agendamento para este dia</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5 rounded-full text-xs">
              <Plus size={14} />
              Agendar
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
