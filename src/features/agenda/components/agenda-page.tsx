import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus, ChevronLeft, ChevronRight,
  Plus,
} from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { cn } from '@/lib/utils'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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
          <BackButton onClick={() => navigate('/')} />
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

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-10 text-center">
          <CalendarPlus size={28} className="text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Nenhum agendamento para este dia</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5 rounded-full text-xs">
            <Plus size={14} />
            Agendar
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
