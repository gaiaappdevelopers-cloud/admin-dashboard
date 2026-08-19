"use client"

import { useRouter } from "next/navigation"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const router = useRouter()

  function handleSuccess() {
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1
            className="text-9xl font-medium tracking-wide text-foreground"
            style={{ fontFamily: "var(--font-wordmark)" }}
          >
            GAIA
          </h1>
          <p className="text-sm -mt-2 text-muted-foreground">Painel Administrativo</p>
        </div>

        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
