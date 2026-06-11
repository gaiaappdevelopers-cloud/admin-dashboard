import { apiFetch } from "./client"
import type { PageLanguage } from "./pages"

export type BlogPostStatus = "DRAFT" | "PUBLISHED"

export interface BlogPost {
  id: string
  title: string
  content: string
  status: BlogPostStatus
  language: PageLanguage
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateBlogPostPayload {
  title: string
  content: string
  status?: BlogPostStatus
  language?: PageLanguage
  published_at?: string
}

export type UpdateBlogPostPayload = Partial<Omit<CreateBlogPostPayload, "status">>

export const blogPostsApi = {
  list: (status?: BlogPostStatus) =>
    apiFetch<BlogPost[]>(`/v1/admin/blog-posts${status ? `?status=${status}` : ""}`),

  get: (id: string) =>
    apiFetch<BlogPost>(`/v1/admin/blog-posts/${id}`),

  create: (payload: CreateBlogPostPayload) =>
    apiFetch<BlogPost>("/v1/admin/blog-posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateBlogPostPayload) =>
    apiFetch<BlogPost>(`/v1/admin/blog-posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  publish: (id: string) =>
    apiFetch<BlogPost>(`/v1/admin/blog-posts/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    apiFetch<BlogPost>(`/v1/admin/blog-posts/${id}/unpublish`, { method: "POST" }),

  delete: (id: string) =>
    apiFetch<void>(`/v1/admin/blog-posts/${id}`, { method: "DELETE" }),
}
