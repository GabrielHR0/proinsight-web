import type { ComponentType } from 'react'
import { IconHeartRateMonitor, IconBolt, IconBarbell, IconWeight, IconYoga } from '@tabler/icons-react'

type IconComponent = ComponentType<{ size?: number; className?: string }>

export const CATEGORY_ICON: Record<string, IconComponent> = {
  VO2_MAX: IconHeartRateMonitor,
  IMC: IconWeight,
  BIOIMPEDANCIA: IconBolt,
  FORCA: IconBarbell,
  FLEXIBILIDADE: IconYoga,
}