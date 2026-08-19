"use client"

import { Info, Link as LinkIcon, CornerDownRight } from "lucide-react"

import { useSchemaVersion } from "@/hooks/use-schemas"
import { useExperienceTypes } from "@/hooks/use-experience-types"
import {
  FIELD_TYPE_OPTIONS,
  type DynamicFormField,
  type DynamicFormSection,
} from "@/lib/schema-model"
import { resolvePreviewLayout } from "@/lib/schema-preview"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MobileFormPreview } from "./mobile-form-preview"

interface SchemaPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schemaKey: string
  version: number
  isPublished: boolean
}

export function SchemaPreviewDialog({
  open,
  onOpenChange,
  schemaKey,
  version,
  isPublished,
}: SchemaPreviewDialogProps) {
  const { data, isLoading, isError } = useSchemaVersion(schemaKey, version, open)
  const { data: experienceTypes } = useExperienceTypes()
  const layout = resolvePreviewLayout(schemaKey, experienceTypes)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Pré-visualização — v{version}
            <Badge
              variant={isPublished ? "secondary" : "outline"}
              className={isPublished ? "text-green-700 dark:text-green-400" : "text-xs"}
            >
              {isPublished ? "Publicada" : "Rascunho"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : isError || !data ? (
          <p className="py-8 text-center text-sm text-destructive">
            Não foi possível carregar essa versão.
          </p>
        ) : (data.sections as DynamicFormSection[]).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Essa versão ainda não tem nenhuma seção.
          </p>
        ) : (
          <Tabs defaultValue="visual">
            <TabsList>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="mt-3">
              <MobileFormPreview sections={data.sections as DynamicFormSection[]} layout={layout} />
            </TabsContent>

            <TabsContent value="details" className="mt-3 space-y-4">
              {(data.sections as DynamicFormSection[]).map((section, i) => (
                <PreviewSection key={section.section_key || i} section={section} />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PreviewSection({ section }: { section: DynamicFormSection }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="text-sm font-semibold">
          {section.section_title || "Seção sem título"}
        </p>
        {section.section_description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {section.section_description}
          </p>
        )}
        {section.section_info_box && (
          <div className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 p-2.5 text-xs">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">{section.section_info_box.title}</p>
              <p className="text-muted-foreground">{section.section_info_box.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y">
        {section.fields.length === 0 ? (
          <p className="px-4 py-3 text-xs text-muted-foreground">
            Nenhuma pergunta nessa seção.
          </p>
        ) : (
          section.fields.map((field, i) => (
            <PreviewField key={field.field_key || i} field={field} />
          ))
        )}
      </div>
    </div>
  )
}

function PreviewField({ field, nested = false }: { field: DynamicFormField; nested?: boolean }) {
  const typeLabel = FIELD_TYPE_OPTIONS.find((o) => o.value === field.field_type)?.label
    ?? field.field_type

  return (
    <div className={`px-4 py-3 ${nested ? "bg-muted/20" : ""}`}>
      <div className="flex items-start gap-2">
        {nested && <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-medium">
              {field.field_title || "Pergunta sem título"}
            </p>
            {field.is_field_mandatory && (
              <Badge variant="outline" className="text-[10px] font-normal">obrigatória</Badge>
            )}
            {field.is_read_only && (
              <Badge variant="outline" className="text-[10px] font-normal">somente leitura</Badge>
            )}
            {field.is_pai_eligible && (
              <Badge variant="outline" className="text-[10px] font-normal">alimenta o PAI</Badge>
            )}
          </div>

          {field.field_description && (
            <p className="text-xs text-muted-foreground">{field.field_description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-normal">{typeLabel}</Badge>
            {field.options.length > 0 &&
              field.options.map((option) => (
                <Badge key={option} variant="outline" className="text-[10px] font-normal">
                  {option}
                </Badge>
              ))}
          </div>

          {field.link && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <LinkIcon className="h-3 w-3" />
              {field.link.label || field.link.page_key}
            </p>
          )}

          {field.field_tooltip && (
            <p className="text-xs text-muted-foreground italic">
              “{field.field_tooltip.description}”
            </p>
          )}

          {field.complementary_field && (
            <div className="mt-1 rounded-md border border-dashed">
              <PreviewField field={field.complementary_field} nested />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
