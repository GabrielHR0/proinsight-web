import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Heart, Weight, Zap, Dumbbell, Fence, Activity } from 'lucide-react'
import { PageLayout } from '@/components/layout/page-layout'
import { Input } from '@/components/ui/input'

const CATEGORIES = [
  { id: 'VO2_MAX', label: 'VO₂ Máx', icon: Heart, color: 'bg-accent/10 text-accent border-accent/20' },
  { id: 'IMC', label: 'IMC', icon: Weight, color: 'bg-primary/10 text-primary border-primary/20' },
  { id: 'BIOIMPEDANCIA', label: 'Bioimpedância', icon: Zap, color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
  { id: 'FORCA', label: 'Força', icon: Dumbbell, color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
  { id: 'FLEXIBILIDADE', label: 'Flexibilidade', icon: Fence, color: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800' },
]

const PROTOCOLS_BY_CATEGORY: Record<string, { nome: string; descricao: string }[]> = {
  VO2_MAX: [
    { nome: 'Teste de Cooper', descricao: 'Correr 12 minutos, medir distância percorrida' },
    { nome: 'Teste de Rockport', descricao: 'Andar 1.6km em esteira, medir FC ao final' },
    { nome: 'Teste Incremental em Esteira', descricao: 'Estágios progressivos até a exaustão' },
  ],
  IMC: [
    { nome: 'Índice de Massa Corporal', descricao: 'Relação entre peso e altura' },
    { nome: 'RCQ', descricao: 'Relação cintura-quadril' },
  ],
  BIOIMPEDANCIA: [
    { nome: 'Bioimpedância Completa', descricao: 'Análise de composição corporal' },
    { nome: 'Bioimpedância Tetrapolar', descricao: 'Avaliação segmentar detalhada' },
  ],
  FORCA: [
    { nome: 'Teste de 1RM', descricao: 'Força máxima em um exercício' },
    { nome: 'Teste de Preensão Manual', descricao: 'Força de mão com dinamômetro' },
    { nome: 'Teste de Abdominal', descricao: 'Repetições em 1 minuto' },
  ],
  FLEXIBILIDADE: [
    { nome: 'Teste de Sentar e Alcançar', descricao: 'Flexibilidade de posterior de coxa' },
    { nome: 'Teste de Flexiteste', descricao: 'Amplitude articular passiva' },
  ],
}

export function CategoriesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = CATEGORIES
    .map((cat) => ({
      ...cat,
      protocols: (PROTOCOLS_BY_CATEGORY[cat.id] ?? []).filter(
        (p) =>
          p.nome.toLowerCase().includes(search.toLowerCase()) ||
          p.descricao.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.protocols.length > 0 || search === '')

  return (
    <PageLayout
      header={
        <div>
          <h1 className="text-primary-foreground text-2xl font-bold">Categorias</h1>
          <p className="text-primary-foreground/80 mt-0.5 text-sm">Explore protocolos por categoria</p>
        </div>
      }
    >
      <div className="relative mb-6">
        <Search size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
        <Input
          placeholder="Buscar protocolos..."
          className="bg-background pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-8">
        {filtered.map((cat) => (
          <section key={cat.id}>
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex size-8 items-center justify-center rounded-full ${cat.color}`}>
                <cat.icon size={16} />
              </div>
              <h2 className="text-foreground text-lg font-semibold">{cat.label}</h2>
            </div>
            <div className="flex flex-col gap-2">
              {cat.protocols.map((p) => (
                <div
                  key={p.nome}
                  className="border-border hover:bg-muted flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                  onClick={() => navigate('/avaliacoes')}
                >
                  <Activity size={16} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{p.nome}</p>
                    <p className="text-muted-foreground text-xs">{p.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}