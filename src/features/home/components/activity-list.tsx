import { Dumbbell, Heart, TrendingUp } from 'lucide-react'

const activities = [
  {
    icon: Dumbbell,
    bgColor: 'bg-secondary',
    label: 'Avaliação Cooper',
    value: '+2,400m',
    meta: '12 min',
    time: '18:27 - 30 Abr',
  },
  {
    icon: Heart,
    bgColor: 'bg-accent',
    label: 'Teste Rockport',
    value: '42.5',
    meta: 'VO₂ máx',
    time: '17:00 - 24 Abr',
  },
  {
    icon: TrendingUp,
    bgColor: 'bg-link',
    label: 'Evolução VO₂',
    value: '+5.2%',
    meta: '3 meses',
    time: '8:30 - 15 Abr',
  },
]

export function ActivityList() {
  return (
    <section className="flex flex-col gap-6">
      {activities.map((item) => (
        <div key={item.label} className="flex items-start gap-4">
          <div
            className={`${item.bgColor} flex size-14 shrink-0 items-center justify-center rounded-3xl`}
          >
            <item.icon size={22} className="text-background" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-base font-medium capitalize">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-link dark:text-primary-foreground text-base font-medium">
                  {item.value}
                </span>
                <div className="h-0 w-[9px] rotate-90 border-t border-primary" />
                <span className="text-foreground text-xs font-light leading-4">
                  {item.meta}
                </span>
              </div>
            </div>
            <span className="text-link dark:text-primary-foreground mt-0.5 text-xs font-semibold capitalize">
              {item.time}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
