"use client"

import { useSessionStore, resolveReauth } from "@/store/session.store"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/**
 * Mounted once at the admin layout level. Pops up over whatever page the
 * admin is on when a request's session refresh fails, instead of redirecting
 * to /login and discarding unsaved page state.
 */
export function SessionExpiredModal() {
  const isExpired = useSessionStore((s) => s.isExpired)

  return (
    <Dialog open={isExpired} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Sessão expirada</DialogTitle>
          <DialogDescription>
            Faça login novamente para continuar de onde parou — o que você estava editando
            nesta página não será perdido.
          </DialogDescription>
        </DialogHeader>

        <LoginForm onSuccess={() => resolveReauth(true)} />

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs text-muted-foreground"
          onClick={() => {
            resolveReauth(false)
            window.location.href = "/login"
          }}
        >
          Sair e ir para a tela de login
        </Button>
      </DialogContent>
    </Dialog>
  )
}
