import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

const ACCESS_TOKEN_MAX_AGE = 60 * 15       // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(req: NextRequest) {
  const body = await req.json()

  const backendRes = await fetch(`${BACKEND_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await backendRes.json()

  if (!backendRes.ok) {
    return NextResponse.json(json, { status: backendRes.status })
  }

  const { access_token, refresh_token } = json.data

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
