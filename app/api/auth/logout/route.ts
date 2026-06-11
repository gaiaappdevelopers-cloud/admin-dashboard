import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value

  if (refreshToken) {
    await fetch(`${BACKEND_URL}/v1/auth/logout`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    }).catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete("access_token")
  res.cookies.delete("refresh_token")
  return res
}
