import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { schemasApi, type CreateSchemaPayload } from "@/lib/api/schemas"

const QUERY_KEY = ["schemas"]

export function useSchemas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: schemasApi.list,
  })
}

export function useCreateSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSchemaPayload) => schemasApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function usePublishSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, version }: { key: string; version: number }) =>
      schemasApi.publish(key, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, version }: { key: string; version: number }) =>
      schemasApi.delete(key, version),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
