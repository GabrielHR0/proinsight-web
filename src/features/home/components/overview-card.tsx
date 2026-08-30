import { AnimatedNumber } from '@/components/ui/animated-number'

export function OverviewCard() {
  return (
    <section className="grid w-full grid-cols-2 gap-2">
      <div className="flex flex-col items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-4 shadow-sm">
        <span className="text-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Alunos ativos
        </span>
        <AnimatedNumber value={12} className="text-foreground mt-2 text-4xl leading-none font-black tracking-tight" />
      </div>

      <div className="flex flex-col items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-4 shadow-sm">
        <span className="text-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Agenda hoje
        </span>
        <AnimatedNumber value={3} className="text-link mt-2 text-4xl leading-none font-black tracking-tight" />
      </div>
    </section>
  )
}