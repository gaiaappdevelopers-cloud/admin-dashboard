"use client"

import { useState } from "react"
import {
  X,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Calendar,
  Info,
  Lightbulb,
  Sparkles,
  Smartphone,
} from "lucide-react"

import type { DynamicFormField, DynamicFormSection, DynamicFormSectionInfoBox } from "@/lib/schema-model"
import type { PreviewLayout } from "@/lib/schema-preview"
import { cn } from "@/lib/utils"

// Tokens sampled from real mobile-app screenshots (gaia-admin/public/mobile_screenshots) —
// the app is dark-themed with a serif display font and violet accents. This mock always
// renders in these colors, independent of the admin panel's own theme, since the point is
// to preview the app, not re-theme the admin.
const TOKENS = {
  screenBg: "#15121e",
  cardBg: "#1d1929",
  cardBorder: "#332c47",
  inputBg: "#110f1a",
  inputBorder: "#3a3350",
  text: "#f1eef7",
  mutedText: "#948dab",
  label: "#c9a3e8",
  primary: "#8752AD",
  primarySoft: "rgba(135, 82, 173, 0.18)",
  progressTrack: "#332c47",
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
 * mobile dev's screenshots. See gaia-admin/docs/adr for the reasoning.
 */
export function MobileFormPreview({ sections, layout }: MobileFormPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div
        className="overflow-hidden rounded-[2rem] border-4 shadow-sm"
        style={{ borderColor: "#0a0910", backgroundColor: TOKENS.screenBg }}
      >
        <div className="flex justify-center py-2">
          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: TOKENS.progressTrack }} />
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
  const isFirst = clampedIndex === 0
  const isLast = clampedIndex === sections.length - 1

  return (
    <div className="flex h-full flex-col pt-2">
      <div className="flex items-center justify-between">
        <X className="h-4 w-4" style={{ color: TOKENS.text }} />
        <span
          className="text-[9px] font-medium tracking-wider"
          style={{ color: TOKENS.mutedText }}
        >
          PASSO {clampedIndex + 1} DE {sections.length}
        </span>
      </div>

      <div className="mt-2 flex gap-1">
        {sections.map((s, i) => (
          <div
            key={s.section_key || i}
            className="h-1 flex-1 rounded-full"
            style={{ backgroundColor: i <= clampedIndex ? TOKENS.primary : TOKENS.progressTrack }}
          />
        ))}
      </div>

      <div className="flex-1 pt-3">
        <SectionBody section={section} headingClassName="font-serif text-base" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: TOKENS.cardBorder }}>
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, clampedIndex - 1))}
          disabled={isFirst}
          className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider disabled:opacity-30"
          style={{ color: TOKENS.text }}
        >
          <ArrowLeft className="h-3 w-3" />
          VOLTAR
        </button>
        <button
          type="button"
          onClick={() => setIndex(Math.min(sections.length - 1, clampedIndex + 1))}
          disabled={isLast}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium tracking-wider disabled:opacity-50"
          style={{ backgroundColor: TOKENS.primary, color: TOKENS.text }}
        >
          PRÓXIMO
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
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
    <div className="space-y-2.5 pt-2">
      {sections.map((section, i) => {
        const key = section.section_key || `section-${i}`
        const isOpen = openKeys.has(key)
        return (
          <div
            key={key}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: TOKENS.cardBorder, backgroundColor: TOKENS.cardBg }}
          >
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full items-start justify-between gap-2 px-3 py-3 text-left"
            >
              <div className="space-y-0.5">
                <p className="font-serif text-sm" style={{ color: TOKENS.text }}>
                  {section.section_title || "Seção sem título"}
                </p>
                {section.section_description && (
                  <p className="text-[10px]" style={{ color: TOKENS.mutedText }}>
                    {section.section_description}
                  </p>
                )}
              </div>
              <ChevronDown
                className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")}
                style={{ color: TOKENS.label }}
              />
            </button>
            {isOpen && (
              <div className="border-t px-3 pb-3 pt-3" style={{ borderColor: TOKENS.cardBorder }}>
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
  headingClassName = "text-sm font-semibold",
}: {
  section: DynamicFormSection
  showTitle?: boolean
  headingClassName?: string
}) {
  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="space-y-1">
          <p className={headingClassName} style={{ color: TOKENS.text }}>
            {section.section_title || "Seção sem título"}
          </p>
          {section.section_description && (
            <p className="text-[11px]" style={{ color: TOKENS.mutedText }}>
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
        <div className="space-y-3.5">
          {section.fields.map((field, i) => (
            <FieldPreview key={field.field_key || i} field={field} />
          ))}
        </div>
      )}

      {section.section_info_box && <InfoBox box={section.section_info_box} />}
    </div>
  )
}

function InfoBox({ box }: { box: DynamicFormSectionInfoBox }) {
  const Icon = box.icon === "sparkles" ? Sparkles : box.icon === "info" ? Info : Lightbulb
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border p-2.5"
      style={{ borderColor: TOKENS.cardBorder }}
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: TOKENS.primarySoft }}
      >
        <Icon className="h-3 w-3" style={{ color: TOKENS.label }} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-medium" style={{ color: TOKENS.text }}>
          {box.title}
        </p>
        <p className="text-[10px]" style={{ color: TOKENS.mutedText }}>
          {box.description}
        </p>
      </div>
    </div>
  )
}

function FieldPreview({ field }: { field: DynamicFormField }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span
          className="text-[10px] font-medium tracking-wider"
          style={{ color: TOKENS.label }}
        >
          {(field.field_title || "PERGUNTA SEM TÍTULO").toUpperCase()}
        </span>
        {field.is_field_mandatory && (
          <span className="text-[10px]" style={{ color: TOKENS.label }}>
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
    borderColor: TOKENS.inputBorder,
    backgroundColor: TOKENS.inputBg,
    color: TOKENS.mutedText,
  }

  switch (field.field_type) {
    case "formatted_text":
      return (
        <div className="rounded-lg border px-2.5 py-3 text-[11px]" style={boxStyle}>
          Texto formatado…
        </div>
      )

    case "date":
      return (
        <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px]" style={boxStyle}>
          Selecione uma data
          <Calendar className="h-3 w-3" style={{ color: TOKENS.label }} />
        </div>
      )

    case "dropdown":
      return (
        <div className="flex items-center justify-between rounded-lg border px-2.5 py-2 text-[11px]" style={boxStyle}>
          <span>Selecione</span>
          <ChevronDown className="h-3 w-3" style={{ color: TOKENS.label }} />
        </div>
      )

    case "boolean":
      return (
        <div className="flex gap-1.5">
          {["Sim", "Não"].map((label) => (
            <span
              key={label}
              className="rounded-full border px-3 py-1 text-[10px]"
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
              className="rounded-full border px-3 py-1 text-[10px]"
              style={
                i === 0
                  ? { borderColor: TOKENS.primary, backgroundColor: TOKENS.primarySoft, color: TOKENS.text }
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
        <div className="space-y-1.5">
          {(field.options.length > 0 ? field.options : ["Opção"]).map((option, i) => (
            <div key={`${option}-${i}`} className="flex items-center gap-1.5 text-[11px]" style={{ color: TOKENS.text }}>
              <span
                className="h-3 w-3 shrink-0 rounded-sm border"
                style={{ borderColor: TOKENS.inputBorder }}
              />
              {option}
            </div>
          ))}
        </div>
      )

    case "text":
    default:
      return (
        <div className="rounded-lg border px-2.5 py-2 text-[11px]" style={boxStyle}>
          {field.field_type === "text" ? "" : field.field_type}
        </div>
      )
  }
}
