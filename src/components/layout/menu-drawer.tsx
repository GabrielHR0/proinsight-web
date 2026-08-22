import { useNavigate, useLocation } from 'react-router-dom'
import { useMenuDrawer } from '@/stores/menu-drawer'
import { useAuth } from '@/stores/auth'
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
  Building2,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  to: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const allGroups: MenuGroup[] = [
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
      { icon: Building2, label: 'Minha Academia', to: '/minha-academia' },
      { icon: CircleUser, label: 'Perfil', to: '/perfil' },
      { icon: Settings, label: 'Configurações', to: '/configuracoes' },
    ],
  },
]

export function MenuDrawer() {
  const { open, close } = useMenuDrawer()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const hasAcademia = (user?.academiaIds?.length ?? 0) > 0
    || (user?.academiaPermissoes && Object.keys(user.academiaPermissoes).length > 0)

  const groups = allGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.to === '/minha-academia' && !hasAcademia) return false
      return true
    }),
  })).filter((group) => group.items.length > 0)

  function go(to: string) {
    close()
    setTimeout(() => navigate(to), 200)
  }

  function isActive(to: string) {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />
      <div
        className={`bg-background fixed top-0 left-0 z-[70] flex h-full w-[85%] max-w-sm flex-col overflow-y-auto rounded-r-[32px] pt-14 pb-8 shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-2 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground text-lg font-bold tracking-tight">Proinsight</span>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-2 flex size-8 items-center justify-center rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-muted-foreground mb-8 px-6 text-sm">Navegue pelo sistema</p>

        <div className="flex flex-col gap-6 px-4">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="text-muted-foreground/60 mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                {group.title}
              </h2>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.to)
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => go(item.to)}
                      className={cn(
                        'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors duration-200',
                        active
                          ? 'bg-muted/40 text-foreground'
                          : 'hover:bg-muted/40',
                      )}
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          'shrink-0',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <div className="flex flex-col items-start leading-tight">
                        <span
                          className={cn(
                            'text-sm',
                            active ? 'font-semibold' : 'font-medium text-muted-foreground',
                          )}
                        >
                          {item.label}
                        </span>
                        {!active && (
                          <span className="text-muted-foreground text-[10px] opacity-50">
                            Ir para {item.label.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}