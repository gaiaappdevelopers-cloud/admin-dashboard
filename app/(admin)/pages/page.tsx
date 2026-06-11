"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react"

import type { Page, PageLanguage } from "@/lib/api/pages"
import { usePages, useDeletePage } from "@/hooks/use-pages"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
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
import { PageFormDialog } from "./_components/page-form-dialog"

const LANGUAGE_LABELS: Record<PageLanguage, string> = {
  pt: "PT",
  en: "EN",
}

type EditTarget = Pick<Page, "page_key" | "language">

function groupByKey(pages: Page[]): Record<string, Page[]> {
  return pages.reduce<Record<string, Page[]>>((acc, p) => {
    if (!acc[p.page_key]) acc[p.page_key] = []
    acc[p.page_key].push(p)
    return acc
  }, {})
}

export default function PagesPage() {
  const { data, isLoading, isError } = usePages()
  const deletePage = useDeletePage()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EditTarget | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Page | undefined>()

  const grouped = groupByKey(data ?? [])
  const keys = Object.keys(grouped).sort()

  function handleEdit(page: Page) {
    setEditTarget({ page_key: page.page_key, language: page.language })
    setFormOpen(true)
  }

  function handleNewClick() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  return (
    <>
      <TopBar title="Pages" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {keys.length > 0 ? `${keys.length} page ${keys.length === 1 ? "key" : "keys"}` : ""}
          </p>
          <Button size="sm" onClick={handleNewClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            New page
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load pages.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page key</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.flatMap((key) =>
                  grouped[key]
                    .sort((a, b) => a.language.localeCompare(b.language))
                    .map((page, idx) => (
                      <TableRow key={`${page.page_key}-${page.language}`}>
                        <TableCell>
                          {idx === 0 ? (
                            <code className="text-sm font-medium">{page.page_key}</code>
                          ) : (
                            <span className="text-muted-foreground">↳</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {LANGUAGE_LABELS[page.language]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{page.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(page.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(page)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(page)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <PageFormDialog
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
            <AlertDialogTitle>
              Delete "{deleteTarget?.page_key}" ({deleteTarget?.language.toUpperCase()})?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the{" "}
              {deleteTarget?.language === "pt" ? "Portuguese" : "English"} variant of
              this page. Other language variants are unaffected. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deletePage.mutate({
                    pageKey: deleteTarget.page_key,
                    language: deleteTarget.language,
                  })
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
