import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  schemasApi,
  type CreateSchemaPayload,
  type UpdateSchemaPayload,
} from "@/lib/api/schemas"

const QUERY_KEY = ["schemas"]

export function useSchemas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: schemasApi.list,
  })
}

export function useSchemaVersion(schemaKey: string, version: number, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEY, schemaKey, version],
    queryFn: () => schemasApi.getVersion(schemaKey, version),
    enabled: enabled && !!schemaKey && !!version,
  })
}

export function useCreateSchema() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSchemaPayload) => schemasApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateSchemaVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      key,
      version,
      payload,
    }: {
      key: string
      version: number
      payload: UpdateSchemaPayload
    }) => schemasApi.updateVersion(key, version, payload),
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
