import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const ACCESS_TOKEN_MAX_AGE = 60 * 15

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  let backendRes: Response
  try {
    backendRes = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
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

  const { access_token } = (json as { data: { access_token: string } }).data

  const res = NextResponse.json({ ok: true })
  res.cookies.set("access_token", access_token, {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  return res
}
