# Contexto: Frontend Admin (gaia-admin)

Este documento existe para dar contexto a uma nova sessão sobre o desenvolvimento do painel admin do GAIA. Leia antes de escrever qualquer código.

---

## O que é este projeto

Painel web (Next.js) para gerenciar o conteúdo do app Flutter GAIA — um app de diário espiritual/contemplativo. O painel consome a API REST do `gaia-backend` com autenticação JWT de uma conta com `ProfileType.ADMIN`.

---

## Stack Definida

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: shadcn/ui + Tailwind CSS
- **Fetch / Server state**: TanStack Query (React Query)
- **Client state (UI)**: Zustand (sidebar, modais, etc.)
- **Auth**: JWT armazenado em cookie httpOnly (access token + refresh token)

---

## Backend disponível

Base URL: configurável via `NEXT_PUBLIC_API_URL` (ex: `http://localhost:3000`)

Todos os endpoints exigem `Authorization: Bearer <access_token>`, exceto o login.

### Auth
| Método | Rota | Body |
|---|---|---|
| POST | `/v1/auth/login` | `{ email, password }` |
| POST | `/v1/auth/refresh` | cookie com refresh token |
| POST | `/v1/auth/logout` | — |

### Admin — Formulários Dinâmicos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/schemas` | Lista todos os schemas (todas as versões) |
| GET | `/v1/admin/schemas/:schemaKey` | Lista versões de um schemaKey |
| POST | `/v1/admin/schemas` | Cria nova versão (`{ schema_key, sections[] }`) |
| POST | `/v1/admin/schemas/:key/:version/publish` | Publica uma versão |
| DELETE | `/v1/admin/schemas/:key/:version` | Remove versão não publicada |

### Admin — Páginas de Conteúdo
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/pages` | Lista todas as páginas |
| GET | `/v1/admin/pages/:pageKey?language=pt` | Detalhe com HTML |
| POST | `/v1/admin/pages` | Cria página (`{ page_key, language?, title, html_content }`) |
| PUT | `/v1/admin/pages/:pageKey` | Atualiza (`{ language?, title, html_content }`) |
| DELETE | `/v1/admin/pages/:pageKey?language=pt` | Remove |

### Admin — Tipos de Experiência
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/experience-types` | Lista todos |
| POST | `/v1/admin/experience-types` | Cria (`{ schema_key, title, description, icon, icon_color, is_suggested?, display_order?, is_active? }`) |
| PUT | `/v1/admin/experience-types/:id` | Atualiza (patch parcial) |
| DELETE | `/v1/admin/experience-types/:id` | Remove |

### Admin — Blog Posts
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/blog-posts?status=DRAFT\|PUBLISHED` | Lista todos (filtro por status opcional) |
| GET | `/v1/admin/blog-posts/:id` | Detalhe com conteúdo completo |
| POST | `/v1/admin/blog-posts` | Cria (`{ title, content, status?, language?, published_at? }`) |
| PUT | `/v1/admin/blog-posts/:id` | Atualiza (patch parcial — mesmos campos, exceto `status`) |
| POST | `/v1/admin/blog-posts/:id/publish` | Promove `DRAFT → PUBLISHED`, define `published_at` se ausente |
| POST | `/v1/admin/blog-posts/:id/unpublish` | Reverte `PUBLISHED → DRAFT` |
| DELETE | `/v1/admin/blog-posts/:id` | Remove (hard delete) |

Campos retornados: `id`, `title`, `content`, `status`, `language`, `published_at`, `created_at`, `updated_at`.

### Admin — Stats (Dashboard)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/stats` | Métricas do dashboard |

Resposta:
```json
{
  "data": {
    "total_users": 42,
    "experiences_this_week": 7,
    "research_consents_count": 0
  }
}
```
> `research_consents_count` é sempre `0` por ora — feature de consentimento para pesquisas com universidades ainda não implementada.

### Padrão de resposta da API
```json
// sucesso
{ "data": { ... } }

// erro
{ "error": { "code": "STRING_CODE", "message": "Mensagem legível", "details": {} } }
```

---

## O que precisa ser construído

### 1. Auth
- Tela de login (`/login`)
- Armazenamento do token em cookie httpOnly via route handler Next.js
- Middleware de proteção de rotas — redireciona para `/login` se não autenticado
- Refresh automático do access token quando expirado

### 2. Área de Schemas (`/schemas`)
- Listagem agrupada por `schemaKey`, mostrando todas as versões e qual está ativa
- Botão "Publicar" por versão (com confirmação)
- Botão "Excluir" apenas para versões não publicadas
- Formulário de criação de nova versão:
  - Campo `schema_key`
  - Editor do array `sections` — a definir se será visual ou editor JSON (ex: Monaco Editor)

### 3. Área de Páginas (`/pages`)
- Listagem de páginas com `pageKey`, `language`, `title`
- Formulário de criação/edição com editor HTML rico (ex: TipTap)
- Suporte a múltiplos idiomas por `pageKey`

### 4. Área de Tipos de Experiência (`/experience-types`)
- Listagem com todos os campos
- Formulário de criação/edição
- Toggle rápido de `is_active` na listagem
- Reordenação via drag-and-drop para `display_order`

### 5. Área de Blog Posts (`/blog-posts`)
- Listagem com filtro por status (`DRAFT` / `PUBLISHED`)
- Formulário de criação/edição com editor de conteúdo rico (ex: TipTap)
- Suporte a múltiplos idiomas via campo `language`
- Botão "Publicar" (chama `/publish`) e "Despublicar" (chama `/unpublish`) — sem edição direta do `status`
- Hard delete com confirmação

### 6. Dashboard (`/`) — cards de métricas
- Consome `GET /v1/admin/stats`
- Cards: Total de Usuários, Experiências esta semana, Consentimentos de Pesquisa
- `research_consents_count` exibe `0` com tooltip explicando que a feature ainda não está ativa

---

## Estrutura de pastas sugerida

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (admin)/
│   │   ├── layout.tsx          # sidebar + auth guard
│   │   ├── page.tsx            # dashboard com cards de stats
│   │   ├── schemas/
│   │   ├── pages/
│   │   ├── experience-types/
│   │   └── blog-posts/
│   └── api/
│       └── auth/               # route handlers para cookie httpOnly
├── lib/
│   ├── api/                    # funções de fetch tipadas por entidade
│   └── query-client.ts
├── components/
│   └── ui/                     # shadcn/ui components
└── store/
    └── ui.store.ts             # Zustand para estado de UI
```

---

## Observações importantes

- O campo `sections` dos schemas é um array JSON aceito em camelCase ou snake_case — o backend normaliza automaticamente
- `display_order` dos tipos de experiência controla a ordem de exibição no app mobile
- Soft delete **não existe** para schemas, páginas e tipos de experiência — o DELETE é físico
- O backend roda em NestJS na porta 3000 por padrão