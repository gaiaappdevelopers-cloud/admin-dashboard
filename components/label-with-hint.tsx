"use client"

import { Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface LabelWithHintProps {
  children: React.ReactNode
  hint?: string
  htmlFor?: string
}

/** Form label with an optional "?" tooltip explaining the field in plain language. */
export function LabelWithHint({ children, hint, htmlFor }: LabelWithHintProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground">
              <Info className="h-3.5 w-3.5 cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 text-xs">{hint}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
