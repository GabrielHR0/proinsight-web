import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ReactNode } from 'react'

const periods = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
] as const

interface PeriodTabsProps {
  children: ReactNode
}

export function PeriodTabs({ children }: PeriodTabsProps) {
  return (
    <div>
      <Tabs defaultValue="diario" className="w-full">
        <TabsList className="flex !h-auto w-full items-center justify-center gap-2 rounded-[22px] bg-muted p-[6px_8px]">
          {periods.map((p) => (
            <TabsTrigger
              key={p.value}
              value={p.value}
              className="flex h-[31px] flex-1 items-center justify-center rounded-[10px] border-0 bg-transparent px-1 py-0 text-xs font-normal text-foreground/60 capitalize shadow-none transition-all data-[state=active]:h-12 data-[state=active]:rounded-[19px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:shadow-none"
            >
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {periods.map((p) => (
          <TabsContent key={p.value} value={p.value} className="mt-5">
            {p.value === 'diario' ? children : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}