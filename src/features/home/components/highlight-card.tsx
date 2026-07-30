import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function HighlightCard() {
  return (
    <div className="flex w-full items-center justify-between rounded-[31px] bg-primary px-6 py-5 dark:bg-[#0e3e3e]">
      <div className="flex flex-col gap-0.5">
        <span className="text-primary-foreground text-lg font-semibold leading-none">
          7 avaliações
        </span>
        <span className="text-primary-foreground/70 text-sm leading-none">
          essa semana
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-primary-foreground text-[11px] font-semibold">HOJE</span>
        <div className="flex -space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary-foreground text-xs font-semibold text-background transition-transform hover:scale-110 dark:bg-[#0e3e3e] dark:text-[#f1fff3]">
                3
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              3 agendamentos hoje
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-accent transition-transform hover:scale-110">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 43 43"
                  fill="none"
                  className="text-background"
                >
                  <path
                    d="M2 20.2H41M21.0667 41V2"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Criar novo agendamento
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
