import type { ReactNode } from 'react'
import { Heart, Weight, Zap, Dumbbell, Fence } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryConfig {
  icon: ReactNode
  label: string
  bg: string
  text: string
  border: string
  dot: string
}

const registry: Record<string, CategoryConfig> = {
  VO2_MAX: {
    icon: <Heart size={14} />,
    label: 'VO₂ Máx',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/20',
    dot: 'bg-accent',
  },
  IMC: {
    icon: <Weight size={14} />,
    label: 'IMC',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    dot: 'bg-primary',
  },
  BIOIMPEDANCIA: {
    icon: <Zap size={14} />,
    label: 'Bioimpedância',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  FORCA: {
    icon: <Dumbbell size={14} />,
    label: 'Força',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  FLEXIBILIDADE: {
    icon: <Fence size={14} />,
    label: 'Flexibilidade',
    bg: 'bg-teal-100 dark:bg-teal-900/20',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
}

const defaults: CategoryConfig = {
  icon: null as unknown as ReactNode,
  label: 'Outro',
  bg: 'bg-muted',
  text: 'text-muted-foreground',
  border: 'border-border',
  dot: 'bg-muted-foreground',
}

interface CategoryVisualProps {
  categoria: string
  /** Badge compacto para cards */
  compact?: boolean
  /** Apenas o bullet colorido */
  dot?: boolean
  className?: string
}

export function CategoryVisual({ categoria, compact, dot: dotOnly, className }: CategoryVisualProps) {
  const config = registry[categoria] || defaults

  if (dotOnly) {
    return <span className={cn('inline-block size-2 rounded-full', config.dot)} />
  }

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wider', config.bg, config.text, config.border, className)}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide', config.bg, config.text, config.border, className)}>
      {config.icon}
      {config.label}
    </span>
  )
}
