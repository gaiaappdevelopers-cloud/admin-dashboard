"use client"

import { use } from "react"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useBlogPost } from "@/hooks/use-blog-posts"
import { PostEditor } from "../../_components/post-editor"

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params)
  const { data: post, isLoading, isError } = useBlogPost(id)

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="flex items-center gap-2 m-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Post not found.
      </div>
    )
  }

  return <PostEditor post={post} />
}
