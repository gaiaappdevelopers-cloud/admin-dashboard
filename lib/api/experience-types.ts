import { apiFetch } from "./client"

export interface ExperienceType {
  id: string
  schema_key: string
  title: string
  description: string
  icon: string
  icon_color: string
  is_suggested: boolean
  display_order: number
  is_active: boolean
  supports_follow_up: boolean
  follow_up_schema_key: string | null
  created_at: string
  updated_at: string
}

export interface CreateExperienceTypePayload {
  schema_key: string
  title: string
  description: string
  icon: string
  icon_color: string
  is_suggested?: boolean
  display_order?: number
  is_active?: boolean
  supports_follow_up?: boolean
  follow_up_schema_key?: string | null
}

export type UpdateExperienceTypePayload = Partial<Omit<CreateExperienceTypePayload, "schema_key">>

export const experienceTypesApi = {
  list: () =>
    apiFetch<ExperienceType[]>("/v1/admin/experience-types"),

  create: (payload: CreateExperienceTypePayload) =>
    apiFetch<ExperienceType>("/v1/admin/experience-types", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateExperienceTypePayload) =>
    apiFetch<ExperienceType>(`/v1/admin/experience-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/v1/admin/experience-types/${id}`, {
      method: "DELETE",
    }),
}
