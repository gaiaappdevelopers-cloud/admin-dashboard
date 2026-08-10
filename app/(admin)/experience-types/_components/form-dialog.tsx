"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Moon, Sparkles, Brain, Lightbulb, Activity } from "lucide-react"

import type { ExperienceType } from "@/lib/api/experience-types"
import { SNAKE_CASE_KEY_PATTERN } from "@/lib/schema-model"
import {
  useCreateExperienceType,
  useUpdateExperienceType,
  useExperienceTypes,
} from "@/hooks/use-experience-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LabelWithHint } from "@/components/label-with-hint"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ComboboxInput } from "@/components/combobox-input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const ICON_OPTIONS = [
  { key: "moon", label: "Lua", Icon: Moon },
  { key: "sparkles", label: "Brilho", Icon: Sparkles },
  { key: "meditation", label: "Meditação", Icon: Brain },
  { key: "insight", label: "Insight", Icon: Lightbulb },
  { key: "activity", label: "Atividade", Icon: Activity },
] as const

type IconKey = (typeof ICON_OPTIONS)[number]["key"]

const schema = z
  .object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    schema_key: z
      .string()
      .min(1, "Chave do formulário é obrigatória")
      .regex(SNAKE_CASE_KEY_PATTERN, "Deve estar em snake_case (ex: meditation_form)"),
    icon: z.enum(["moon", "sparkles", "meditation", "insight", "activity"]),
    icon_color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Deve ser uma cor hexadecimal válida (ex: #A855F7)"),
    is_suggested: z.boolean(),
    is_active: z.boolean(),
    supports_follow_up: z.boolean(),
    follow_up_schema_key: z.string(),
  })
  .refine(
    (values) => !values.supports_follow_up || values.follow_up_schema_key.trim().length > 0,
    {
      message: "Chave do formulário de follow-up é obrigatória quando o follow-up está ativado",
      path: ["follow_up_schema_key"],
    }
  )
  .refine(
    (values) =>
      !values.supports_follow_up ||
      SNAKE_CASE_KEY_PATTERN.test(values.follow_up_schema_key.trim()),
    {
      message: "Deve estar em snake_case (ex: experience_protocol_follow_up)",
      path: ["follow_up_schema_key"],
    }
  )

type FormValues = z.infer<typeof schema>

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: ExperienceType
}

export function FormDialog({ open, onOpenChange, editTarget }: FormDialogProps) {
  const isEditing = !!editTarget
  const create = useCreateExperienceType()
  const update = useUpdateExperienceType()
  const isPending = create.isPending || update.isPending
  const { data: experienceTypes } = useExperienceTypes()

  const followUpSchemaKeyOptions = [
    ...new Set(
      (experienceTypes ?? [])
        .map((et) => et.follow_up_schema_key)
        .filter((key): key is string => !!key)
    ),
  ].sort()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      schema_key: "",
      icon: "moon",
      icon_color: "#8752AD",
      is_suggested: false,
      is_active: true,
      supports_follow_up: false,
      follow_up_schema_key: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        editTarget
          ? {
              title: editTarget.title,
              description: editTarget.description,
              schema_key: editTarget.schema_key,
              icon: editTarget.icon as IconKey,
              icon_color: editTarget.icon_color,
              is_suggested: editTarget.is_suggested,
              is_active: editTarget.is_active,
              supports_follow_up: editTarget.supports_follow_up,
              follow_up_schema_key: editTarget.follow_up_schema_key ?? "",
            }
          : {
              title: "",
              description: "",
              schema_key: "",
              icon: "moon",
              icon_color: "#8752AD",
              is_suggested: false,
              is_active: true,
              supports_follow_up: false,
              follow_up_schema_key: "",
            }
      )
    }
  }, [open, editTarget, reset])

  async function onSubmit(values: FormValues) {
    const normalized = {
      ...values,
      follow_up_schema_key: values.supports_follow_up
        ? values.follow_up_schema_key.trim()
        : null,
    }

    if (isEditing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { schema_key: _, ...updatePayload } = normalized
      await update.mutateAsync({ id: editTarget.id, payload: updatePayload })
    } else {
      await create.mutateAsync(normalized)
    }
    onOpenChange(false)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const iconColor = watch("icon_color")
  const selectedIcon = watch("icon")
  const supportsFollowUp = watch("supports_follow_up")
  const followUpSchemaKey = watch("follow_up_schema_key")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Experiência" : "Novo Tipo de Experiência"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={2} {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <LabelWithHint
                htmlFor="schema_key"
                hint="Liga esse Tipo de Experiência ao formulário que o usuário preenche. Precisa bater com a chave de um formulário cadastrado em Formulários."
              >
                Chave do formulário
              </LabelWithHint>
              <Input id="schema_key" placeholder="ex: meditation_form" disabled={isEditing} {...register("schema_key")} />
              {errors.schema_key && <p className="text-xs text-destructive">{errors.schema_key.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Ícone</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue("icon", key)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors ${
                      selectedIcon === key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
              {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="icon_color">Cor do ícone</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setValue("icon_color", e.target.value)}
                  className="h-9 w-10.5 cursor-pointer rounded-md border border-input p-1"
                />
                <Input
                  id="icon_color"
                  placeholder="#8752AD"
                  {...register("icon_color")}
                  className="font-mono"
                />
              </div>
              {errors.icon_color && <p className="text-xs text-destructive">{errors.icon_color.message}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <LabelWithHint
                  htmlFor="is_suggested"
                  hint="Destaca esse tipo pros usuários novos, como sugestão inicial na tela de escolha de Experiência."
                >
                  Sugerido
                </LabelWithHint>
                <Switch
                  id="is_suggested"
                  checked={watch("is_suggested")}
                  onCheckedChange={(v) => setValue("is_suggested", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <LabelWithHint
                  htmlFor="is_active"
                  hint="Quando desligado, esse tipo some da lista de novas Experiências no app — mas Experiências já registradas com ele continuam acessíveis no diário do usuário."
                >
                  Ativo
                </LabelWithHint>
                <Switch
                  id="is_active"
                  checked={watch("is_active")}
                  onCheckedChange={(v) => setValue("is_active", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <LabelWithHint
                  htmlFor="supports_follow_up"
                  hint="Permite que o usuário registre acompanhamentos ao longo do tempo pra uma mesma Experiência (ex: evolução de uma prática ou recomendação)."
                >
                  Permite follow-up
                </LabelWithHint>
                <Switch
                  id="supports_follow_up"
                  checked={supportsFollowUp}
                  onCheckedChange={(v) => setValue("supports_follow_up", v)}
                />
              </div>
            </div>

            {supportsFollowUp && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="follow_up_schema_key">Chave do formulário de follow-up</Label>
                <ComboboxInput
                  id="follow_up_schema_key"
                  value={followUpSchemaKey}
                  onChange={(v) => setValue("follow_up_schema_key", v)}
                  options={followUpSchemaKeyOptions}
                  placeholder="ex: experience_protocol_follow_up"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Escolha uma chave de follow-up existente, ou digite uma nova — o
                  formulário dela é criado depois, na página de Formulários.
                </p>
                {errors.follow_up_schema_key && (
                  <p className="text-xs text-destructive">
                    {errors.follow_up_schema_key.message}
                  </p>
                )}
              </div>
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
