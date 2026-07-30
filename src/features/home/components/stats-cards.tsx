import { Users, CalendarCheck, ClipboardList } from 'lucide-react'

const stats = [
  { icon: Users, value: '48', label: 'Alunos ativos' },
  { icon: CalendarCheck, value: '4', label: 'Avaliações hoje' },
  { icon: ClipboardList, value: '2', label: 'Pendentes' },
]

export function StatsCards() {
  return (
    <section className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted px-3 py-4"
        >
          <Icon size={18} className="text-link" />
          <span className="text-foreground text-xl font-bold leading-none">{value}</span>
          <span className="text-muted-foreground text-[10px] text-center leading-tight">
            {label}
          </span>
        </div>
      ))}
    </section>
  )
}