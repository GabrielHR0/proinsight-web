# Registro Multifluxo — Profissional vs Academia

> Documento de análise, alterações implementadas e próximos passos.
> Última atualização: 2026-07-30

---

## Sumário

1. [Problema e Contexto](#1-problema-e-contexto)
2. [Alterações Implementadas](#2-alterações-implementadas)
3. [Análise de Autorizações](#3-análise-de-autorizações)
4. [Estado Atual (Riscos e Limitações)](#4-estado-atual-riscos-e-limitações)
5. [Sugestões de Melhoria](#5-sugestões-de-melhoria)

---

## 1. Problema e Contexto

Antes da alteração, o `POST /auth/register` exigia `academiaNome` como `@NotBlank`. Não era possível cadastrar um usuário sem vínculo com uma academia. Além disso, os únicos campos de academia enviados eram `academiaNome` e `cnpj` — o backend tinha um `AcademiaRequest` completo (com `razaoSocial`, `telefone`, `endereco`) mas o registro não usava esses campos.

**Objetivo:** Suportar dois fluxos de registro:
- **Profissional**: usuário se cadastra sem academia, podendo depois criar ou ser convidado a uma.
- **Academia**: usuário se cadastra e já cria uma academia com dados completos.

---

## 2. Alterações Implementadas

### 2.1 Backend — `proinsight`

#### `RegisterRequest.java`

| Campo | Tipo | Validação | Obrigatório? | Observação |
|-------|------|-----------|-------------|------------|
| `email` | `String` | `@NotBlank`, `@Email` | **Sim** | |
| `password` | `String` | `@NotBlank`, `@Size(min=8)` | **Sim** | |
| `userName` | `String` | `@NotBlank` | **Sim** | |
| `academiaNome` | `String` | — | **Não** | Se nulo/vazio → fluxo profissional |
| `cnpj` | `String` | — | Não | |
| `razaoSocial` | `String` | — | Não | |
| `telefone` | `String` | — | Não | |
| `endereco` | `EnderecoRequest` (aninhado) | — | Não | Se enviado, rua/cidade/estado/cep são required |

`RegisterRequest.EnderecoRequest` é uma classe aninhada com os campos: `rua`, `numero`, `cidade`, `estado`, `cep`.

Método auxiliar: `hasAcademia()` → `return academiaNome != null && !academiaNome.isBlank()`

#### `RegistrationService.java`

```
register(request):
  1. Valida e-mail único e userName único
  2. Cria role "admin" com todas as permissões
  3. Cria UserDocument com academiaRoles = { "pending": [adminRole.id] }
  4. Salva usuário

  if request.hasAcademia():
    a. Cria AcademiaDocument com todos os campos preenchidos
    b. Seta ownerId = savedUser.id
    c. Salva academia
    d. Substitui "pending" pela academiaId real em academiaRoles
    e. Adiciona academiaId a academiaIds
    f. academiaPermissoes = { academiaId: [TODAS] }
  else:
    a. Mantém "pending" em academiaRoles
    b. academiaPermissoes = {} (vazio)

  5. Salva usuário atualizado
  6. Gera JWT e refresh token
  7. Retorna LoginResponse com academiaPermissoes
```

### 2.2 Frontend — `proinsight-web`

#### `src/types/auth.ts`

Antes:
```typescript
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userName: z.string().min(2).max(50),
  academiaNome: z.string().min(2).optional(),
  cnpj: z.string().optional(),
})

export const academiaRegisterSchema = z.object({ ... })
```

Depois:
```typescript
// Base para registro (inclui confirmPassword)
const baseRegisterSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  userName: z.string().min(2, 'Mínimo de 2 caracteres').max(50),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
})

// Registro sem academia
export const registerUserSchema = baseRegisterSchema.refine(
  data => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] },
)

// Endereço (reutilizável)
export const enderecoSchema = z.object({
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
})

// Registro com academia
export const registerAcademiaSchema = baseRegisterSchema.extend({
  academiaNome: z.string().min(2, 'Nome da academia é obrigatório'),
  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  telefone: z.string().optional(),
  endereco: enderecoSchema.optional(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Senhas não conferem', path: ['confirmPassword'] },
)

export type RegisterInput = RegisterUserInput | RegisterAcademiaInput
```

> **Nota:** O campo `confirmPassword` existe **apenas no frontend** para validação. O `authService.register()` o remove antes de enviar ao backend via `stripConfirmPassword()`.



#### `src/features/auth/register-page.tsx`

- Seletor de abas: **Profissional** (só email/userName/senha) vs **Academia** (campos completos).
- Aba "Academia" mostra seções:
  - **Dados da academia**: nome (obrigatório), CNPJ, razão social, telefone
  - **Endereço** (opcional como bloco): rua, número, cidade, estado, CEP
- Esquema de validação troca dinamicamente conforme a aba ativa.
- O formulário usa `useForm<RegisterUserInput | RegisterAcademiaInput>` com `zodResolver`.

#### `src/types/__tests__/auth.test.ts`

Testes reorganizados em 3 grupos:
- `loginSchema` (inalterado)
- `registerUserSchema (sem academia)` — testa dados básicos + rejeição de senha curta
- `registerAcademiaSchema (com academia)` — testa campos obrigatórios, opcionais e endereço aninhado

---

## 3. Análise de Autorizações

### 3.1 Como o backend resolve permissões

1. `CustomUserDetailsService.toUserDetails()` lê `User.academiaRoles` (Map<academiaId, Set<roleId>>)
2. Carrega as roles do banco, extrai as permissões de cada role
3. Constrói `Map<String, Set<Permissao>> academiaPermissoes` (escopo por academia)
4. Constrói `Set<GrantedAuthority>` (união flat de todas as permissões)
5. Se `academiaRoles` é vazio → authorities vazio → nenhum endpoint autorizado

### 3.2 Como o JWT é montado

`JwtTokenProvider.generateToken()`:
- Injeta `academiaPermissoes` como claim `Map<String, List<String>>`
- Injeta `academiaIds` como claim `List<String>`

`JwtTokenProvider.getAuthentication()` (a cada requisição):
- Lê header `X-Academia-Id` da request
  - Se presente e válido → usa **só as permissões daquela academia**
  - Se ausente → usa **união de todas as permissões**
  - Se não há permissões → authorities vazio

### 3.3 Controles de acesso nos controllers

Todos os controllers de feature usam `@PreAuthorize`:

```java
// Padrão mais comum (leitura):
@PreAuthorize("hasAuthority('CLIENTES_LER')")

// Padrão de escrita com tenant:
@PreAuthorize("hasAuthority('CLIENTES_CRIAR') and @auth.hasAcademiaAccess(#request.academiaId)")

// Auto ou super admin:
@PreAuthorize("@auth.isCurrentUser(#ownerId) or hasAuthority('SUPER_ADMIN')")
```

### 3.4 Estado atual: ambos os fluxos

| Operação | Fluxo Profissional | Fluxo Academia |
|----------|-------------------|----------------|
| POST /auth/register | ✅ 201 | ✅ 201 |
| POST /auth/login | ✅ 200 | ✅ 200 |
| GET /auth/me | ✅ 200 | ✅ 200 |
| POST /auth/logout | ✅ 204 | ✅ 204 |
| GET /clientes | ❌ 403 | ✅ (se tiver permissão) |
| POST /avaliacoes | ❌ 403 | ✅ (se tiver permissão) |
| POST /academias | ❌ 403 (precisa ACADEMIAS_CRIAR) | ✅ (admin) |
| CRUD features | ❌ 403 | ✅ |

---

## 4. Estado Atual (Riscos e Limitações)

### 4.1 Riscos identificados

| Risco | Impacto | Gravidade |
|-------|---------|-----------|
| Usuário sem academia vê o menu completo mas toda ação dá 403 | Experiência confusa, frustração | **Alta** |
| Sem tela de "criar/juntar-se a academia" após registro | Usuário profissional fica sem saída | **Alta** |
| Sem seletor de academia ativa | Usuário com múltiplas academias não consegue alternar | **Média** |
| Sem guards de permissão no frontend | UI não reflete o que o usuário pode fazer | **Média** |

### 4.2 Diferença entre autenticação e autorização

O sistema atual trata corretamente os dois conceitos, mas a UX não reflete a diferença:

```
Autenticado (tem JWT)  ≠  Autorizado (tem permissões)
       ✓                         ✓ ou ✗
```

O frontend só verifica autenticação (`isAuthenticated`) para liberar rotas. Nunca verifica autorização (`academiaPermissoes`).

---

## 5. Sugestões de Melhoria

### 5.1 [ALTA] Tela pós-registro para usuário sem academia

Quando o usuário se registra como Profissional e o backend retorna `academiaPermissoes: {}`, redirecionar para uma tela de **onboarding** com duas opções:

**Opção A — Criar nova academia**
```
POST /academias
Body: { ownerId, nomeFantasia, cnpj, razaoSocial, endereco, telefone }
Headers: Authorization: Bearer <jwt>
```

O backend precisa permitir que um usuário crie uma academia mesmo sem ter `ACADEMIAS_CRIAR` quando:
- For o próprio usuário (`@auth.isCurrentUser(#request.ownerId)`)
- A academia ainda não existe

Sugestão de alteração no `AcademiaController`:
```java
@PostMapping
@PreAuthorize("hasAuthority('ACADEMIAS_CRIAR') or @auth.isCurrentUser(#request.ownerId)")
public ResponseEntity<AcademiaResponse> create(@Valid @RequestBody AcademiaRequest request) {
    // ...
}
```

**Opção B — Inserir código de convite**
- Um flow futuro com tokens de convite para entrar em academias existentes.

#### Fluxo de navegação sugerido

```
/register (Profissional)
  ↓
/onboarding (academiaPermissoes vazio)
  ├─ "Criar minha academia" → formulário AcademiaRequest → POST /academias → redirect /
  └─ "Tenho um convite" → input de código → valida → redirect /
```

#### Componentes a criar

| Componente | Descrição |
|------------|-----------|
| `src/features/onboarding/onboarding-page.tsx` | Tela com as duas opções |
| `src/features/onboarding/criar-academia-form.tsx` | Formulário idêntico à aba Academia do register |
| `src/features/onboarding/codigo-convite-form.tsx` | Input de código de convite |

#### Rota a adicionar

```typescript
// router.tsx
<Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
```

#### Guard para redirecionar ao onboarding

No `AuthProvider` ou em um `AuthGate` componente, após o login/registro, verificar:

```typescript
// Se autenticou mas não tem academia → redirect /onboarding
if (isAuthenticated && user.academiaIds.length === 0 && location.pathname !== '/onboarding') {
  return <Navigate to="/onboarding" replace />
}
```

**Cuidado:** implementar isso requer um estado extra para evitar loop infinito (ex: `isRedirecting`).

### 5.2 [ALTA] Guards de permissão no frontend

Criar um hook e componentes de UI para esconder ações que o usuário não pode executar.

#### Hook `usePermissions`

```typescript
// src/hooks/use-permissions.ts
import { useAuth } from '@/stores/auth'
import { useMemo } from 'react'

type Permissao =
  | 'CLIENTES_CRIAR' | 'CLIENTES_LER' | 'CLIENTES_ATUALIZAR' | 'CLIENTES_EXCLUIR'
  | 'AVALIACOES_CRIAR' | 'AVALIACOES_LER' | 'AVALIACOES_ATUALIZAR' | 'AVALIACOES_EXCLUIR'
  | 'AVALIADORES_CRIAR' | 'AVALIADORES_LER' | 'AVALIADORES_ATUALIZAR'
  | 'PROTOCOLOS_LER'
  | 'USUARIOS_CRIAR' | 'USUARIOS_LER' | 'USUARIOS_ATUALIZAR' | 'USUARIOS_EXCLUIR'
  | 'ACADEMIAS_CRIAR' | 'ACADEMIAS_LER' | 'ACADEMIAS_ATUALIZAR'
  | 'RELATORIOS_LER' | 'RELATORIOS_EXPORTAR'
  | 'SUPER_ADMIN'

export function usePermissions() {
  const { user } = useAuth()

  const academiaId = localStorage.getItem('proinsight_academia_id')

  return useMemo(() => {
    const permissoes = academiaId
      ? user?.academiaPermissoes?.[academiaId] ?? []
      : Object.values(user?.academiaPermissoes ?? {}).flat()

    return {
      hasPermission: (perm: Permissao) => permissoes.includes(perm),
      hasAnyPermission: (...perms: Permissao[]) => perms.some(p => permissoes.includes(p)),
      hasAllPermissions: (...perms: Permissao[]) => perms.every(p => permissoes.includes(p)),
      permissoes,
    }
  }, [user, academiaId])
}
```

#### Componente `Can`

```typescript
// src/components/auth/can.tsx
import { usePermissions } from '@/hooks/use-permissions'
import type { Permissao } from '@/hooks/use-permissions'

interface CanProps {
  perm: Permissao
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ perm, fallback = null, children }: CanProps) {
  const { hasPermission } = usePermissions()
  return hasPermission(perm) ? children : fallback
}
```

#### Uso nos componentes

```tsx
// Ocultar botão "Novo cliente" se não tiver permissão
<Can perm="CLIENTES_CRIAR">
  <Button onClick={() => navigate('/clientes/novo')}>Novo Cliente</Button>
</Can>

// Ocultar aba do menu se não tiver acesso a nenhuma feature da área
<Can perm="AVALIACOES_LER">
  <NavItem to="/avaliacoes" label="Avaliações" />
</Can>
```

#### Componente `ProtectedFeature` (para rotas)

```typescript
// src/components/auth/protected-feature.tsx
import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/use-permissions'
import type { Permissao } from '@/hooks/use-permissions'

interface ProtectedFeatureProps {
  perm: Permissao
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedFeature({ perm, children, fallback }: ProtectedFeatureProps) {
  const { hasPermission } = usePermissions()
  if (!hasPermission(perm)) {
    return fallback ?? <Navigate to="/" replace />
  }
  return children
}
```

### 5.3 [MÉDIA] Seletor de academia ativa

Quando o usuário tem múltiplas academias, precisa de um seletor no layout.

#### Estado no AuthContext

```typescript
// stores/auth.tsx
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  academiaAtiva: AcademiaInfo | null  // NOVO
  switchAcademia: (id: string) => void  // NOVO
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}
```

#### Componente `AcademiaSwitcher`

```tsx
function AcademiaSwitcher() {
  const { user, academiaAtiva, switchAcademia } = useAuth()
  const academias = Object.keys(user?.academiaPermissoes ?? {})

  if (academias.length <= 1) return null

  return (
    <select value={academiaAtiva?.id} onChange={e => switchAcademia(e.target.value)}>
      {academias.map(id => (
        <option key={id} value={id}>Academia {id}</option>
      ))}
    </select>
  )
}
```

#### Integração com o Axios

Já existe o suporte no interceptor (`api.ts`) que lê `proinsight_academia_id` do localStorage. O seletor só precisa atualizar essa chave.

### 5.4 [BAIXA] Menu dinâmico por permissão

Usar o `usePermissions` hook para filtrar itens do menu/navegação:

```typescript
const menuItems = [
  { label: 'Início', path: '/', perm: null },
  { label: 'Clientes', path: '/clientes', perm: 'CLIENTES_LER' },
  { label: 'Avaliações', path: '/avaliacoes', perm: 'AVALIACOES_LER' },
  { label: 'Relatórios', path: '/relatorios', perm: 'RELATORIOS_LER' },
] as const

// No componente de navegação
const { hasPermission } = usePermissions()

{menuItems
  .filter(item => !item.perm || hasPermission(item.perm))
  .map(item => (
    <NavItem key={item.path} to={item.path} label={item.label} />
  ))
}
```

### 5.5 Plano de implementação sugerido

| Fase | Tarefas | Depende de |
|------|---------|------------|
| **1** | Hook `usePermissions` + componente `Can` + `ProtectedFeature` | — |
| **2** | Aplicar `Can` nos botões de ação (novo cliente, nova avaliação, etc.) | Fase 1 |
| **3** | Aplicar `Can`/`ProtectedFeature` nas rotas do menu | Fase 1 |
| **4** | Tela de onboarding + formulário "criar academia" | Ajuste no `AcademiaController` |
| **5** | Seletor de academia ativa | — |
| **6** | Fluxo de convite (posterior) | Fase 4 |

### 5.6 Segurança ao implementar

- **Sempre validar no backend**: os guards do frontend são apenas UX. O `@PreAuthorize` no backend é a barreira real.
- **Nunca confiar no `academiaId` vindo do frontend**: o backend valida se o usuário tem acesso (`hasAcademiaAccess`).
- **Refresh token mantém o tenant**: após refresh, o interceptor re-aplica o `X-Academia-Id` da sessão anterior.
- **Testar ambos os fluxos**: criar testes de mutação para `registerUserSchema` e `registerAcademiaSchema`, e testes de integração para os dois caminhos no backend.

---

## Histórico

| Data | Descrição |
|------|-----------|
| 2026-07-30 | Criação do documento. Análise de autorizações, alterações implementadas e sugestões. |
