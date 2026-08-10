"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LabelWithHint } from "@/components/label-with-hint"

interface OptionalBlockProps {
  label: string
  hint?: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  children: React.ReactNode
}

/** Toggle-to-reveal wrapper for optional nested structures (tooltip, link, info box, ...). */
export function OptionalBlock({ label, hint, enabled, onToggle, children }: OptionalBlockProps) {
  return (
    <div className="space-y-2 rounded-md border border-dashed p-2.5">
      <div className="flex items-center justify-between">
        <LabelWithHint hint={hint}>{label}</LabelWithHint>
        {enabled ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => onToggle(false)}
          >
            <X className="mr-1 h-3 w-3" />
            Remover
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onToggle(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Adicionar
          </Button>
        )}
      </div>
      {enabled && children}
    </div>
  )
}
