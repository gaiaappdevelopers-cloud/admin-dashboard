import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

// Fallbacks only — the real lifetimes come from the backend's response
// (`expires_in` / `refresh_expires_in`) so cookie lifetime always tracks
// JWT_ACCESS_EXPIRES_IN_SECONDS / JWT_REFRESH_EXPIRES_IN_SECONDS server-side.
const ACCESS_TOKEN_MAX_AGE_FALLBACK = 60 * 15       // 15 minutes
const REFRESH_TOKEN_MAX_AGE_FALLBACK = 60 * 60 * 24 * 7 // 7 days

export async function POST(req: NextRequest) {
  const body = await req.json()

  let backendRes: Response
  try {
    backendRes = await fetch(`${BACKEND_URL}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    return NextResponse.json(json as Record<string, unknown>, { status: backendRes.status })
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

  res.cookies.set("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: refresh_expires_in ?? REFRESH_TOKEN_MAX_AGE_FALLBACK,
  })

  return res
}
