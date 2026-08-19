"use client"

import { useState } from "react"

import { useSchemaVersion, useCreateSchema } from "@/hooks/use-schemas"
import { isValidKey } from "@/lib/schema-model"
import { ComboboxInput } from "@/components/combobox-input"
import { LabelWithHint } from "@/components/label-with-hint"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DuplicateSource {
  schemaKey: string
  version: number
}

interface DuplicateVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: DuplicateSource | null
  /** Known schema_keys across the system, offered as suggestions for the target. */
  existingKeys: string[]
  onDuplicated?: (newKey: string) => void
}

/**
 * Copies a version's sections into a brand-new draft under a different
 * schema_key. Used to correct a version created under the wrong key —
 * without touching the original (which may already be published and thus
 * immutable) and without any risk of colliding with other versions under
 * that key, since it always lands as a fresh key rather than editing one
 * in place. See gaia-backend/docs/adr/0002-schema-key-correction-via-duplication.md.
 */
export function DuplicateVersionDialog({
  open,
  onOpenChange,
  source,
  existingKeys,
  onDuplicated,
}: DuplicateVersionDialogProps) {
  const [targetKey, setTargetKey] = useState("")
  const [showErrors, setShowErrors] = useState(false)

  const { data: versionDetail, isLoading } = useSchemaVersion(
    source?.schemaKey ?? "",
    source?.version ?? 0,
    open && !!source
  )
  const create = useCreateSchema()

  const trimmedKey = targetKey.trim()
  const isSameKey = !!source && trimmedKey === source.schemaKey
  const isKeyValid = isValidKey(trimmedKey) && !isSameKey
  const canSubmit = isKeyValid && !!versionDetail && !create.isPending

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setTargetKey("")
      setShowErrors(false)
      create.reset()
    }
  }

  async function handleSubmit() {
    setShowErrors(true)
    if (!versionDetail || !canSubmit) return

    try {
      await create.mutateAsync({ schema_key: trimmedKey, sections: versionDetail.sections })
    } catch {
      // Surfaced below via create.error — nothing further to do here.
      return
    }
    onDuplicated?.(trimmedKey)
    handleOpenChange(false)
  }

  const suggestions = source
    ? existingKeys.filter((key) => key !== source.schemaKey)
    : existingKeys

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar para outra chave</DialogTitle>
          <DialogDescription>
            {source ? (
              <>
                Copia as seções e perguntas de <code>{source.schemaKey}</code> v
                {source.version} para um novo rascunho, sob outra{" "}
                <code>schema_key</code>. A versão original não é alterada.
              </>
            ) : (
              "Copia as seções e perguntas para um novo rascunho, sob outra schema_key."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <LabelWithHint htmlFor="duplicate-target-key">Nova schema_key</LabelWithHint>
          <ComboboxInput
            id="duplicate-target-key"
            value={targetKey}
            onChange={setTargetKey}
            options={suggestions}
            placeholder="ex: registration_seeker"
          />
          {showErrors && isSameKey && (
            <p className="text-xs text-destructive">
              Escolha uma chave diferente da original.
            </p>
          )}
          {showErrors && !isSameKey && trimmedKey.length > 0 && !isValidKey(trimmedKey) && (
            <p className="text-xs text-destructive">
              Use snake_case (letras minúsculas, números e underscore).
            </p>
          )}
          {create.isError && (
            <p className="text-xs text-destructive">
              {create.error instanceof Error ? create.error.message : "Falha ao duplicar."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || create.isPending || (showErrors && !canSubmit)}
          >
            {create.isPending ? "Duplicando…" : "Duplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
