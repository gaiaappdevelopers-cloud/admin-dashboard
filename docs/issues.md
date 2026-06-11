# Issues

Work items for the GAIA admin panel. Strike through as completed.

---

## Issue 1: Setup — API layer, TanStack Query & Zustand

**Title:** `setup: API layer, TanStack Query, and Zustand store`

Foundation layer that all CRUD screens depend on.

**Tasks**
- [x] Install TanStack Query and create `lib/query-client.ts`
- [x] Wrap the admin layout with `QueryClientProvider`
- [x] Create `lib/api/` with typed fetch functions for each entity:
  - `auth.ts` — login, refresh, logout
  - `schemas.ts`
  - `pages.ts`
  - `experience-types.ts`
  - `blog-posts.ts`
  - `stats.ts`
- [x] Create `store/ui.store.ts` with Zustand for sidebar and modal state
- [x] All fetchers must read `NEXT_PUBLIC_API_URL` and attach `Authorization: Bearer <token>`

---

## Issue 2: Auth — Login, httpOnly cookie & route protection

**Title:** `feat: authentication — login page, JWT cookies, route middleware`

Full auth flow: login form → JWT stored in httpOnly cookie → protected routes.

**Tasks**
- [x] Build `/login` page with email/password form
- [x] Create `app/api/auth/` route handlers:
  - `POST /api/auth/login` — calls backend, sets httpOnly access + refresh cookies
  - `POST /api/auth/logout` — clears cookies
  - `POST /api/auth/refresh` — calls backend refresh, rotates cookies
- [x] Create `middleware.ts` at the root — redirect unauthenticated requests to `/login`, redirect authenticated users away from `/login`
- [x] Wire up automatic access token refresh when a 401 is returned

---

## Issue 3: Dashboard — Wire up real stats

**Title:** `feat: dashboard — connect stats cards to real API`

Replace hardcoded values in the dashboard cards with live data from the stats endpoint.

**Tasks**
- [x] Fetch `GET /v1/admin/stats` using TanStack Query
- [x] Map response fields to cards: `total_users`, `experiences_this_week`, `research_consents_count`
- [x] Add loading skeletons while fetching
- [x] Add error state if the request fails

---

## Issue 4: Experience Types — List, CRUD, toggle & reorder

**Title:** `feat: experience types — list, create/edit, active toggle, drag-and-drop reorder`

Full management of ExperienceTypes including quick-toggle and drag-and-drop ordering.

**Tasks**
- [x] List all experience types with all fields visible
- [x] Quick toggle `is_active` directly from the list (single PATCH call)
- [x] Drag-and-drop reorder — on drop, send one PUT per affected record with updated `display_order`
- [x] Create / edit form with fields: `title`, `description`, `schema_key`, `icon` (fixed key list), `icon_color` (hex picker), `is_suggested`, `is_active`, `display_order`
- [x] Delete with confirmation dialog (hard delete)

---

## Issue 5: Schemas — List, publish/delete, create new version

**Title:** `feat: schemas — versioned list, publish, delete draft, create new version`

Schema management with versioning — list grouped by schema_key, publish/delete versions, create new versions.

**Tasks**
- [x] List all schemas grouped by `schema_key`, showing all versions and which is published
- [x] "Publish" button per version — requires confirmation before calling `/publish`
- [x] "Delete" button only shown for unpublished versions — hard delete with confirmation
- [x] "New version" form with `schema_key` field and `sections` JSON editor (Monaco or similar)

---

## Issue 6: Pages — List, create/edit with HTML editor & language variants

**Title:** `feat: pages — list, create/edit with rich HTML editor, pt/en language support`

Content page management with rich HTML editing and per-language variants.

**Tasks**
- [x] List all pages showing `page_key`, `language`, `title`
- [x] Create / edit form with `page_key`, `title`, `language` selector (pt / en), `html_content` (TipTap)
- [x] Deleting a page variant removes only that language — other variants unaffected
- [x] Show both language variants for the same `page_key` in the list

---

## Issue 7: Blog Posts — List, editor, publish/unpublish

**Title:** `feat: blog posts — list, create/edit with rich editor, publish/unpublish flow`

Full blog post management with draft/published lifecycle and rich text editing.

**Tasks**
- [x] List with filter tabs: All / Published / Draft
- [x] Create / edit page with two tabs: **Edit** (TipTap + `title`, `language`, `published_at`) and **Preview** (rendered HTML)
- [x] "Publish" button calls `POST /:id/publish` — only shown on Draft posts
- [x] "Unpublish" button calls `POST /:id/unpublish` — only shown on Published posts
- [x] Delete with confirmation dialog (hard delete, no undo)
- [x] `status` never edited directly — only changed via publish/unpublish actions
