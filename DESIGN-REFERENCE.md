# Referência Visual do Proinsight

Referências coletadas em pesquisa web (ago/2026) para guiar todo trabalho visual do frontend.
**Regra: antes de qualquer mudança de visual, consultar este documento.**

> **Direção atual (ago/2026): design expressivo, fugindo do "AI look".**
> Tudo abaixo foi revisado a partir do teardown de UI gerada por IA (Superdesign, Sailop,
> Visily, Kompozy) e de templates fitness reais (Stride/Sleek, Apple Fitness, BodyBuddy).
> A regra de ouro: **tipografia carrega o design; decoração só quando acrescenta dados.**

---

## 0. O QUE NÃO FAZER (anti-AI checklist)

Fingerprints de UI gerada por IA — **tudo isso fere e deve ser removido onde existir**:

1. **Ícone em badge de cor clara** (`bg-primary/10 text-primary rounded-xl`): o assinatura #1 de UI de IA. Pilar: **nunca** usar ícone dentro de círculo/retângulo colorido para "decorar" card. O dado carrega o design.
2. Grid de cards **idênticos** (mesmo padding, mesmo radius, mesma sombra, mesmo gap) em 3 colunas.
3. `shadow-primary/10`, `shadow-link/30` etc. — sombras coloridas e grandes. Use `shadow-sm` neutro ou borda.
4. `hover:scale-105` + sombra em todo card.
5. "Fade-up on scroll" em tudo.
6. Symetria bilateral e centralização excessiva (todo esquerda/direita).
7. 4px de base linear sem micro-ajuste (`gap-4`, `py-4`, `px-6` em todo canto idêntico).
8. Apenas uma fonte sans genérica (ex.: Inter/system-ui) — usamos Poppins, mas devemos variar pesos.
9. **Bordas laterais coloridas em cards/botões** (`border-l-[3px] border-l-primary`). Nunca usar. O estado ativo em menus usa apenas `bg-muted/40` + `text-primary` + `font-semibold`.

**Como diferenciar (substitutivos concretos):**
- **Tipografia como herói**: número grande `text-3xl/4xl font-black tracking-tight` + label
  `text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground`.
- **Seções abertas (editorial)**: em vez de cards empilhados, usar tipografia + espaço.
  Títulos de seção `text-base font-black tracking-tight`. Borda sutil entre seções (`border-border/60`).
- **Nunca cards empilhados alinhados** (mesmo tamanho, empilhados verticalmente): usar linhas com `border-b` + popovers para detalhes, ou bento grid assimétrico.
- **Métricas como dado puro**: valor + unidade em typography editorial (ex.: `48` + `dias`).
- **Bento grid assimétrico**: tiles de tamanhos variados (1x/2x) — nunca grade idêntica.
- **Apple/Stride forms**: anéis SVG (progresso), sparklines, `bg-card` com `border-border/70 shadow-sm`.

O tema já definido no `globals.css` segue a linguagem do [shadcn Green theme](https://www.shadcn.io/theme/green)
e do preset verde (Paletta). Valores de referência da comunidade:

| Token | Light | Dark |
|---|---|---|
| primary | `oklch(0.527 0.154 150.069)` (~#00d09e) | `oklch(0.448 0.119 151.328)` (verde floresta) |
| primary-foreground | `oklch(0.982 0.018 155.826)` (verde quase branco) | idem |
| secondary (mint/azul) | `oklch(0.967 0.001 286.375)` / `#6db6fe` | — |
| background | `oklch(0.987 0.02 155)` (~#f1fff3) | `oklch(0.15 0.02 160)` (~#093030) |
| chart-1..5 | `0.871 0.15 154` → `0.448 0.119 151` (gradação do verde) | verdes mais profundos |

Regras de uso:
- **Verde primário** = ações principais, badges de ícone ativo, destaque.
- **Verde mais claro (background)** = fundo de cards/forms (já aplicado: `bg-background/80`).
- **Ícones inativos** = tom azul `secondary` (`bg-secondary/10 text-secondary`).
- Dark mode = tons floresta profundos (`#052224`, `#031314`, `#093030`), nunca preto puro.

## 2. Superfícies (cards, sombras)

- Cards: `rounded-2xl border border-border/70 bg-card shadow-sm` — **sem sombra colorida**.
- Sombra neutra pequena (`shadow-sm`) ou hierarquia via borda/clareza, nunca `shadow-* /10`.
- Bento grid: tiles assimétricos (1x/2x), um destaque por grupo.

## 3. Tipografia & Radii

- Fonte: Poppins (já configurada). Títulos `font-bold tracking-tight`, maiúsculas só em marca.
- Radii: `rounded-xl` (inputs, badges), `rounded-2xl` (cards, botões grandes, itens de menu),
  `rounded-3xl`+ (painéis grandes, drawer, bottom nav `rounded-t-[32px]`/`rounded-t-[40px]`).
- Botões: `active:scale-[0.98]`, hover `bg-primary/90` com `transition-all duration-200`.

## 4. Dashboards fitness (Stride/Sleek, Apple Fitness, BodyBuddy)

Fonte: templates fitness reais com "Clean Athletic" e dashboards de saúde.
- **Stat cards**: tipografia como herói — valor grande `text-3xl/4xl font-black tracking-tight` +
  label `text-[11px] uppercase tracking-[0.12em] text-muted-foreground`. **Nunca** badge de ícone.
- **Bento grid**: tiles de tamanhos variados (2/3 colunas), um visual em destaque, células com
  "tela de app" interna (preview UI dentro do card).
- **Anéis de progresso**: SVG concêntricos (Apple Fitness) para metas cumulativas.
- **Tabelas**: listas em cards com `divide-y divide-border/50`, linhas `py-3 px-4`, ação hover.
- **Gráficos**: paleta chart-1..5 em gradação verde/azul.
- **Laudo (relatório de avaliação)**: gráfico em destaque como herói (primeiro na página).
  Seções abertas com tipografia editorial — poucos cards, mais espaço e hierarquia visual.

## 5. Navegação & Estados

- **Sidebar/drawer**: item ativo = `bg-muted/40 text-foreground` + ícone `text-primary` + `font-semibold`. Sem borda lateral.
- **Bottom nav (mobile)**: ativo `text-primary`, inativo `text-muted-foreground`. Sem badges decorativas.
- **Animações**: micro-interações funcionais (contador, barra preenchendo); `active:scale-[0.98]`.
  Evitar fade-up e hover-scale em massa — só quando comunica estado.

## 6. Referências diretas (links)

- https://www.superdesign.dev/blog/why-ai-design-looks-generic — por que UI de IA parece genérica
- https://sailop.com/blog/complete-guide-anti-ai-design-2026 — anti-AI checklist + scoring
- https://www.visily.ai/blog/how-to-make-ai-designs-less-generic/ — separar estética de composição
- https://sleek.design/templates/fitness-app — "Stride": off-white canvas, 22px radius, números bold, 1 accent
- https://www.shadcn.io/theme/green — tema verde oficial shadcn
- https://usepaletta.io/colors/shadcn-green-theme — tokens HSL verdes + acessibilidade
- https://www.shaheermalik.com/blog/bodybuddy-brand-guidelines-case-study — deep green + lime + aqua, fonts amigáveis
- https://www.shadcn.io/blocks/stats-hero-metric-minimal — stat metric minimal (sem gráfico, sem chrome)
- https://www.shadcn.io/blocks/stats-concentric-rings-card — anéis concêntricos Apple Watch

## 7. Bibliotecas & repos aprovados (pesquisa ago/2026)

Base de onde extrair componentes prontos (gratuitos/MIT) quando faltar peça visual.
Regra: só usar o que respeitar o anti-AI checklist da seção 0 — copy-paste e adaptar.

### Componentes animados (copy-paste, shadcn-compatível)

| Lib | Componentes | Instalação | Uso no Proinsight |
|---|---|---|---|
| **Magic UI** (github.com/magicuidesign/magicui) | ~80 (MIT) | `npx shadcn@latest add @magicui/<comp>` | **Primário**: Number Ticker (métricas), Animated Circular Progress Bar (anéis Apple Fitness), Bento Grid, Confetti, Scroll Progress |
| **React Bits** (github.com/DavidHDev/react-bits) | 165+ | `npx shadcn@latest add @react-bits/Comp-TS-TW` | Cherry-pick: CountUp, ScrollStack, SpotlightCard, ProfileCard, SplitFlapText |
| Motion Primitives | 155+ | shadcn CLI | Marquee, Glassmorphism, scroll effects |
| KokonutUI, GodUI, CuiCui, NudaUI (650, zero deps) | variado | shadcn CLI / copy-paste | Consultar quando faltar peça |

**Regra do projeto**: Magic UI é a base; não substituir o shadcn/ui já usado.
`framer-motion` (~40KB) só é adicionado se os componentes escolhidos exigirem.

### Ícones
- **Manter Lucide** (padrão do projeto, ISC).
- **`@tabler/icons-react`** (6.184 ícones, MIT) para ícones fitness faltantes:
  `IconKettlebell`, `IconJumpRope`, `IconSwimming`, `IconRun`, `IconKarate`, `IconRings`, `IconTrekking`, `IconShirtSport`.
  - React 19: usar override em package.json:
    ```json
    "overrides": { "@tabler/icons-react": { "react": "^19.0.0" } }
    ```
  - Diferenças: prefixo `Icon` no import, prop `stroke` (não `strokeWidth`).
- **Animated Icons** (`@animated-color-icons/lucide-react`): NÃO substituir Lucide (sem TS, CSS duplicado). Só 3-5 ícones pontuais (sino, heart, settings) no nav/sidebar.
- Alternativas: Phosphor (9k, 6 pesos), Heroicons, Iconoir, Remix, Reicon (MCP).

### Spinners / loaders
- **`ldrs`** (44 loaders, zero deps, minimalista) — recomendado.
- **`react-spinners`** (750k downloads/semana, 24 loaders, battle-tested) — alternativa.
- **SVG Spinners raw** (github.com/n3r4zzurr0/svg-spinners) — 40 spinners, 300B-2,5KB cada; copiar SVG inline com `currentColor`.
- Evitar `react-svg-spinners` (arquivado, sem manutenção).

### Toasts (melhoria sobre o Sonner existente)
- **goey-toast** / **Sileo** (gooey morph) e **Glacé** (frosted glass) — drop-in sobre Sonner, MIT.
- Não trocar o Sonner; só adicionar se o visual atual parecer genérico.

### Listas curadas
- github.com/brillout/awesome-react-components (48k stars)
- github.com/magicuidesign/magicui, github.com/DavidHDev/react-bits (docs completos)
- github.com/n3r4zzurr0/svg-spinners (− spinners CSS/SMIL)
