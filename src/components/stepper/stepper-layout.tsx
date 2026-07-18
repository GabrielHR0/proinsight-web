import type { ReactNode } from 'react'
import { ArrowLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepIndicator, type Step } from './step-indicator'

interface StepperLayoutProps {
  title: string
  subtitle?: string
  steps: Step[]
  currentStep: number
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  backLabel?: string
  canNext?: boolean
  isLoading?: boolean
  loadingMessage?: string
  hideNavigation?: boolean
  children: ReactNode
}

export function StepperLayout({
  title,
  subtitle,
  steps,
  currentStep,
  onBack,
  onNext,
  nextLabel = 'Próximo',
  backLabel = 'Voltar',
  canNext = true,
  isLoading = false,
  loadingMessage = 'Salvando...',
  hideNavigation = false,
  children,
}: StepperLayoutProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex flex-col bg-primary px-6 pt-12 pb-28">
        <div className="mb-6 flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <div>
            <h1 className="text-primary-foreground text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-primary-foreground/80 mt-0.5 text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        <StepIndicator steps={steps} currentIndex={currentStep} />
      </div>

      <div className="bg-background -mt-16 z-10 flex flex-1 flex-col rounded-t-[56px] px-6 pt-8 pb-8">
        {children}

        {!hideNavigation && onNext && (
          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            {onBack && !isFirstStep ? (
              <Button
                variant="outline"
                onClick={onBack}
                className="rounded-full px-6"
              >
                <ArrowLeft size={16} className="mr-1.5" />
                {backLabel}
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={onNext}
              disabled={!canNext || isLoading}
              className="rounded-full px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                  {loadingMessage}
                </>
              ) : isLastStep ? (
                <>
                  <Check size={16} className="mr-1.5" />
                  Finalizar
                </>
              ) : (
                <>
                  {nextLabel}
                  <ChevronRight size={16} className="ml-1.5" />
                </>
              )}
            </Button>
          </div>
        )}

        <div className="h-32 shrink-0 md:hidden" />
      </div>
    </div>
  )
}
