"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Plus, Moon, Sparkles, Brain, Lightbulb, AlertCircle } from "lucide-react"

import type { ExperienceType } from "@/lib/api/experience-types"
import {
  useExperienceTypes,
  useUpdateExperienceType,
  useDeleteExperienceType,
} from "@/hooks/use-experience-types"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FormDialog } from "./_components/form-dialog"

const ICON_MAP: Record<string, React.ElementType> = {
  moon: Moon,
  sparkles: Sparkles,
  meditation: Brain,
  insight: Lightbulb,
}

function SortableRow({
  et,
  onEdit,
  onDelete,
}: {
  et: ExperienceType
  onEdit: (et: ExperienceType) => void
  onDelete: (et: ExperienceType) => void
}) {
  const update = useUpdateExperienceType()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: et.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = ICON_MAP[et.icon] ?? Sparkles

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: et.icon_color }}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium">{et.title}</p>
        <p className="text-xs text-muted-foreground">{et.description}</p>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{et.schema_key}</code>
      </TableCell>
      <TableCell>
        {et.is_suggested && <Badge variant="secondary">Suggested</Badge>}
      </TableCell>
      <TableCell>
        <Switch
          checked={et.is_active}
          disabled={update.isPending}
          onCheckedChange={(checked) =>
            update.mutate({ id: et.id, payload: { is_active: checked } })
          }
        />
      </TableCell>
      <TableCell className="text-center text-sm text-muted-foreground">
        {et.display_order}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(et)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(et)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function ExperienceTypesPage() {
  const { data, isLoading, isError } = useExperienceTypes()
  const update = useUpdateExperienceType()
  const deleteET = useDeleteExperienceType()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExperienceType | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ExperienceType | undefined>()

  const sensors = useSensors(useSensor(PointerSensor))

  const items = [...(data ?? [])].sort((a, b) => a.display_order - b.display_order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    reordered.forEach((item, index) => {
      const newOrder = index + 1
      if (item.display_order !== newOrder) {
        update.mutate({ id: item.id, payload: { display_order: newOrder } })
      }
    })
  }

  function handleEdit(et: ExperienceType) {
    setEditTarget(et)
    setFormOpen(true)
  }

  function handleNewClick() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  return (
    <>
      <TopBar title="Experience Types" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data ? `${data.length} types` : ""}
          </p>
          <Button size="sm" onClick={handleNewClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Experience Type
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load experience types.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead className="w-10">Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Schema key</TableHead>
                    <TableHead>Suggested</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-center">Order</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((et) => (
                      <SortableRow
                        key={et.id}
                        et={et}
                        onEdit={handleEdit}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </div>
          </DndContext>
        )}
      </main>

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTarget={editTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this experience type. Users will no longer
              see it in the mobile app. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteET.mutate(deleteTarget.id)
                  setDeleteTarget(undefined)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
