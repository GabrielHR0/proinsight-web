import { useState, useCallback, useMemo } from 'react'

export function useStepper<TData extends Record<string, unknown>>(steps: { id: string }[], initialData: TData) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<TData>(initialData)
  const [canNext, setCanNext] = useState(false)

  const currentStepId = steps[currentStep]?.id ?? ''

  const goToNext = useCallback(() => {
    setCurrentStep((i) => Math.min(i + 1, steps.length - 1))
    setCanNext(false)
  }, [steps.length])

  const goToBack = useCallback(() => {
    setCurrentStep((i) => Math.max(i - 1, 0))
    setCanNext(false)
  }, [])

  const goToStep = useCallback((index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, steps.length - 1)))
    setCanNext(false)
  }, [steps.length])

  const updateData = useCallback((partial: Partial<TData>) => {
    setFormData((prev) => ({ ...prev, ...partial }))
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setFormData(initialData)
    setCanNext(false)
  }, [initialData])

  return useMemo(
    () => ({
      currentStep,
      currentStepId,
      formData,
      canNext,
      setCanNext,
      goToNext,
      goToBack,
      goToStep,
      updateData,
      reset,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === steps.length - 1,
      totalSteps: steps.length,
    }),
    [currentStep, currentStepId, formData, canNext, setCanNext, goToNext, goToBack, goToStep, updateData, reset, steps.length],
  )
}
