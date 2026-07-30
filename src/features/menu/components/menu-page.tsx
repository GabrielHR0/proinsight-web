import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  UserPlus,
  ClipboardList,
  PlusCircle,
  CalendarDays,
  BarChart3,
  Clock,
  FolderTree,
  CircleUser,
  Settings,
  Sparkles,
} from 'lucide-react'

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  to: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const groups: MenuGroup[] = [
  {
    title: 'Principal',
    items: [
      { icon: Home, label: 'Home', to: '/' },
      { icon: Sparkles, label: 'Sugestões', to: '/' },
    ],
  },
  {
    title: 'Alunos',
    items: [
      { icon: Users, label: 'Ver Alunos', to: '/clientes' },
      { icon: UserPlus, label: 'Novo Aluno', to: '/clientes' },
    ],
  },
  {
    title: 'Avaliações',
    items: [
      { icon: ClipboardList, label: 'Protocolos', to: '/avaliacoes' },
      { icon: PlusCircle, label: 'Nova Avaliação', to: '/avaliacao/nova' },
    ],
  },
  {
    title: 'Agenda',
    items: [
      { icon: CalendarDays, label: 'Agendamentos', to: '/agenda' },
    ],
  },
  {
    title: 'Dados',
    items: [
      { icon: BarChart3, label: 'Análise', to: '/analise' },
      { icon: Clock, label: 'Histórico', to: '/historico' },
      { icon: FolderTree, label: 'Categorias', to: '/categorias' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { icon: CircleUser, label: 'Perfil', to: '/perfil' },
      { icon: Settings, label: 'Configurações', to: '/configuracoes' },
    ],
  },
]

export function MenuPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const close = () => {
    setOpen(false)
    setTimeout(() => navigate(-1), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />
      <div
        className={`bg-surface flex h-full w-[85%] max-w-sm flex-col overflow-y-auto rounded-r-[32px] pt-12 pb-8 shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary size-3 rounded-full" />
            <span className="text-foreground text-lg font-bold">Proinsight</span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Navegue pelo sistema</p>
        </div>

        <div className="flex flex-col gap-6 px-4">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider">
                {group.title}
              </h2>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-background"
                  >
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon size={18} />
                    </div>
                    <span className="text-foreground text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
