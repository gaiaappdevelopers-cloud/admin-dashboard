import { create } from "zustand"

interface SessionState {
  isExpired: boolean
}

export const useSessionStore = create<SessionState>(() => ({
  isExpired: false,
}))

let resolver: ((success: boolean) => void) | null = null
let pending: Promise<boolean> | null = null

/**
 * Surfaces the re-auth modal and returns a promise that resolves once the
 * admin either logs back in (true) or gives up (false). Concurrent callers
 * (e.g. several requests failing at once) share the same pending promise
 * instead of stacking multiple modals.
 */
export function requestReauth(): Promise<boolean> {
  if (pending) return pending

  pending = new Promise<boolean>((resolve) => {
    resolver = resolve
  })
  useSessionStore.setState({ isExpired: true })
  return pending
}

export function resolveReauth(success: boolean) {
  useSessionStore.setState({ isExpired: false })
  resolver?.(success)
  resolver = null
  pending = null
}
