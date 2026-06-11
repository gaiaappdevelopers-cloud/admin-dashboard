import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  blogPostsApi,
  type BlogPostStatus,
  type CreateBlogPostPayload,
  type UpdateBlogPostPayload,
} from "@/lib/api/blog-posts"

const QUERY_KEY = ["blog-posts"]

export function useBlogPosts(status?: BlogPostStatus) {
  return useQuery({
    queryKey: [...QUERY_KEY, status],
    queryFn: () => blogPostsApi.list(status),
  })
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => blogPostsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBlogPostPayload) => blogPostsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPostPayload }) =>
      blogPostsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function usePublishBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogPostsApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUnpublishBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogPostsApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogPostsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
