import { useQuery } from "@tanstack/react-query"

import { statsApi } from "@/lib/api/stats"

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.get,
  })
}
