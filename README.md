# Gaia Admin

Painel administrativo (CMS) do Gaia — Next.js consumindo a API do `gaia-backend`. Interface em PT-BR, pensada para um admin não-técnico: nada de editor de JSON cru nas telas de formulário.

## Stack

- Next.js (App Router) + TypeScript
- shadcn/ui + Tailwind
- TanStack Query (estado de servidor)
- Zustand (estado de UI)
- React Hook Form + Zod
- TipTap (editor rich text de Páginas/Blog)

## Arquitetura

Por entidade, o padrão é:

- `lib/api/<entidade>.ts` — funções de fetch tipadas
- `hooks/use-<entidade>.ts` — hooks TanStack Query (`useX`, `useCreateX`, `useUpdateX`, `useDeleteX`)
- `app/(admin)/<entidade>/page.tsx` + `_components/` — tela e formulários

Principais pastas:

- `app/(admin)/` — todas as telas autenticadas (sidebar + guard)
- `app/(auth)/login/` — tela de login
- `app/api/auth/` — route handlers que fazem a ponte com o backend e escrevem os cookies (ver Autenticação)
- `lib/api/client.ts` — fetch wrapper único: injeta o Bearer token, faz retry automático em 401 via refresh, redireciona pro login se o refresh falhar
- `lib/schema-model.ts` — tipos e helpers do modelo de Schema (sections/fields), usados pelo editor visual em `app/(admin)/schemas/`
- `proxy.ts` — middleware de rota (Next 16 renomeou `middleware.ts` para `proxy.ts` — ver `AGENTS.md` antes de mexer em convenções de roteamento)

## Autenticação

- Login via `POST /api/auth/login` (route handler) → chama o backend → grava `access_token` e `refresh_token` em cookies.
- `access_token` não é httpOnly (o client-side precisa lê-lo para montar o header `Authorization`); `refresh_token` é o que o middleware usa pra decidir se a sessão está ativa.
- `apiFetch` (`lib/api/client.ts`) tenta a chamada, e se vier 401 chama `/api/auth/refresh` uma vez; se o refresh falhar, redireciona para `/login`.
- `proxy.ts` protege todas as rotas exceto `/login`: sem `refresh_token`, redireciona pro login; autenticado tentando acessar `/login`, redireciona pro dashboard.

## Padrão de resposta da API

O backend sempre responde `{ data: ... }` em sucesso ou `{ error: { code, message, details } }` em erro — `apiFetch` já desembrulha isso e lança `ApiError` nos casos de erro.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Requer o `gaia-backend` rodando (padrão `http://localhost:3000`) — ver `NEXT_PUBLIC_API_URL` no `.env.local`.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build       # build de produção
npm run start        # roda o build
npm run lint          # eslint
npm run format       # prettier
npm run typecheck   # tsc --noEmit
```

## Áreas do painel

Conectadas à API real:

- **Schemas** (`/schemas`) — editor visual dos formulários dinâmicos (sections/fields/complementary fields), versionamento com publish/draft. Ver observações abaixo.
- **Tipos de Experiência** (`/experience-types`) — CRUD + reorder por drag-and-drop + follow-up.
- **Páginas** (`/pages`) — conteúdo estático (Termos de Uso etc.), variantes por idioma.
- **Blog** (`/blog-posts`) — posts com fluxo draft/publicado.
- **Dashboard** (`/dashboard`) — métricas reais + funil de Leads (ainda mockado, ver abaixo).

Ainda em dados de exemplo (mock), aguardando modelagem no backend:

- **Leads**, **Profissionais**, **Estabelecimentos** — telas completas na UI, mas sem endpoint real ainda.

## Observações importantes

- **`schema_key` / `section_key` / `field_key` / `page_key` devem ser `snake_case`** — validado no front (`lib/schema-model.ts` exporta `SNAKE_CASE_KEY_PATTERN`/`isValidKey`, reaproveitado em todos os formulários que têm chave).
- **Versão de Schema já publicada é imutável para sempre** — mesmo depois de superada por uma versão mais nova. Só é possível editar in-place (`PUT`) uma versão que nunca foi publicada. Motivo: respostas antigas de Experience/FollowUp precisam conseguir reinterpretar a definição original. Detalhes no ADR `gaia-backend/docs/adr/0001-schema-version-immutability.md`.
- **Sem lib de i18n** — os textos estão direto em PT-BR no código (decisão deliberada: painel de idioma único, sem necessidade de alternar EN/PT na interface administrativa).
- `@monaco-editor/react` ainda é dependência do projeto mas não é mais usado — o editor de Schemas passou a ser 100% visual. Candidato a remoção numa limpeza futura.
- Pendências que dependem do dev mobile (ícones aceitos pelo app Flutter, uso real do `PaiPlan`, etc.) estão documentadas em `gaia-backend/docs/pending-questions.md`, não aqui — esse repo não é o que ele acompanha.

## Deploy

Vercel. Configurar `NEXT_PUBLIC_API_URL` apontando para a URL pública do `gaia-backend` (ver `gaia-backend/docs/deployment.md` para o deploy do backend na Railway).
