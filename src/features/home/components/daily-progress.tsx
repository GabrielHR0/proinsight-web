import { useEffect, useState } from 'react'

export function DailyProgress() {
  const completed = 5
  const total = 8
  const pending = total - completed
  const pct = (completed / total) * 100

  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const circumference = 2 * Math.PI * 20
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="flex w-full flex-row items-center gap-4 rounded-2xl bg-muted px-5 py-3">
      <div className="relative flex size-12 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary-foreground/20" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            className="text-link"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <span className="text-foreground text-sm font-bold">{completed}/{total}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-foreground text-sm font-medium">Avaliações hoje</span>
        <span className="text-link text-xs font-semibold">{pending} pendentes</span>
      </div>
    </div>
  )
}