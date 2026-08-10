"use client"

import { useState } from "react"
import { ChevronDown, Plus, Upload, Trash2, AlertCircle, CheckCircle2, Pencil } from "lucide-react"

import type { SchemaVersion } from "@/lib/api/schemas"
import { useSchemas, usePublishSchema, useDeleteSchema } from "@/hooks/use-schemas"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { NewVersionDialog } from "./_components/new-version-dialog"

type ConfirmAction =
  | { type: "publish"; version: SchemaVersion }
  | { type: "delete"; version: SchemaVersion }

function groupByKey(versions: SchemaVersion[]): Record<string, SchemaVersion[]> {
  return versions.reduce<Record<string, SchemaVersion[]>>((acc, v) => {
    if (!acc[v.schema_key]) acc[v.schema_key] = []
    acc[v.schema_key].push(v)
    return acc
  }, {})
}

export default function SchemasPage() {
  const { data, isLoading, isError } = useSchemas()
  const publish = usePublishSchema()
  const deleteSchema = useDeleteSchema()

  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newDialogKey, setNewDialogKey] = useState("")
  const [editVersion, setEditVersion] = useState<{ schemaKey: string; version: number } | null>(
    null
  )
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const grouped = groupByKey(data ?? [])
  const keys = Object.keys(grouped).sort()

  function handleConfirm() {
    if (!confirmAction) return
    if (confirmAction.type === "publish") {
      publish.mutate({
        key: confirmAction.version.schema_key,
        version: confirmAction.version.schema_version,
      })
    } else {
      deleteSchema.mutate({
        key: confirmAction.version.schema_key,
        version: confirmAction.version.schema_version,
      })
    }
    setConfirmAction(null)
  }

  function openNewForKey(key: string) {
    setNewDialogKey(key)
    setNewDialogOpen(true)
  }

  return (
    <>
      <TopBar title="Formulários" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {keys.length > 0 ? `${keys.length} formulário${keys.length === 1 ? "" : "s"}` : ""}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setNewDialogKey("")
              setNewDialogOpen(true)
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nova versão
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Falha ao carregar os formulários.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => {
              const versions = [...grouped[key]].sort((a, b) => b.schema_version - a.schema_version)
              const publishedVersion = versions.find((v) => v.is_active)

              return (
                <Collapsible key={key} defaultOpen>
                  <div className="rounded-lg border">
                    <div className="flex items-center justify-between pr-2">
                      <CollapsibleTrigger className="flex flex-1 items-center gap-3 p-4 text-left hover:bg-muted/50">
                        <code className="text-sm font-medium">{key}</code>
                        {publishedVersion && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            v{publishedVersion.schema_version} publicada
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {versions.length} {versions.length === 1 ? "versão" : "versões"}
                        </span>
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform in-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => openNewForKey(key)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Nova versão
                      </Button>
                    </div>

                    <CollapsibleContent>
                      <div className="divide-y border-t">
                        {versions.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between px-4 py-3"
                          >
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
                                    setEditVersion({
                                      schemaKey: v.schema_key,
                                      version: v.schema_version,
                                    })
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
                                    onClick={() =>
                                      setConfirmAction({ type: "publish", version: v })
                                    }
                                  >
                                    <Upload className="mr-1 h-3 w-3" />
                                    Publicar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setConfirmAction({ type: "delete", version: v })
                                    }
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
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
      </main>

      <NewVersionDialog
        key={`new-${newDialogOpen}-${newDialogKey}`}
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        defaultSchemaKey={newDialogKey}
      />

      <NewVersionDialog
        key={`edit-${editVersion?.schemaKey}-${editVersion?.version}`}
        open={!!editVersion}
        onOpenChange={(open) => !open && setEditVersion(null)}
        editVersion={editVersion ?? undefined}
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
                ? `Isso vai tornar a v${confirmAction.version.schema_version} de "${confirmAction.version.schema_key}" a versão ativa. O app mobile vai usar essa versão em todas as novas Experiências.`
                : `Isso vai excluir permanentemente a v${confirmAction?.version.schema_version} de "${confirmAction?.version.schema_key}". Essa ação não pode ser desfeita.`}
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
