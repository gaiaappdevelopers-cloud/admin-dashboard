import { apiFetch } from "./client"

export interface Stats {
  total_users: number
  experiences_this_week: number
  research_consents_count: number
}

export const statsApi = {
  get: () => apiFetch<Stats>("/v1/admin/stats"),
}
