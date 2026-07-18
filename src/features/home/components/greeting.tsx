import { Settings, Bell } from 'lucide-react'

interface GreetingProps {
  onSettingsClick: () => void
}

export function Greeting({ onSettingsClick }: GreetingProps) {
  return (
    <header className="flex items-start justify-between">
      <div>
        <h1 className="text-primary-foreground text-xl font-semibold">Olá, Gabriel</h1>
        <p className="text-primary-foreground/80 mt-0.5 text-sm">Bem-vindo de volta</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSettingsClick}
          className="bg-[#F1FFF3] flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#F1FFF3]/80"
        >
          <Settings size={20} className="text-foreground" />
        </button>

        <div className="bg-[#F1FFF3] flex size-10 items-center justify-center rounded-full">
          <Bell size={18} className="text-foreground" />
        </div>
      </div>
    </header>
  )
}
