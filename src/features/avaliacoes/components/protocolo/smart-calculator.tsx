import { useState, useMemo, useCallback } from 'react'
import { Calculator, Equal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variable {
  name: string
  label: string
  step: number
  min?: number
  max?: number
  options?: { value: number; label: string }[]
  suffix?: string
}

function parseFormula(formula: string): { display: string; expression: string; variables: Variable[] } | null {
  const eqIndex = formula.indexOf('=')
  if (eqIndex === -1) return null

  const display = formula.trim()
  const expr = formula.slice(eqIndex + 1).trim()

  let normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/,/g, '.')
    .replace(/altura_m²\b/g, '(altura_m2 * altura_m2)')
    .replace(/²/g, '^2')

  const tokens = normalized
    .split(/([\+\-\*\/\^\(\)])/g)
    .map((t) => t.trim())
    .filter(Boolean)

  const varSet = new Set<string>()
  for (const token of tokens) {
    if (/^[a-zA-Z_]\w*$/.test(token) && !['x'].includes(token)) {
      varSet.add(token)
    }
  }

  const variableConfigs: Record<string, Omit<Variable, 'name'>> = {
    distanciaMetros: { label: 'Distância percorrida', step: 10, min: 0, suffix: 'm' },
    pesoLbs: { label: 'Peso (libras)', step: 0.5, min: 0, suffix: 'lbs' },
    peso_kg: { label: 'Peso', step: 0.1, min: 0, suffix: 'kg' },
    idade: { label: 'Idade', step: 1, min: 10, max: 120, suffix: 'anos' },
    sexo: {
      label: 'Sexo',
      step: 1,
      options: [
        { value: 0, label: 'Feminino' },
        { value: 1, label: 'Masculino' },
      ],
    },
    tempo: { label: 'Tempo', step: 0.1, min: 0, suffix: 'min' },
    FC: { label: 'Frequência Cardíaca', step: 1, min: 30, max: 250, suffix: 'bpm' },
    vel_m_min: { label: 'Velocidade', step: 0.1, min: 0, suffix: 'm/min' },
    inclinação: { label: 'Inclinação', step: 0.5, min: 0, max: 30, suffix: '%' },
    altura_m2: { label: 'Altura', step: 0.01, min: 0.5, max: 2.5, suffix: 'm' },
    altura_m: { label: 'Altura', step: 0.01, min: 0.5, max: 2.5, suffix: 'm' },
  }

  const variables: Variable[] = []
  for (const varName of varSet) {
    const config = variableConfigs[varName]
    if (config) {
      variables.push({ name: varName, ...config })
    } else {
      variables.push({
        name: varName,
        label: varName.replace(/_/g, ' '),
        step: 1,
      })
    }
  }

  return { display, expression: normalized, variables }
}

interface SmartCalculatorProps {
  formula: string
}

type InputValues = Record<string, number | undefined>

export function SmartCalculator({ formula }: SmartCalculatorProps) {
  const parsed = useMemo(() => parseFormula(formula), [formula])
  const [showResult, setShowResult] = useState(false)
  const [values, setValues] = useState<InputValues>({})

  const setValue = useCallback((name: string, val: number | undefined) => {
    setValues((prev) => ({ ...prev, [name]: val }))
    setShowResult(true)
  }, [])

  const result = useMemo(() => {
    if (!parsed) return null
    for (const v of parsed.variables) {
      const val = values[v.name]
      if (v.options ? val === undefined : !Number.isFinite(val)) return null
    }
    try {
      let expr = parsed.expression
      for (const [name, val] of Object.entries(values)) {
        if (val === undefined || !Number.isFinite(val)) return null
        expr = expr.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `(${val})`)
      }
      if (/[a-zA-Z_]/.test(expr)) return null
      const sanitized = expr.replace(/\^/g, '**')
      const fn = new Function(`return (${sanitized})`)
      const result = fn()
      if (typeof result !== 'number' || !isFinite(result)) return null
      return Math.round(result * 100) / 100
    } catch {
      return null
    }
  }, [parsed, values])

  if (!parsed) return null

  return (
    <div>
      <div className="mb-4 rounded-xl bg-muted px-4 py-3 font-mono text-sm text-foreground">
        <p className="leading-relaxed whitespace-pre-line">{parsed.display}</p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        {parsed.variables.map((v) => (
          <div key={v.name}>
            <label className="text-foreground mb-1.5 block text-xs font-medium">
              {v.label}
              {v.suffix && <span className="text-muted-foreground ml-1">({v.suffix})</span>}
            </label>

            {v.options ? (
              <div className="flex gap-2">
                {v.options.map((opt) => {
                  const active = (values[v.name] ?? v.options![0]?.value) === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue(v.name, opt.value)}
                      className={cn(
                        'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  value={values[v.name] ?? ''}
                  onChange={(e) => {
                  const n = parseFloat(e.target.value)
                  setValue(v.name, Number.isNaN(n) ? undefined : n)
                }}
                  step={v.step}
                  min={v.min}
                  max={v.max}
                  className="bg-background border-border text-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showResult && result !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl bg-primary p-5 shadow-sm duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Equal size={16} className="text-primary-foreground/70" />
              <span className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Resultado</span>
            </div>
            <button
              type="button"
              onClick={() => setShowResult(false)}
              className="text-primary-foreground/50 hover:text-primary-foreground text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
          <p className="text-primary-foreground mt-2 text-3xl font-bold tabular-nums tracking-tight">
            {result.toLocaleString('pt-BR')}
            <span className="text-primary-foreground/70 ml-1 text-lg font-medium">
              {parsed.display.includes('mL/kg/min') ? 'mL/kg/min' : parsed.display.includes('IMC') ? 'kg/m²' : ''}
            </span>
          </p>
        </div>
      )}

      {!showResult && (
        <button
          type="button"
          onClick={() => setShowResult(true)}
          className="border-border text-muted-foreground hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-colors"
        >
          <Calculator size={16} />
          Calcular
        </button>
      )}
    </div>
  )
}
