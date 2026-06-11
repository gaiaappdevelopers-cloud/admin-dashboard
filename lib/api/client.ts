const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch("/api/auth/refresh", { method: "POST" })
  return res.ok
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
    window.location.href = "/login"
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
