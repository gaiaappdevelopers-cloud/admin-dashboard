import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  experienceTypesApi,
  type CreateExperienceTypePayload,
  type UpdateExperienceTypePayload,
} from "@/lib/api/experience-types"

const QUERY_KEY = ["experience-types"]

export function useExperienceTypes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: experienceTypesApi.list,
  })
}

export function useCreateExperienceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExperienceTypePayload) =>
      experienceTypesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateExperienceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExperienceTypePayload }) =>
      experienceTypesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDeleteExperienceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => experienceTypesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
