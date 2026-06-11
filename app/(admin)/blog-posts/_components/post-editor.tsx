"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Globe } from "lucide-react"

import type { BlogPost } from "@/lib/api/blog-posts"
import type { PageLanguage } from "@/lib/api/pages"
import {
  useCreateBlogPost,
  useUpdateBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from "@/hooks/use-blog-posts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.enum(["pt", "en"]),
})

type FormValues = z.infer<typeof schema>

interface PostEditorProps {
  post?: BlogPost
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!post
  const [content, setContent] = useState(post?.content ?? "")

  const create = useCreateBlogPost()
  const update = useUpdateBlogPost()
  const publish = usePublishBlogPost()
  const unpublish = useUnpublishBlogPost()

  const isPending =
    create.isPending || update.isPending || publish.isPending || unpublish.isPending

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? "",
      language: (post?.language as PageLanguage) ?? "pt",
    },
  })

  useEffect(() => {
    if (post) setContent(post.content)
  }, [post])

  async function onSubmit(values: FormValues) {
    if (isEditing) {
      await update.mutateAsync({
        id: post.id,
        payload: { title: values.title, language: values.language, content },
      })
    } else {
      const newPost = await create.mutateAsync({
        title: values.title,
        language: values.language,
        content,
        status: "DRAFT",
      })
      router.replace(`/blog-posts/${newPost.id}/edit`)
    }
  }

  async function handlePublish(values: FormValues) {
    if (!post) return
    await update.mutateAsync({
      id: post.id,
      payload: { title: values.title, language: values.language, content },
    })
    if (post.status === "DRAFT") {
      await publish.mutateAsync(post.id)
    } else {
      await unpublish.mutateAsync(post.id)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/blog-posts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <span className="flex-1 text-sm font-semibold">
          {isEditing ? "Edit post" : "New post"}
        </span>

        <div className="flex items-center gap-2">
          {post && (
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
          )}

          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleSubmit(handlePublish)}
            >
              {post?.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
          )}

          <Button size="sm" disabled={isPending} onClick={handleSubmit(onSubmit)}>
            {isPending ? "Saving…" : isEditing ? "Save" : "Save draft"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Post title…" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select
              value={watch("language")}
              onValueChange={(v) => setValue("language", v as PageLanguage)}
            >
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Portuguese (PT)</SelectItem>
                <SelectItem value="en">English (EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="edit" className="flex flex-1 flex-col">
          <TabsList className="w-fit">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content…"
              className="h-full min-h-[400px]"
            />
          </TabsContent>

          <TabsContent value="preview">
            {content ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-md border text-sm text-muted-foreground">
                Nothing to preview yet — write something in the Edit tab.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
