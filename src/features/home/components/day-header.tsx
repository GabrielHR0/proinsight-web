import { Settings, Bell } from 'lucide-react'
import { useAuth } from '@/stores/auth'

interface DayHeaderProps {
  onSettingsClick: () => void
}

export function DayHeader({ onSettingsClick }: DayHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex items-start justify-between">
      <div>
        <h1 className="text-primary-foreground text-xl font-semibold">
          Olá{user?.userName ? `, ${user.userName}` : ''}
        </h1>
        <p className="text-primary-foreground/80 mt-1 text-sm leading-snug">
          Próxima avaliação às 14:30
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSettingsClick}
          className="bg-muted flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted/80"
        >
          <Settings size={20} className="text-foreground" />
        </button>

        <div className="relative">
          <div className="bg-muted flex size-10 items-center justify-center rounded-full">
            <Bell size={18} className="text-foreground" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            3
          </span>
        </div>
      </div>
    </header>
  )
}
