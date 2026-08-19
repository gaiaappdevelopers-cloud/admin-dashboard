# A failed token refresh shows an in-place re-auth modal, not a redirect to `/login`

Session drops (from an expired access token racing a stale refresh token, or any other cause) were destroying whatever the admin had unsaved in the schema/blog-post editors, because `lib/api/client.ts` responded to a failed refresh with `window.location.href = "/login"` — a full navigation that tears down all React state. A pre-redirect warning was considered and rejected: it tells the admin data is about to be lost without preventing the loss, which is no better if the session drops near the end of a long form.

Instead, a failed refresh now surfaces an in-place re-authentication modal over the current page. Re-entering credentials refreshes the session without navigating away, so the underlying page (and its unsaved form state) is never torn down — there is nothing to warn about or recover because nothing is destroyed.

This doesn't eliminate session drops themselves; concurrent refresh calls racing against the backend's single-refresh-token-per-account model (see `AuthService.refresh`) are mitigated separately by a single-flight lock around `refreshAccessToken()`, but a fully race-proof fix (multi-valid/grace-window refresh tokens) is deferred — the in-place modal is what makes any remaining drop non-destructive.

**Considered and rejected:**
- **Warn-then-redirect** — rejected because it doesn't prevent data loss, only announces it.
- **Persist form drafts to `sessionStorage` and restore after re-login** — rejected as unnecessary given the in-place modal approach; there's no navigation event to survive, so there's nothing to persist.
