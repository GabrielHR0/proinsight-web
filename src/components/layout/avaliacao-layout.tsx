import type { ReactNode } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Stepper, type Step } from '@/components/ui/stepper'

interface AvaliacaoLayoutProps {
  title: string
  steps: Step[]
  currentStep: number
  children: ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
}

export function AvaliacaoLayout({
  title,
  steps,
  currentStep,
  children,
  onNext,
  onBack,
  nextLabel = 'Próximo',
  nextDisabled = false,
  loading = false,
}: AvaliacaoLayoutProps) {
  const navigate = useNavigate()
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex items-center gap-3 px-6 pt-12 pb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => (isFirst ? navigate(-1) : onBack?.())}
          className="rounded-full"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-foreground text-xl font-bold">{title}</h1>
      </div>

      <div className="px-6 pb-4">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {children}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur-lg px-6 py-4 pb-8 md:hidden">
        <div className="flex gap-3">
          {!isFirst && (
            <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>
              <ChevronLeft size={16} className="mr-1" />
              Voltar
            </Button>
          )}
          <Button
            className="flex-1 rounded-full"
            onClick={onNext}
            disabled={nextDisabled || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </span>
            ) : isLast ? (
              'Finalizar'
            ) : (
              <>
                {nextLabel}
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
