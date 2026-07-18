import { useState } from 'react'
import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/section-header'
import type { ClassificacaoComponent } from '@/types/protocolo'
import { useQuery } from '@tanstack/react-query'
import { protocoloService } from '@/services/protocolo-service'

interface Props {
  tabelaClassificacaoId: string
}

interface ClassificationLevel {
  classificacao: string
  min: number | null
  max: number | null
  unidade?: string
}

interface AgeRow {
  rotulo: string
  idadeMin: number
  idadeMax: number
  niveis: ClassificationLevel[]
}

interface SexoTable {
  sexo: string
  faixas: AgeRow[]
}

function extractSexoTables(componente: ClassificacaoComponent): SexoTable[] {
  const tables: SexoTable[] = []

  for (const filho of componente.filhos ?? []) {
    if (filho.tipo === 'TabelaSexo' || filho.rotulo?.toLowerCase().includes('sexo')) {
      const faixas: AgeRow[] = []
      const classificacoes: string[] = []

      for (const idadeNode of filho.filhos ?? []) {
        if (idadeNode.tipo === 'TabelaIdade' || idadeNode.rotulo?.toLowerCase().includes('faixa') || idadeNode.rotulo?.toLowerCase().includes('idade')) {
          const niveis: ClassificationLevel[] = []
          for (const nivel of idadeNode.filhos ?? []) {
            if (nivel.classificacao) {
              classificacoes.push(nivel.classificacao)
              niveis.push({
                classificacao: nivel.classificacao,
                min: nivel.valorMinimo ?? null,
                max: nivel.valorMaximo ?? null,
                unidade: nivel.unidade,
              })
            }
          }

          const rotulo = idadeNode.idadeMin !== undefined && idadeNode.idadeMax !== undefined
            ? `${idadeNode.idadeMin} - ${idadeNode.idadeMax}`
            : idadeNode.rotulo

          faixas.push({ rotulo, idadeMin: idadeNode.idadeMin ?? 0, idadeMax: idadeNode.idadeMax ?? 99, niveis })
        }
      }

      tables.push({
        sexo: filho.sexo || filho.rotulo,
        faixas,
      })
    } else if (filho.filhos?.some((f) => f.classificacao)) {
      const flatNiveis: ClassificationLevel[] = []
      for (const nivel of filho.filhos ?? []) {
        flatNiveis.push({
          classificacao: nivel.classificacao ?? nivel.rotulo,
          min: nivel.valorMinimo ?? null,
          max: nivel.valorMaximo ?? null,
          unidade: nivel.unidade,
        })
      }
      tables.push({
        sexo: filho.rotulo,
        faixas: [{
          rotulo: filho.rotulo,
          idadeMin: 0,
          idadeMax: 999,
          niveis: flatNiveis,
        }],
      })
    }
  }

  return tables
}

function isFlat(tables: SexoTable[]): boolean {
  return tables.length === 0
}

function extractFlatNiveis(componente: ClassificacaoComponent): ClassificationLevel[] {
  const niveis: ClassificationLevel[] = []
  for (const filho of componente.filhos ?? []) {
    if (filho.classificacao) {
      niveis.push({
        classificacao: filho.classificacao,
        min: filho.valorMinimo ?? null,
        max: filho.valorMaximo ?? null,
        unidade: filho.unidade,
      })
    }
  }
  return niveis
}

function FormatValue({ min, max, unidade }: { min: number | null; max: number | null; unidade?: string }) {
  const unit = unidade || ''

  if (min !== null && max !== null) {
    return <>{min} — {max} {unit}</>
  }
  if (min !== null) {
    return <>≥ {min} {unit}</>
  }
  if (max !== null) {
    return <>{'<'} {max} {unit}</>
  }
  return <>—</>
}

export function ClassificationSection({ tabelaClassificacaoId }: Props) {
  const { data: tabela, isLoading } = useQuery({
    queryKey: ['tabela-classificacao', tabelaClassificacaoId],
    queryFn: () => protocoloService.getTabelaClassificacao(tabelaClassificacaoId),
    enabled: !!tabelaClassificacaoId,
  })
  const [sexoAba, setSexoAba] = useState(0)

  if (isLoading) {
    return (
      <section>
        <SectionHeader icon={<Layers size={16} />} title="Tabela de Classificação" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </section>
    )
  }

  if (!tabela) return null

  const tables = extractSexoTables(tabela.raiz)
  const isFlatTable = isFlat(tables)

  return (
    <section>
      <SectionHeader icon={<Layers size={16} />} title="Tabela de Classificação" className="mb-3" />

      {isFlatTable ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {extractFlatNiveis(tabela.raiz).map((nivel) => (
            <div key={nivel.classificacao} className="bg-accent/[0.04] border-border flex shrink-0 flex-col items-center gap-1 rounded-xl border px-5 py-3">
              <span className="text-foreground whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                {nivel.classificacao.replace(/_/g, ' ')}
              </span>
              <span className="text-muted-foreground text-center text-sm tabular-nums">
                <FormatValue min={nivel.min} max={nivel.max} unidade={nivel.unidade} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex gap-2">
            {tables.map((table, i) => (
              <button
                key={table.sexo}
                type="button"
                onClick={() => setSexoAba(i)}
                className={cn(
                  'rounded-xl px-5 py-2 text-sm font-medium transition-all',
                  sexoAba === i
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {table.sexo === 'MASCULINO' ? 'Masculino' : table.sexo === 'FEMININO' ? 'Feminino' : table.sexo}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-accent text-accent-foreground">
                  <th className="px-4 py-2.5 font-medium">Idade</th>
                  {tables[sexoAba]?.faixas[0]?.niveis.map((nivel) => (
                    <th key={nivel.classificacao} className="px-3 py-2.5 text-center font-medium">
                      {nivel.classificacao.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tables[sexoAba]?.faixas.map((faixa) => (
                  <tr key={faixa.rotulo} className="border-b last:border-b-0 even:bg-accent/[0.04] hover:bg-accent/[0.06]">
                    <td className="px-4 py-2.5 font-medium text-foreground">{faixa.rotulo} anos</td>
                    {faixa.niveis.map((nivel) => (
                      <td key={nivel.classificacao} className="px-3 py-2.5 text-center text-foreground tabular-nums">
                        <FormatValue min={nivel.min} max={nivel.max} unidade={nivel.unidade} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
