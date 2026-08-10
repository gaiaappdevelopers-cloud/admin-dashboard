"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import type { Page, PageLanguage } from "@/lib/api/pages"
import { SNAKE_CASE_KEY_PATTERN } from "@/lib/schema-model"
import { useCreatePage, useUpdatePage, usePage } from "@/hooks/use-pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LabelWithHint } from "@/components/label-with-hint"
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
import { RichTextEditor } from "@/components/rich-text-editor"

const schema = z.object({
  page_key: z
    .string()
    .min(1, "Chave da página é obrigatória")
    .regex(SNAKE_CASE_KEY_PATTERN, "Deve estar em snake_case (ex: terms_of_use)"),
  language: z.enum(["pt", "en"]),
  title: z.string().min(1, "Título é obrigatório"),
})

type FormValues = z.infer<typeof schema>

interface PageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: Pick<Page, "page_key" | "language">
}

export function PageFormDialog({ open, onOpenChange, editTarget }: PageFormDialogProps) {
  const isEditing = !!editTarget
  const [htmlContent, setHtmlContent] = useState("")
  const [htmlError, setHtmlError] = useState(false)

  const { data: existingPage } = usePage(
    editTarget?.page_key ?? "",
    editTarget?.language ?? "pt"
  )

  const create = useCreatePage()
  const update = useUpdatePage()
  const isPending = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { page_key: "", language: "pt", title: "" },
  })

  useEffect(() => {
    if (open) {
      if (editTarget && existingPage) {
        reset({
          page_key: existingPage.page_key,
          language: existingPage.language,
          title: existingPage.title,
        })
        setHtmlContent(existingPage.html_content ?? "")
      } else if (!editTarget) {
        reset({ page_key: "", language: "pt", title: "" })
        setHtmlContent("")
      }
      setHtmlError(false)
    }
  }, [open, editTarget, existingPage, reset])

  async function onSubmit(values: FormValues) {
    if (!htmlContent.trim()) {
      setHtmlError(true)
      return
    }
    setHtmlError(false)

    if (isEditing) {
      await update.mutateAsync({
        pageKey: values.page_key,
        payload: { language: values.language, title: values.title, html_content: htmlContent },
      })
    } else {
      await create.mutateAsync({
        page_key: values.page_key,
        language: values.language,
        title: values.title,
        html_content: htmlContent,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Página" : "Nova Página"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <LabelWithHint
                htmlFor="page_key"
                hint="Identifica essa página no sistema — é o que o app mobile usa pra buscar o conteúdo certo. Não aparece pro usuário final."
              >
                Chave da página
              </LabelWithHint>
              <Input
                id="page_key"
                placeholder="ex: about"
                className="font-mono"
                disabled={isEditing}
                {...register("page_key")}
              />
              {errors.page_key && (
                <p className="text-xs text-destructive">{errors.page_key.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Idioma</Label>
              <Select
                // eslint-disable-next-line react-hooks/incompatible-library
                value={watch("language")}
                onValueChange={(v) => setValue("language", v as PageLanguage)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português (PT)</SelectItem>
                  <SelectItem value="en">Inglês (EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <RichTextEditor
              value={htmlContent}
              onChange={(html) => {
                setHtmlContent(html)
                if (html.trim()) setHtmlError(false)
              }}
              placeholder="Escreva o conteúdo da página…"
            />
            {htmlError && (
              <p className="text-xs text-destructive">Conteúdo é obrigatório</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
