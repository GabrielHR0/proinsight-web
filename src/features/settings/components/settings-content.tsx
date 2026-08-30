import { useState } from 'react'
import { Palette, Moon, Sun, Trash2, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/confirm-modal'
import { useTheme } from '@/stores/theme'

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '0.1.0'

export function SettingsContent() {
  const [showClearModal, setShowClearModal] = useState(false)
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="flex flex-col gap-8">
      {/* Theme section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Palette size={18} className="text-primary" />
          <h2 className="text-foreground text-lg font-semibold">Tema</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-medium">Aparência</p>
                  <p className="text-muted-foreground text-xs">Escolha entre tema claro e escuro</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {themes.map((t) => {
                const isActive = t.name === theme
                const Icon = t.name === 'dark' ? Moon : Sun
                return (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* Data section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Trash2 size={18} className="text-destructive" />
          <h2 className="text-foreground text-lg font-semibold">Dados</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-destructive shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-medium">Limpar dados locais</p>
                  <p className="text-muted-foreground text-xs">Remove cache e preferências salvas</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/10 shrink-0 gap-1.5 rounded-full text-xs"
                onClick={() => setShowClearModal(true)}
              >
                <Trash2 size={12} />
                Limpar
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* About section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Info size={18} className="text-muted-foreground" />
          <h2 className="text-foreground text-lg font-semibold">Sobre</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-foreground text-sm font-medium">ProInsight</p>
                <p className="text-muted-foreground text-xs">Versão {APP_VERSION}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <ConfirmModal
        open={showClearModal}
        onOpenChange={setShowClearModal}
        title="Limpar dados"
        description="Tem certeza? Esta ação removerá todos os dados armazenados localmente e não pode ser desfeita."
        confirmLabel="Limpar tudo"
        variant="danger"
        onConfirm={() => {
          localStorage.clear()
          setShowClearModal(false)
        }}
      />
    </div>
  )
}
