export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error?.message ?? "Login failed")
    }
  },

  logout: async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" })
  },
}
