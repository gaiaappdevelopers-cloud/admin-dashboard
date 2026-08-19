"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { useCreateSchema, useSchemaVersion, useUpdateSchemaVersion } from "@/hooks/use-schemas"
import { useExperienceTypes } from "@/hooks/use-experience-types"
import {
  collectInvalidKeys,
  createEmptySection,
  isValidKey,
  type DynamicFormSection,
} from "@/lib/schema-model"
import { resolvePreviewLayout } from "@/lib/schema-preview"
import { Button } from "@/components/ui/button"
import { LabelWithHint } from "@/components/label-with-hint"
import { ComboboxInput } from "@/components/combobox-input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { SectionEditor } from "./section-editor"
import { MobileFormPreview } from "./mobile-form-preview"

interface NewVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultSchemaKey?: string
  /** When set, the dialog edits this draft version in place instead of creating a new one. */
  editVersion?: { schemaKey: string; version: number }
  /**
   * When set, the schema_key field is hidden entirely and locked to this
   * value — for single-purpose forms (like PAI) where there's nothing to
   * pick.
   */
  fixedSchemaKey?: string
}

export function NewVersionDialog({
  open,
  onOpenChange,
  defaultSchemaKey = "",
  editVersion,
  fixedSchemaKey,
}: NewVersionDialogProps) {
  const isEditing = !!editVersion
  // The parent remounts this dialog (via `key`) each time it opens, so lazy
  // initial state is enough to reset the form — no reset-on-open effect needed.
  const [schemaKey, setSchemaKey] = useState(
    isEditing ? editVersion.schemaKey : (fixedSchemaKey ?? defaultSchemaKey)
  )
  const [sections, setSections] = useState<DynamicFormSection[]>(
    isEditing ? [] : [createEmptySection()]
  )
  const [loadedVersionSignature, setLoadedVersionSignature] = useState<string | null>(null)

  const create = useCreateSchema()
  const update = useUpdateSchemaVersion()
  const isPending = create.isPending || update.isPending
  const { data: experienceTypes } = useExperienceTypes()
  const { data: versionDetail, isLoading: isLoadingVersion } = useSchemaVersion(
    editVersion?.schemaKey ?? "",
    editVersion?.version ?? 0,
    open && isEditing
  )

  const previewLayout = resolvePreviewLayout(schemaKey.trim(), experienceTypes)

  const schemaKeyOptions = [
    ...new Set(
      (experienceTypes ?? []).flatMap((et) =>
        [et.schema_key, et.follow_up_schema_key].filter((key): key is string => !!key)
      )
    ),
  ].sort()

  // Populate sections once the draft's content has loaded. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  if (isEditing && versionDetail) {
    const signature = `${versionDetail.schema_key}:${versionDetail.schema_version}`
    if (signature !== loadedVersionSignature) {
      setLoadedVersionSignature(signature)
      setSections((versionDetail.sections as DynamicFormSection[]) ?? [])
    }
  }

  function addSection() {
    setSections([...sections, createEmptySection()])
  }

  function updateSection(index: number, section: DynamicFormSection) {
    const next = [...sections]
    next[index] = section
    setSections(next)
  }

  function removeSection(index: number) {
    setSections(sections.filter((_, i) => i !== index))
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSections(next)
  }

  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const invalidKeys = collectInvalidKeys(sections)
  const schemaKeyValid = isValidKey(schemaKey.trim())
  const canSubmit =
    schemaKeyValid && sections.length > 0 && invalidKeys.length === 0
  const showErrors = attemptedSubmit

  async function handleSubmit() {
    if (!canSubmit) {
      setAttemptedSubmit(true)
      return
    }

    if (isEditing) {
      await update.mutateAsync({
        key: editVersion.schemaKey,
        version: editVersion.version,
        payload: { sections },
      })
    } else {
      await create.mutateAsync({ schema_key: schemaKey.trim(), sections })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar rascunho — v${editVersion.version}` : "Nova versão de formulário"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            {!fixedSchemaKey && (
              <div className="space-y-1.5">
                <LabelWithHint hint="Identifica este formulário no sistema. É usado pelo app mobile pra saber qual formulário carregar — por isso precisa bater com o schema_key de um Tipo de Experiência (ou com a chave de follow-up dele).">
                  Chave do formulário
                </LabelWithHint>
                <ComboboxInput
                  value={schemaKey}
                  onChange={setSchemaKey}
                  options={schemaKeyOptions}
                  placeholder="Escolha uma chave existente ou digite uma nova"
                  disabled={isEditing}
                  className="font-mono"
                />
                {showErrors && !schemaKeyValid ? (
                  <p className="text-xs text-destructive">
                    Deve estar em snake_case (ex: experience_protocol_follow_up)
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Deve bater com o schema_key ou follow_up_schema_key de um Tipo de Experiência.
                  </p>
                )}
              </div>
            )}

            {isEditing && isLoadingVersion ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <div className="space-y-2">
                {sections.map((section, index) => (
                  // Keyed by index, not section_key: section_key is
                  // auto-slugified from the title on every keystroke for new
                  // sections, which would remount the input (and drop focus)
                  // on every letter.
                  <SectionEditor
                    key={index}
                    section={section}
                    onChange={(s) => updateSection(index, s)}
                    onRemove={() => removeSection(index)}
                    onMoveUp={index > 0 ? () => moveSection(index, -1) : undefined}
                    onMoveDown={index < sections.length - 1 ? () => moveSection(index, 1) : undefined}
                    showErrors={showErrors}
                  />
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Adicionar seção
                </Button>
                {showErrors && invalidKeys.length > 0 && (
                  <p className="text-xs text-destructive">
                    {invalidKeys.length === 1
                      ? "1 chave precisa"
                      : `${invalidKeys.length} chaves precisam`}{" "}
                    estar em snake_case antes de salvar:{" "}
                    <span className="font-mono">{invalidKeys.join(", ")}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="hidden min-h-0 flex-col lg:flex">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Prévia no app</p>
            <div className="min-h-0 flex-1 overflow-y-auto pb-1">
              <MobileFormPreview sections={sections} layout={previewLayout} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando…" : isEditing ? "Salvar rascunho" : "Criar versão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
