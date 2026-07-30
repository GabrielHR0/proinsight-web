import { useNavigate } from 'react-router-dom'
import { UserPlus, Users, ClipboardPlus, CalendarPlus } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface QuickAction {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  to: string
  state?: Record<string, unknown>
}

const actions: QuickAction[] = [
  { icon: Users, label: 'Alunos', to: '/clientes' },
  { icon: UserPlus, label: 'Novo Aluno', to: '/clientes', state: { openCadastro: true } },
  { icon: ClipboardPlus, label: 'Nova Avaliação', to: '/avaliacao/nova' },
  { icon: CalendarPlus, label: 'Agendar', to: '/agenda' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="mt-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-4 px-1">
        {actions.map(({ icon: Icon, label, to, state }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                className="bg-muted flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted/80 active:scale-95"
                onClick={() => navigate(to, { state })}
              >
                <Icon size={24} className="text-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
