# Roadmap — Frontend vs Backend

> Gerado em 22/08/2026. Revisar após cada milestone.

---

## Visão geral

| Item | Quantidade |
|------|------------|
| Endpoints no backend | 36 |
| Páginas no frontend | 19 |
| Páginas funcionais (100%) | 10 |
| Páginas parcialmente funcionais | 5 |
| Páginas placeholder (sem backend) | 4 |

---

## 🔴 Páginas placeholder (sem backend)

### 1. `/analise` — AnalysisPage

- **Frontend**: Só mostra empty state "Nenhuma análise disponível"
- **Backend**: Nenhum endpoint de relatórios/análises
- **Permissões existem mas não usam**: `RELATORIOS_LER`, `RELATORIOS_EXPORTAR`
- **Status**: Nada implementado

### 2. `/historico` — HistoryPage

- **Frontend**: Só mostra empty state "Nenhum histórico encontrado"
- **Backend**: O endpoint `GET /clientes/{id}/avaliacoes` JÁ existe e retorna dados
- **Problema**: A rota `/historico` foi descontinuada (removida do router), mas o componente ainda existe como página standalone
- **Status**: Não é mais necessário — conteúdo foi movido para o detail do cliente

### 3. `/agenda` — AgendaPage

- **Frontend**: Calendário renderiza, mas zero integração. Botões "Novo" e "Agendar" não fazem nada
- **Backend**: Nenhum endpoint de agendamentos. Nenhuma entidade `Agendamento` no domain
- **Status**: Shell visual, nada implementado

---

## 🟡 Páginas com funcionalidade parcial

### 4. `/` — HomePage (Dashboard)

- **Backend**: Só usa `GET /auth/me` para pegar nome do usuário
- **Dados hardcoded no frontend**:
  - 12 alunos com nomes, IDs, avatares
  - 3 itens de agenda
  - Progresso diário 5/8
  - KPIs semanais
  - Lista de aniversariantes
  - Feed de atividades
  - Fila de reavaliação
  - Fila de próximas avaliações
  - Badge "3" no sino de notificações
- **Backend não tem**: Nenhum dashboard/aggregation endpoint
- **Status**: 90% mockado

### 5. `/avaliacao/nova` — NovaAvaliacaoPage

- **Frontend**: Seleciona cliente + protocolo, mas só funciona para VO2Max esteira incremental
- **Backend suporta**: `POST /avaliacoes/vo2max` e `POST /avaliacoes/imc`
- **Problema**: Para protocolos de IMC ou outros, o botão "Iniciar" navega para `/avaliacoes` sem fazer nada
- **Hardcoded**: `PROTOCOLO_RECOMENDADO_ID = 'protocolo_vo2max_esteira_incremental'`
- **Status**: Só 1 de N protocolos funciona

### 6. `/onboarding` — OnboardingPage

- **Funcional**: Criar academia funciona (`POST /academias`)
- **Não funcional**: Fluxo "Tenho um código de convite" — mostra "Em breve..."
- **Backend não tem**: Nenhum endpoint de convite/código
- **Status**: Convite não implementado

### 7. `/perfil` — ProfilePage

- **Frontend**: Mostra dados do usuário, tem botão "Alterar senha" e "Sair"
- **Backend**: `PUT /auth/me/password` funciona, `POST /auth/logout` funciona
- **Dados hardcoded**: Avatar, telefone, "Membro desde", "Último acesso"
- **Backend não tem**: Endpoint para atualizar perfil do usuário (nome, email, avatar)
- **Status**: Parcialmente funcional

### 8. `/categorias` — CategoriesPage

- **Frontend**: Lista categorias do hub (`GET /avaliacoes/hub`), favorita/desfavorita
- **Backend**: Funciona via `ProtocoloHubController`
- **Status**: Funcional

---

## 🟢 Páginas funcionais (100% integradas)

| # | Rota | Frontend | Backend | Status |
|---|------|----------|---------|--------|
| 9 | `/login` | LoginPage | `POST /auth/login` | ✅ |
| 10 | `/register` | RegisterPage | `POST /auth/register` | ✅ |
| 11 | `/avaliacoes` | HubPage | `GET /hub`, `POST/DELETE favoritos` | ✅ |
| 12 | `/avaliacoes/protocolo/:id` | ProtocoloDetailPage | `GET /protocolos/{id}`, `GET /tabelas/{id}` | ✅ |
| 13 | `/clientes` | AlunosPage | `GET/POST /clientes` | ✅ |
| 14 | `/clientes/:id` | ClienteDetailPage | `GET/PUT /clientes/{id}`, `GET /clientes/{id}/avaliacoes` | ✅ |
| 15 | `/avaliacao/vo2max-esteira` | Vo2MaxEsteiraPage | `GET pre-dados`, `POST imc`, `POST vo2max` | ✅ |
| 16 | `/avaliacao/incremental` | AvaliacaoIncrementalPage | `GET clientes`, `POST vo2max` | ✅ |
| 17 | `/minha-academia` | MinhaAcademiaPage | `GET/PUT /auth/me/academia` | ✅ |
| 18 | `/configuracoes` | SettingsPage | Nenhum (só mostram "Versão 1.0.0") | ✅ |

---

## 🔧 Backend: endpoints que existem mas o frontend NÃO usa

| Endpoint Backend | Frontend usa? | Observação |
|------------------|---------------|------------|
| `PUT /auth/me/password` | 🟡 Só no SettingsPage (dialog) | Funcional |
| `GET /auth/me/academia` | ✅ MinhaAcademiaPage | Funcional |
| `PUT /auth/me/academia` | ✅ MinhaAcademiaPage | Funcional |
| `POST /users` | ❌ Nenhuma tela de gestão de usuários | Não usado |
| `GET /academias/{id}` | ❌ | Não usado |
| `GET /academias/by-owner/{ownerId}` | ❌ | Não usado |
| `DELETE /academias/{id}` | ❌ | Não usado |
| `GET /clientes/por-academia/{id}` | ❌ | Não usado |
| `GET /clientes/por-avaliador/{id}` | ❌ | Não usado |
| `POST /clientes/com-imc` | ❌ | Não usado |
| `GET /avaliacoes/{protocoloId}/dados-pre-avaliacao/{id}` | ✅ Vo2MaxEsteiraPage | Funcional |
| `POST /avaliacoes/imc` | ✅ Vo2MaxEsteiraPage (indireto) | Funcional |
| `POST /avaliacoes/vo2max` | ✅ AvaliacaoIncrementalPage + Vo2MaxEsteiraPage | Funcional |
| `GET /tabelas_classificacao` | ❌ | Não usado |
| `GET /tabelas_classificacao/{id}` | ✅ ProtocoloDetailPage | Funcional |

---

## 🔮 Backend: permissões definidas mas sem endpoint

| Permissão | Endpoint necessário | Status |
|-----------|---------------------|--------|
| `CLIENTES_EXCLUIR` | `DELETE /clientes/{id}` | ❌ |
| `AVALIACOES_EXCLUIR` | `DELETE /avaliacoes/{id}` | ❌ |
| `AVALIACOES_ATUALIZAR` | `PUT /avaliacoes/{id}` | ❌ |
| `USUARIOS_LER` | `GET /users`, `GET /users/{id}` | ❌ |
| `USUARIOS_ATUALIZAR` | `PUT /users/{id}` | ❌ |
| `USUARIOS_EXCLUIR` | `DELETE /users/{id}` | ❌ |
| `AVALIADORES_*` | Nenhum endpoint dedicado | ❌ |
| `RELATORIOS_LER` | Nenhum endpoint | ❌ |
| `RELATORIOS_EXPORTAR` | Nenhum endpoint | ❌ |

---

## 🧹 Código morto no backend

| Item | Local | Descrição |
|------|-------|-----------|
| `AvaliacaoFisicaRepository.findFirstByClienteIdAndProtocoloIdOrderByCreatedAtDesc()` | Repository | Método nunca chamado |
| `AcademiaRepository.findByOwnerIdIn(List<String>)` | Repository | Service existe mas nunca é chamado por controller |
| `RoleRepository.findByNome(String)` | Repository | Nunca chamado — roles são buscadas por ID |
| `HistoricoPage` | Frontend `features/historico/` | Componente removido mas barrel ainda exporta |
| `LaudoHeader` | Frontend `features/historico/` | Componente removido |

---

## 📋 Roadmap priorizado

### Prioridade Alta

| # | Item | Frontend | Backend | Esforço |
|---|------|----------|---------|---------|
| 1 | **Dashboard real** — substituir dados mockados por dados reais | HomePage | Criar endpoint de agregação | Médio |
| 2 | **Agenda** — CRUD completo de agendamentos | AgendaPage | Criar entidade `Agendamento` + controller + service | Alto |
| 3 | **Gestão de usuários** — criar, listar, editar, excluir | Nova tela admin | Criar `GET/PUT/DELETE /users` | Alto |
| 4 | **Protocolos além de VO2Max** — criar fluxo para IMC, Bioimpedância, etc. | NovaAvaliacaoPage | Criar handlers para cada protocolo | Alto |

### Prioridade Média

| # | Item | Frontend | Backend | Esforço |
|---|------|----------|---------|---------|
| 5 | **Perfil do usuário** — editar nome, email, avatar | ProfilePage | Criar `PUT /auth/me` | Baixo |
| 6 | **Relatórios/Análises** — dashboard com gráficos e KPIs | AnalysisPage | Criar endpoints de agregação | Alto |
| 7 | **Convite por código** — fluxo de convite para novos membros | OnboardingPage | Criar lógica de convite + endpoint | Médio |
| 8 | **Exclusão** — criar endpoints de DELETE | Botões na UI | Criar `DELETE` para clientes e avaliações | Baixo |

### Prioridade Baixa

| # | Item | Frontend | Backend | Esforço |
|---|------|----------|---------|---------|
| 9 | **Relatórios/Exportação** — exportar dados em PDF/CSV | Botão na UI | Criar endpoints de exportação | Médio |
| 10 | **Gestão de roles** — criar, editar, excluir roles customizadas | Tela admin | Criar CRUD de roles | Baixo |
| 11 | **Notificações** — sistema de notificações em tempo real | Sino no header | Criar entidade + WebSocket/SSE | Alto |
| 12 | **API versioning** — adicionar prefixo `/api/v1/` nos controllers | N/A | Atualizar todos os controllers | Baixo |

---

## 🔍 Busca — onde implementar

### Frontend: páginas que precisam de campo de busca

| Página | Rota | Campo atual | O que falta |
|--------|------|-------------|-------------|
| AlunosPage | `/clientes` | Nenhum | Input de busca por nome/email. Filtrar lista localmente ou via query param `?q=` no backend |
| NovaAvaliacaoPage | `/avaliacao/nova` | Selector de cliente (carrega todos) | Adicionar busca no selector (Combobox ou Input + filtro). Hoje carrega `GET /clientes` inteiro e lista todos |
| AvaliacaoIncrementalPage | `/avaliacao/incremental` | Selector de cliente (carrega todos) | Mesmo caso — busca no selector |
| HubPage | `/avaliacoes` | Nenhum | Input de busca por nome do protocolo. Filtrar por titulo/categoria |
| CategoriesPage | `/categorias` | Nenhum | Input de busca por nome da categoria |
| ClienteDetailPage (Laudo) | `/clientes/:id` | Nenhum na secao "Laudo" | Busca nas avaliacoes por data ou tipo de metrica (avancado) |

### Backend: endpoints que precisam de parametro de busca

| Endpoint | Tipo de busca sugerido | Prioridade |
|----------|----------------------|------------|
| `GET /clientes` | `?q=` — busca por `fullName`, `email`, `cpf` (case-insensitive) | Alta |
| `GET /avaliacoes/protocolos` | `?q=` — busca por `nome`, `categoria` | Media |
| `GET /tabelas_classificacao` | `?q=` — busca por `nome`, `protocolo` | Baixa |
| `GET /avaliacoes/hub` | `?q=` — busca por nome do protocolo dentro do hub | Media |

### Frontend: componentes de busca sugeridos

| Componente | Quando usar | Exemplo |
|------------|-------------|---------|
| `Input` + filtro local | Lista pequena (menos de 50 itens) | Filtro de categorias no HubPage |
| `Combobox` (shadcn) | Selector com busca em lista carregada | Selecao de cliente em Avaliacao |
| `Input` + debounce + query param | Lista grande, busca no backend | AlunosPage com busca por nome |
| `CommandPalette` (shadcn) | Busca global em multiplas entidades | Futura busca global do dashboard |

---

## 📄 Paginação — onde implementar

### Backend: endpoints que retornam listas sem limite

| Endpoint | Retorna | Volume esperado | Precisa paginacao? |
|----------|---------|-----------------|---------------------|
| `GET /clientes` | `List<ClienteResponse>` | 10-500 por academia | Sim |
| `GET /clientes/por-academia/{id}` | `List<ClienteResponse>` | 10-500 | Sim |
| `GET /clientes/por-avaliador/{id}` | `List<ClienteResponse>` | 10-100 | Sim |
| `GET /clientes/{id}/avaliacoes` | `List<AvaliacaoHistoricoResponse>` | 1-50 por cliente | Sim (poucos, mas cresce) |
| `GET /avaliacoes/protocolos` | `List<ProtocoloResumoResponse>` | 5-30 | Nao — poucos itens |
| `GET /avaliacoes/favoritos` | `List<ProtocoloResumoResponse>` | 0-10 | Nao — poucos itens |
| `GET /avaliacoes/hub` | `Map<String, Object>` | 5-30 por categoria | Nao — poucos itens |
| `GET /tabelas_classificacao` | `List<TabelaClassificacaoResponse>` | 3-10 | Nao — poucos itens |
| `GET /academias/by-owner/{ownerId}` | `List<AcademiaResponse>` | 1-5 | Nao — poucos itens |

### Padrao de paginacao sugerido (backend)

```
GET /clientes?page=0&size=20&sort=fullName,asc&q=gabriel

Response:
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 142,
  "totalPages": 8,
  "last": false
}
```

Usar `Pageable` do Spring Data (ja suporta MongoRepository):
```java
Page<ClienteDocument> findByAcademiaId(String academiaId, Pageable pageable);
Page<ClienteDocument> findByFullNameContainingIgnoreCase(String q, Pageable pageable);
```

### Frontend: paginacao por pagina

| Pagina | Rota | Carrega tudo? | Estrategia sugerida |
|--------|------|---------------|---------------------|
| AlunosPage | `/clientes` | Sim — `useQuery` sem limite | Scroll infinito ou botoes Anterior/Proximo. Hook `useInfiniteQuery` do TanStack Query |
| ClienteDetailPage | `/clientes/:id` | Sim — carrega todas avaliacoes | Ja usa `useClienteAvaliacoes` — adicionar `page`/`size` ao hook e backend |
| HubPage | `/avaliacoes` | Sim — carrega todos protocolos | Nao necessita — poucos itens (<30) |
| CategoriesPage | `/categorias` | Sim — carrega todas categorias | Nao necessita — poucos itens |
| HistoricoCards | dentro de `/clientes/:id` | Sim — todas avaliacoes | Ja dentro do detail — listar as 5 mais recentes, "Ver todas" expande |

### Componente de paginacao sugerido (frontend)

Usar componente existente ou criar `Pagination` padrao shadcn:

```
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious onClick={prevPage} disabled={page === 0} />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive>{page + 1}</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext onClick={nextPage} disabled={isLastPage} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

Para listas longas com scroll infinito, usar `useInfiniteQuery`:
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['clientes', academiaId, search],
  queryFn: ({ pageParam = 0 }) => clienteService.listar(academiaId, { page: pageParam, size: 20, q: search }),
  getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
})
```

---

## Inconsistências conhecidas

1. **`GET /auth/me/academia`** retorna `AcademiaDocument` (raw), mas `PUT /auth/me/academia` retorna `AcademiaResponse` (DTO). Padronizar para DTO.
2. **Package `api/v1/`** não reflete a URL real. Endpoints são `/auth`, não `/api/v1/auth`.
3. **`NovaAvaliacaoPage`** tem `PROTOCOLO_RECOMENDADO_ID` hardcoded. Deveria ser dinâmico.
4. **`SettingsPage`** mostra "Versão 1.0.0" hardcoded. Deveria vir do `application.properties` ou actuator.
5. **`ProfilePage`** tem dados hardcoded (avatar, telefone, "Membro desde"). Não há backend para esses dados.
