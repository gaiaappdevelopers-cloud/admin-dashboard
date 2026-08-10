"use client"

import { useState } from "react"
import { Plus, Upload, Trash2, Pencil, AlertCircle, CheckCircle2, Info } from "lucide-react"

import type { SchemaVersion } from "@/lib/api/schemas"
import { PAI_PLAN_SCHEMA_KEY } from "@/lib/schema-model"
import { useSchemas, usePublishSchema, useDeleteSchema } from "@/hooks/use-schemas"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NewVersionDialog } from "../schemas/_components/new-version-dialog"

type ConfirmAction =
  | { type: "publish"; version: SchemaVersion }
  | { type: "delete"; version: SchemaVersion }

export default function PaiPage() {
  const { data, isLoading, isError } = useSchemas()
  const publish = usePublishSchema()
  const deleteSchema = useDeleteSchema()

  const [formOpen, setFormOpen] = useState(false)
  const [editVersion, setEditVersion] = useState<{ schemaKey: string; version: number } | null>(
    null
  )
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const versions = (data ?? [])
    .filter((v) => v.schema_key === PAI_PLAN_SCHEMA_KEY)
    .sort((a, b) => b.schema_version - a.schema_version)
  const publishedVersion = versions.find((v) => v.is_active)

  function handleConfirm() {
    if (!confirmAction) return
    if (confirmAction.type === "publish") {
      publish.mutate({ key: PAI_PLAN_SCHEMA_KEY, version: confirmAction.version.schema_version })
    } else {
      deleteSchema.mutate({ key: PAI_PLAN_SCHEMA_KEY, version: confirmAction.version.schema_version })
    }
    setConfirmAction(null)
  }

  return (
    <>
      <TopBar title="PAI" />
      <main className="p-6">
        <div className="mb-4 flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            Aqui você organiza as <strong>perguntas</strong> do Plano de Ação de Integração
            (PAI) — o formulário que o usuário preenche depois de registrar uma
            Experiência. Assim como nos outros formulários, você nunca vê as respostas
            que os usuários escrevem, só o modelo de perguntas.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {publishedVersion && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                v{publishedVersion.schema_version} publicada
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              {versions.length > 0
                ? `${versions.length} ${versions.length === 1 ? "versão" : "versões"}`
                : "Nenhuma versão criada ainda"}
            </p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)} className="flex items-center py-3 gap-1.5 leading-tight text-sm">
            <Plus className="h-5 w-5" />
            Nova versão
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Falha ao carregar o formulário do PAI.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          !isError && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhuma versão do formulário de PAI foi criada ainda. Comece criando a
              primeira versão.
            </div>
          )
        ) : (
          <div className="divide-y rounded-lg border">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    v{v.schema_version}
                  </span>
                  {v.is_active ? (
                    <Badge className="gap-1 bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Publicada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Rascunho
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {!v.is_active && !v.published_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        setEditVersion({ schemaKey: PAI_PLAN_SCHEMA_KEY, version: v.schema_version })
                      }
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                  )}
                  {!v.is_active && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setConfirmAction({ type: "publish", version: v })}
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        Publicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => setConfirmAction({ type: "delete", version: v })}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <NewVersionDialog
        key={`new-${formOpen}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        fixedSchemaKey={PAI_PLAN_SCHEMA_KEY}
      />

      <NewVersionDialog
        key={`edit-${editVersion?.version}`}
        open={!!editVersion}
        onOpenChange={(open) => !open && setEditVersion(null)}
        editVersion={editVersion ?? undefined}
        fixedSchemaKey={PAI_PLAN_SCHEMA_KEY}
      />

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "publish"
                ? `Publicar v${confirmAction.version.schema_version}?`
                : `Excluir v${confirmAction?.version.schema_version}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "publish"
                ? `Isso vai tornar a v${confirmAction.version.schema_version} do PAI a versão ativa. O app mobile vai usar essa versão em todos os novos planos criados pelos usuários.`
                : `Isso vai excluir permanentemente a v${confirmAction?.version.schema_version} do PAI. Essa ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmAction?.type === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
              onClick={handleConfirm}
            >
              {confirmAction?.type === "publish" ? "Publicar" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
