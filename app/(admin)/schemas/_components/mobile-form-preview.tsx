"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Info,
  Smartphone,
} from "lucide-react"

import type { DynamicFormField, DynamicFormSection } from "@/lib/schema-model"
import type { PreviewLayout } from "@/lib/schema-preview"
import { cn } from "@/lib/utils"

// A handful of tokens lifted from color_tokens.json (light palette) — this
// mock always renders in the mobile app's real light colors, independent of
// the admin panel's own theme, since the point is to preview the app, not
// re-theme the admin.
const TOKENS = {
  screenBg: "#E8E4D8",
  cardBg: "#f5f3f0",
  border: "#d6cec2",
  text: "#2C2C3A",
  mutedText: "#6e6e91",
  primary: "#8752AD",
  primarySoft: "#f3eef7",
}

interface MobileFormPreviewProps {
  sections: DynamicFormSection[]
  layout: PreviewLayout
}

/**
 * Low-fidelity, structure-only mock of how a schema will render in the
 * mobile app — not pixel-accurate to Flutter (we don't have that source
 * here), just accurate about which section a field lands in, what kind of
 * control it becomes, and the page/accordion structure confirmed by the
 * mobile dev. See gaia-admin/docs/adr for the reasoning.
 */
export function MobileFormPreview({ sections, layout }: MobileFormPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div
        className="overflow-hidden rounded-[2rem] border-4 shadow-sm"
        style={{ borderColor: TOKENS.text, backgroundColor: TOKENS.screenBg }}
      >
        <div className="flex justify-center py-2">
          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: TOKENS.border }} />
        </div>

        <div className="h-[520px] overflow-y-auto px-4 pb-6">
          {sections.length === 0 ? (
            <EmptyState message="Esse formulário ainda não tem seções." />
          ) : layout === "paginated" ? (
            <PaginatedPreview sections={sections} />
          ) : layout === "accordion_stack" ? (
            <AccordionStackPreview sections={sections} />
          ) : (
            <EmptyState
              icon={<Smartphone className="h-6 w-6" style={{ color: TOKENS.mutedText }} />}
              message="Prévia visual pendente — o layout mobile deste formulário ainda não foi confirmado."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
      {icon ?? <Info className="h-6 w-6" style={{ color: TOKENS.mutedText }} />}
      <p className="text-xs" style={{ color: TOKENS.mutedText }}>
        {message}
      </p>
    </div>
  )
}

function PaginatedPreview({ sections }: { sections: DynamicFormSection[] }) {
  const [index, setIndex] = useState(0)
  const clampedIndex = Math.min(index, sections.length - 1)
  const section = sections[clampedIndex]

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, clampedIndex - 1))}
          disabled={clampedIndex === 0}
          className="rounded-full p-1 disabled:opacity-30"
          style={{ color: TOKENS.primary }}
          aria-label="Seção anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px]" style={{ color: TOKENS.mutedText }}>
          Seção {clampedIndex + 1} de {sections.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex(Math.min(sections.length - 1, clampedIndex + 1))}
          disabled={clampedIndex === sections.length - 1}
          className="rounded-full p-1 disabled:opacity-30"
          style={{ color: TOKENS.primary }}
          aria-label="Próxima seção"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <SectionBody section={section} />
    </div>
  )
}

function AccordionStackPreview({ sections }: { sections: DynamicFormSection[] }) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(sections.filter((s) => s.is_initially_expanded).map((s) => s.section_key))
  )

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-2 pt-2">
      {sections.map((section, i) => {
        const key = section.section_key || `section-${i}`
        const isOpen = openKeys.has(key)
        return (
          <div
            key={key}
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: TOKENS.border, backgroundColor: TOKENS.cardBg }}
          >
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <span className="text-xs font-medium" style={{ color: TOKENS.text }}>
                {section.section_title || "Seção sem título"}
              </span>
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                style={{ color: TOKENS.mutedText }}
              />
            </button>
            {isOpen && (
              <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: TOKENS.border }}>
                <SectionBody section={section} showTitle={false} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SectionBody({
  section,
  showTitle = true,
}: {
  section: DynamicFormSection
  showTitle?: boolean
}) {
  return (
    <div className="space-y-3">
      {showTitle && (
        <div>
          <p className="text-sm font-semibold" style={{ color: TOKENS.text }}>
            {section.section_title || "Seção sem título"}
          </p>
          {section.section_description && (
            <p className="mt-0.5 text-[11px]" style={{ color: TOKENS.mutedText }}>
              {section.section_description}
            </p>
          )}
        </div>
      )}

      {section.fields.length === 0 ? (
        <p className="text-[11px] italic" style={{ color: TOKENS.mutedText }}>
          Nenhum campo nesta seção ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {section.fields.map((field, i) => (
            <FieldPreview key={field.field_key || i} field={field} />
          ))}
        </div>
      )}
    </div>
  )
}

function FieldPreview({ field }: { field: DynamicFormField }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-medium" style={{ color: TOKENS.text }}>
          {field.field_title || "Pergunta sem título"}
        </span>
        {field.is_field_mandatory && (
          <span className="text-xs" style={{ color: TOKENS.primary }}>
            *
          </span>
        )}
      </div>
      {field.field_description && (
        <p className="text-[10px]" style={{ color: TOKENS.mutedText }}>
          {field.field_description}
        </p>
      )}
      <FieldControlMock field={field} />
    </div>
  )
}

function FieldControlMock({ field }: { field: DynamicFormField }) {
  const boxStyle = {
    borderColor: TOKENS.border,
    backgroundColor: TOKENS.cardBg,
    color: TOKENS.mutedText,
  }

  switch (field.field_type) {
    case "formatted_text":
      return (
        <div className="rounded-md border px-2 py-3 text-[11px]" style={boxStyle}>
          Texto formatado…
        </div>
      )

    case "date":
      return (
        <div className="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px]" style={boxStyle}>
          <Calendar className="h-3 w-3" />
          Selecionar data
        </div>
      )

    case "dropdown":
      return (
        <div className="flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px]" style={boxStyle}>
          <span>Selecionar…</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      )

    case "boolean":
      return (
        <div className="flex gap-1.5">
          {["Sim", "Não"].map((label) => (
            <span
              key={label}
              className="rounded-full border px-2.5 py-0.5 text-[10px]"
              style={boxStyle}
            >
              {label}
            </span>
          ))}
        </div>
      )

    case "selection":
      return (
        <div className="flex flex-wrap gap-1.5">
          {(field.options.length > 0 ? field.options : ["Opção"]).map((option, i) => (
            <span
              key={`${option}-${i}`}
              className="rounded-full border px-2.5 py-0.5 text-[10px]"
              style={
                i === 0
                  ? { borderColor: TOKENS.primary, backgroundColor: TOKENS.primarySoft, color: TOKENS.primary }
                  : boxStyle
              }
            >
              {option}
            </span>
          ))}
        </div>
      )

    case "checkbox":
      return (
        <div className="space-y-1">
          {(field.options.length > 0 ? field.options : ["Opção"]).map((option, i) => (
            <div key={`${option}-${i}`} className="flex items-center gap-1.5 text-[11px]" style={{ color: TOKENS.text }}>
              <span
                className="h-3 w-3 shrink-0 rounded-sm border"
                style={{ borderColor: TOKENS.border }}
              />
              {option}
            </div>
          ))}
        </div>
      )

    case "text":
    default:
      return (
        <div className="rounded-md border px-2 py-1.5 text-[11px]" style={boxStyle}>
          {field.field_type === "text" ? "Resposta…" : field.field_type}
        </div>
      )
  }
}
