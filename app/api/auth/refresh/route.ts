import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
// Fallbacks only — see app/api/auth/login/route.ts.
const ACCESS_TOKEN_MAX_AGE_FALLBACK = 60 * 15
const REFRESH_TOKEN_MAX_AGE_FALLBACK = 60 * 60 * 24 * 7

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  let backendRes: Response
  try {
    // The backend reads refresh_token from the request body (RefreshTokenDto),
    // not from cookies — it has no cookie-parsing of its own.
    backendRes = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  } catch {
    return NextResponse.json(
      { error: { code: "BACKEND_UNREACHABLE", message: `Não foi possível conectar em ${BACKEND_URL}. Confira a variável NEXT_PUBLIC_API_URL.` } },
      { status: 502 }
    )
  }

  let json: unknown
  try {
    json = await backendRes.json()
  } catch {
    return NextResponse.json(
      { error: { code: "BACKEND_INVALID_RESPONSE", message: `O backend respondeu algo que não é JSON (status ${backendRes.status}).` } },
      { status: 502 }
    )
  }

  if (!backendRes.ok) {
    const res = NextResponse.json(json as Record<string, unknown>, { status: backendRes.status })
    res.cookies.delete("access_token")
    res.cookies.delete("refresh_token")
    return res
  }

  const { access_token, refresh_token, expires_in, refresh_expires_in } = (
    json as {
      data: {
        access_token: string
        refresh_token: string
        expires_in?: number
        refresh_expires_in?: number
      }
    }
  ).data

  const res = NextResponse.json({ ok: true })

  res.cookies.set("access_token", access_token, {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: expires_in ?? ACCESS_TOKEN_MAX_AGE_FALLBACK,
  })

  // The backend rotates the refresh token on every refresh — the old cookie
  // value is invalidated server-side the moment this response is issued, so
  // it must be persisted here or the *next* refresh will always fail.
  res.cookies.set("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: refresh_expires_in ?? REFRESH_TOKEN_MAX_AGE_FALLBACK,
  })

  return res
}
