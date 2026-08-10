"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagListEditorProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

/** Chip-list editor for string arrays (Field.options, complementary activation values, etc). */
export function TagListEditor({ values, onChange, placeholder }: TagListEditorProps) {
  const [draft, setDraft] = useState("")

  function commitDraft() {
    const value = draft.trim()
    if (value.length === 0) return
    if (!values.includes(value)) {
      onChange([...values, value])
    }
    setDraft("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitDraft()
    } else if (e.key === "Backspace" && draft.length === 0 && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <Badge key={`${value}-${index}`} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={placeholder ?? "Digite um valor e pressione Enter"}
      />
    </div>
  )
}
