import { requestReauth } from "@/store/session.store"

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Shared by every concurrent caller so a burst of 401s (e.g. several queries
// refetching at once after the tab regains focus) triggers a single refresh
// call instead of racing the backend's single-refresh-token-per-account
// rotation (see gaia-admin/docs/adr/0001-session-recovery-in-place-reauth.md).
let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", { method: "POST" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  retry = true
): Promise<T> {
  const token = getAccessToken()

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiFetch<T>(path, init, false)
    }

    // Refresh failed — instead of a hard redirect (which would tear down
    // whatever the admin has unsaved on the current page), surface an
    // in-place re-auth modal and retry once they log back in.
    const reauthed = await requestReauth()
    if (reauthed) {
      return apiFetch<T>(path, init, false)
    }
    throw new ApiError("UNAUTHORIZED", "Session expired")
  }

  const json = await res.json()

  if (!res.ok) {
    throw new ApiError(
      json.error?.code ?? "UNKNOWN_ERROR",
      json.error?.message ?? "Request failed",
      json.error?.details
    )
  }

  return json.data as T
}
