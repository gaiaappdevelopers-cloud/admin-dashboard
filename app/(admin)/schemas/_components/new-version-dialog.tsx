"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useCreateSchema } from "@/hooks/use-schemas"
import { useExperienceTypes } from "@/hooks/use-experience-types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const DEFAULT_SECTIONS = JSON.stringify(
  [
    {
      section_key: "example_section",
      section_title: "Example Section",
      section_description: "Describe the purpose of this section.",
      is_initially_expanded: true,
      fields: [
        {
          field_key: "example_field",
          field_title: "Example Field",
          field_type: "text",
          is_field_mandatory: false,
        },
      ],
    },
  ],
  null,
  2
)

interface NewVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultSchemaKey?: string
}

export function NewVersionDialog({
  open,
  onOpenChange,
  defaultSchemaKey = "",
}: NewVersionDialogProps) {
  const [schemaKey, setSchemaKey] = useState(defaultSchemaKey)
  const [sectionsJson, setSectionsJson] = useState(DEFAULT_SECTIONS)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const create = useCreateSchema()
  const { data: experienceTypes } = useExperienceTypes()

  const schemaKeyOptions = [
    ...new Set((experienceTypes ?? []).map((et) => et.schema_key)),
  ].sort()

  function validateJson(value: string): unknown[] | null {
    try {
      const parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        setJsonError("sections must be a JSON array")
        return null
      }
      setJsonError(null)
      return parsed
    } catch {
      setJsonError("Invalid JSON")
      return null
    }
  }

  async function handleSubmit() {
    if (!schemaKey.trim()) return
    const sections = validateJson(sectionsJson)
    if (!sections) return

    await create.mutateAsync({ schema_key: schemaKey.trim(), sections })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Schema Version</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Schema key</Label>
            <Select value={schemaKey} onValueChange={setSchemaKey}>
              <SelectTrigger className="font-mono w-full">
                <SelectValue placeholder="Select a schema key…" />
              </SelectTrigger>
              <SelectContent>
                {schemaKeyOptions.map((key) => (
                  <SelectItem key={key} value={key} className="font-mono">
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Sections (JSON)</Label>
            <div className="overflow-hidden rounded-md border">
              <MonacoEditor
                height="320px"
                language="json"
                value={sectionsJson}
                onChange={(v) => {
                  setSectionsJson(v ?? "")
                  validateJson(v ?? "")
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                }}
                theme="vs-dark"
              />
            </div>
            {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={create.isPending || !schemaKey.trim() || !!jsonError}
          >
            {create.isPending ? "Creating…" : "Create version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}