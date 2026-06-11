"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Moon, Sparkles, Brain, Lightbulb } from "lucide-react"

import type { ExperienceType } from "@/lib/api/experience-types"
import { useCreateExperienceType, useUpdateExperienceType } from "@/hooks/use-experience-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const ICON_OPTIONS = [
  { key: "moon", label: "Moon", Icon: Moon },
  { key: "sparkles", label: "Sparkles", Icon: Sparkles },
  { key: "meditation", label: "Meditation", Icon: Brain },
  { key: "insight", label: "Insight", Icon: Lightbulb },
] as const

type IconKey = (typeof ICON_OPTIONS)[number]["key"]

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  schema_key: z
    .string()
    .min(1, "Schema key is required")
    .regex(/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/, "Must be snake_case (e.g. meditation_form)"),
  icon: z.enum(["moon", "sparkles", "meditation", "insight"]),
  icon_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g. #A855F7)"),
  is_suggested: z.boolean(),
  is_active: z.boolean(),
})

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
            }
          : {
              title: "",
              description: "",
              schema_key: "",
              icon: "moon",
              icon_color: "#8752AD",
              is_suggested: false,
              is_active: true,
            }
      )
    }
  }, [open, editTarget, reset])

  async function onSubmit(values: FormValues) {
    if (isEditing) {
      const { schema_key: _, ...updatePayload } = values
      await update.mutateAsync({ id: editTarget.id, payload: updatePayload })
    } else {
      await create.mutateAsync(values)
    }
    onOpenChange(false)
  }

  const iconColor = watch("icon_color")
  const selectedIcon = watch("icon")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Experience Type" : "New Experience Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="schema_key">Schema key</Label>
              <Input id="schema_key" placeholder="e.g. meditation_form" disabled={isEditing} {...register("schema_key")} />
              {errors.schema_key && <p className="text-xs text-destructive">{errors.schema_key.message}</p>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Icon</Label>
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
              <Label htmlFor="icon_color">Icon color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setValue("icon_color", e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded-md border border-input p-1"
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
                <Label htmlFor="is_suggested">Suggested</Label>
                <Switch
                  id="is_suggested"
                  checked={watch("is_suggested")}
                  onCheckedChange={(v) => setValue("is_suggested", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={watch("is_active")}
                  onCheckedChange={(v) => setValue("is_active", v)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
