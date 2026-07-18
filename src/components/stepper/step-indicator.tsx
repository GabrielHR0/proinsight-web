import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  subtitle?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentIndex: number
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const isActive = i === currentIndex
        const isCompleted = i < currentIndex
        const isPending = i > currentIndex

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={cn(
                    'h-px flex-1 transition-colors',
                    i <= currentIndex ? 'bg-accent' : 'bg-accent/20',
                  )}
                />
              )}

              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
                  isActive && 'bg-accent text-accent-foreground shadow-sm shadow-accent/30 scale-110',
                  isCompleted && 'bg-accent text-accent-foreground',
                  isPending && 'bg-accent/20 text-accent-foreground/50',
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1 transition-colors',
                    i < currentIndex ? 'bg-accent' : 'bg-accent/20',
                  )}
                />
              )}
            </div>

            <span
              className={cn(
                'mt-2 text-center text-xs font-semibold transition-colors max-w-[80px] leading-tight',
                isActive && 'text-accent-foreground',
                isCompleted && 'text-accent-foreground',
                isPending && 'text-accent-foreground/50',
              )}
            >
              {step.title}
            </span>

            {step.subtitle && isActive && (
              <span className="text-accent-foreground/60 mt-0.5 text-[10px] leading-tight">
                {step.subtitle}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
