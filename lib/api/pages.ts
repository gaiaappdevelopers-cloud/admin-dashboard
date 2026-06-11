import { apiFetch } from "./client"

export type PageLanguage = "pt" | "en"

export interface Page {
  page_key: string
  language: PageLanguage
  title: string
  html_content?: string
  created_at: string
  updated_at: string
}

export interface CreatePagePayload {
  page_key: string
  language?: PageLanguage
  title: string
  html_content: string
}

export interface UpdatePagePayload {
  language?: PageLanguage
  title?: string
  html_content?: string
}

export const pagesApi = {
  list: () =>
    apiFetch<Page[]>("/v1/admin/pages"),

  get: (pageKey: string, language: PageLanguage) =>
    apiFetch<Page>(`/v1/admin/pages/${pageKey}?language=${language}`),

  create: (payload: CreatePagePayload) =>
    apiFetch<Page>("/v1/admin/pages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (pageKey: string, payload: UpdatePagePayload) =>
    apiFetch<Page>(`/v1/admin/pages/${pageKey}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (pageKey: string, language: PageLanguage) =>
    apiFetch<void>(`/v1/admin/pages/${pageKey}?language=${language}`, {
      method: "DELETE",
    }),
}
