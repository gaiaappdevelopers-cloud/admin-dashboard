import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
const ACCESS_TOKEN_MAX_AGE = 60 * 15

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  const backendRes = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `refresh_token=${refreshToken}` },
  })

  const json = await backendRes.json()

  if (!backendRes.ok) {
    const res = NextResponse.json(json, { status: backendRes.status })
    res.cookies.delete("access_token")
    res.cookies.delete("refresh_token")
    return res
  }

  const { access_token } = json.data

  const res = NextResponse.json({ ok: true })
  res.cookies.set("access_token", access_token, {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  return res
}
