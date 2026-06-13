'use client'
// Fire-and-forget notification trigger. The server route verifies the event is
// real, dedups, and sends email best-effort — so this never blocks the UI and
// failures are silent.
export function notify(payload: Record<string, unknown>): void {
  try {
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}
