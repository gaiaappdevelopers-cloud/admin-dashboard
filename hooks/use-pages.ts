import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  pagesApi,
  type CreatePagePayload,
  type UpdatePagePayload,
  type PageLanguage,
} from "@/lib/api/pages"

const QUERY_KEY = ["pages"]

export function usePages() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: pagesApi.list,
  })
}

export function usePage(pageKey: string, language: PageLanguage) {
  return useQuery({
    queryKey: [...QUERY_KEY, pageKey, language],
    queryFn: () => pagesApi.get(pageKey, language),
    enabled: !!pageKey,
  })
}

export function useCreatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePagePayload) => pagesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdatePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageKey, payload }: { pageKey: string; payload: UpdatePagePayload }) =>
      pagesApi.update(pageKey, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeletePage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageKey, language }: { pageKey: string; language: PageLanguage }) =>
      pagesApi.delete(pageKey, language),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
