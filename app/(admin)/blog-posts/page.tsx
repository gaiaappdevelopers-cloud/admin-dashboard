"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react"

import type { BlogPost, BlogPostStatus } from "@/lib/api/blog-posts"
import { useBlogPosts, usePublishBlogPost, useUnpublishBlogPost, useDeleteBlogPost } from "@/hooks/use-blog-posts"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

type Tab = "ALL" | BlogPostStatus

const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
]

export default function BlogPostsPage() {
  const [tab, setTab] = useState<Tab>("ALL")
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | undefined>()

  const { data, isLoading, isError } = useBlogPosts(tab === "ALL" ? undefined : tab)
  const publish = usePublishBlogPost()
  const unpublish = useUnpublishBlogPost()
  const deleteMutation = useDeleteBlogPost()

  return (
    <>
      <TopBar title="Blog" />
      <main className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button size="sm" asChild>
            <Link href="/blog-posts/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New post
            </Link>
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load posts.
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
                  <TableHead>Title</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data ?? []).map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs uppercase">
                          {post.language}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={post.status === "PUBLISHED" ? "default" : "outline"}
                          className={
                            post.status === "PUBLISHED"
                              ? "bg-green-600/10 text-green-700 hover:bg-green-600/10 dark:text-green-400"
                              : ""
                          }
                        >
                          {post.status === "PUBLISHED" ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(post.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={publish.isPending || unpublish.isPending}
                            onClick={() =>
                              post.status === "DRAFT"
                                ? publish.mutate(post.id)
                                : unpublish.mutate(post.id)
                            }
                          >
                            {post.status === "DRAFT" ? "Publish" : "Unpublish"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <Link href={`/blog-posts/${post.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(post)}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id)
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
