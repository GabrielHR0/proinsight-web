# Proinsight — Regras do Projeto

## Regra nº 1: DESIGN ANTES DE CÓDIGO

Antes de **qualquer** mudança visual (criar componente, editar classe, nova tela, novo card, novo botão),
**SEMPRE** consultar `DESIGN-REFERENCE.md` na raiz e seguir as regras abaixo. O usuário é muito sensível
a design genérico de IA — ele prefere revisar e pedir ajustes do que ver padrões prontos.

## Direção visual (não negociável)

O usuário detesta **"ícone dentro de badge de cor clara"** (`bg-primary/10 text-primary rounded-xl`,
`bg-secondary/10 text-secondary`, `bg-amber-100`, `bg-white shadow-sm` com ícone dentro). Este é o
padrão #1 de UI gerada por IA. **NUNCA** usar. Checklist completo em `DESIGN-REFERENCE.md` seção 0.

Em vez disso:

- **Tipografia como herói**: número grande `text-3xl/4xl font-black tracking-tight` + label
  `text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground`.
- **Borda lateral como acento** (`border-l-[3px] border-l-primary`, urgência `border-l-amber-400`)
  em vez de badge de ícone.
- **Bento grid assimétrico** (tiles 1x/2x), nunca grade de cards idênticos em 3 colunas.
- **Métricas como dado puro** (ex.: `48` + `dias` em typography editorial), sem ícone decorativo.
- **Anéis SVG de progresso** (Apple Fitness) para metas cumulativas.

Proibido (anti-AI checklist):

- Sombras coloridas: `shadow-primary/10`, `shadow-primary/30`, `shadow-link/30` → usar `shadow-sm` neutro ou borda.
- `hover:scale-105` + sombra em cards.
- Gradientes de fundo pastel (`from-amber-50`).
- Pill verde "surgindo" na bottom nav com shadow colorida — ativo = apenas `text-primary`.

## Tokens e cores

- Fundo "verde que parece branco" = `bg-background` (#f1fff3 light / #093030 dark). Usar como fundo
  padrão de superfícies grandes (drawer, sidebar, bottom nav, sheets) — **não** `bg-surface` (#dff7e2).
- Cards: `rounded-2xl border border-border/70 bg-card shadow-sm`.
- Ativo no menu/sidebar: borda lateral `border-l-[3px] border-l-primary` + `bg-muted/40`, ícone `text-primary`, texto `font-semibold`. Inativo: ícone/texto `text-muted-foreground`.
- Bottom nav mobile: fundo `bg-background` + `border-t border-border/70`, ativo `text-primary`.

## Verificação (obrigatória ao terminar trabalho)

Rodar sempre os 3 checks:

```
npx tsc --noEmit
npx vitest run
npx vite build
```

## Convenções

- Não adicionar comentários em código a menos que o usuário peça.
- Seguir padrões existentes (shadcn/ui, Tailwind, componentes em `src/components/ui`).
- Antes de criar arquivo novo, verificar componentes/barrels existentes.
