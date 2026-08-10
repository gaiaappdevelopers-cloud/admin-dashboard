import { apiFetch } from "./client"

export interface SchemaVersion {
  id: string
  schema_key: string
  schema_version: number
  schema_hash: string
  is_active: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface SchemaVersionDetail extends SchemaVersion {
  sections: unknown[]
}

export interface CreateSchemaPayload {
  schema_key: string
  sections: unknown[]
}

export interface UpdateSchemaPayload {
  sections: unknown[]
}

export const schemasApi = {
  list: () =>
    apiFetch<SchemaVersion[]>("/v1/admin/schemas"),

  listByKey: (schemaKey: string) =>
    apiFetch<SchemaVersion[]>(`/v1/admin/schemas/${schemaKey}`),

  getVersion: (schemaKey: string, version: number) =>
    apiFetch<SchemaVersionDetail>(`/v1/admin/schemas/${schemaKey}/${version}`),

  create: (payload: CreateSchemaPayload) =>
    apiFetch<SchemaVersion>("/v1/admin/schemas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateVersion: (schemaKey: string, version: number, payload: UpdateSchemaPayload) =>
    apiFetch<SchemaVersionDetail>(`/v1/admin/schemas/${schemaKey}/${version}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  publish: (key: string, version: number) =>
    apiFetch<SchemaVersion>(`/v1/admin/schemas/${key}/${version}/publish`, {
      method: "POST",
    }),

  delete: (key: string, version: number) =>
    apiFetch<void>(`/v1/admin/schemas/${key}/${version}`, {
      method: "DELETE",
    }),
}
