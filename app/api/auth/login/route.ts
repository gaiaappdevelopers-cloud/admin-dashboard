import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

const ACCESS_TOKEN_MAX_AGE = 60 * 15       // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

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

  const { access_token, refresh_token } = (json as { data: { access_token: string; refresh_token: string } }).data

  const res = NextResponse.json({ ok: true })

  res.cookies.set("access_token", access_token, {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  res.cookies.set("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })

  return res
}
