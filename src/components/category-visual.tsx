import type { ReactNode } from 'react'
import { CATEGORY_ICON } from '@/components/category-icons'
import { cn } from '@/lib/utils'

interface CategoryConfig {
  icon: ReactNode
  label: string
  text: string
  border: string
  dot: string
}

const registry: Record<string, CategoryConfig> = {
  VO2_MAX: {
    icon: <CATEGORY_ICON.VO2_MAX size={14} />,
    label: 'VO₂ Máx',
    text: 'text-accent',
    border: 'border-accent/20',
    dot: 'bg-accent',
  },
  IMC: {
    icon: <CATEGORY_ICON.IMC size={14} />,
    label: 'IMC',
    text: 'text-primary',
    border: 'border-primary/20',
    dot: 'bg-primary',
  },
  BIOIMPEDANCIA: {
    icon: <CATEGORY_ICON.BIOIMPEDANCIA size={14} />,
    label: 'Bioimpedância',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  FORCA: {
    icon: <CATEGORY_ICON.FORCA size={14} />,
    label: 'Força',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  FLEXIBILIDADE: {
    icon: <CATEGORY_ICON.FLEXIBILIDADE size={14} />,
    label: 'Flexibilidade',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
}

const defaults: CategoryConfig = {
  icon: null as unknown as ReactNode,
  label: 'Outro',
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
      <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wider', config.text, config.border, className)}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide', config.text, config.border, className)}>
      {config.icon}
      {config.label}
    </span>
  )
}
