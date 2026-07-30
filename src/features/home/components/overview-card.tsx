import { UserCheck, CalendarDays } from 'lucide-react'

export function OverviewCard() {
  return (
    <section className="flex w-full gap-2">
      <div className="flex flex-1 flex-col items-center rounded-2xl bg-muted px-3 py-2.5">
        <div className="flex items-center gap-1">
          <UserCheck size={13} className="text-muted-foreground" />
          <span className="text-foreground text-sm font-bold leading-tight">Alunos</span>
        </div>
        <span className="text-muted-foreground text-[11px] leading-tight">ativos</span>
        <span className="text-foreground text-2xl font-bold leading-none mt-1">12</span>
      </div>

      <div className="flex flex-1 flex-col items-center rounded-2xl bg-muted px-3 py-2.5">
        <div className="flex items-center gap-1">
          <CalendarDays size={13} style={{ color: 'var(--color-link)' }} />
          <span className="text-sm font-bold leading-tight" style={{ color: 'var(--color-link)' }}>Agenda</span>
        </div>
        <span className="text-muted-foreground text-[11px] leading-tight">hoje</span>
        <span className="text-2xl font-bold leading-none mt-1" style={{ color: 'var(--color-link)' }}>3</span>
      </div>
    </section>
  )
}
