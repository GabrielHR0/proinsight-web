import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none text-center',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1 rounded-full transition-colors',
                  i < currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
