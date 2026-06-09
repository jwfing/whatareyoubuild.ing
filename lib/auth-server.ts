import { cookies } from 'next/headers'

// Server-side current-user resolution for the SSR auth flow.
//
// Why this exists: the browser SDK's `getCurrentUser()` bootstraps a session by
// calling the CORE auth client's refresh, which resolves `/api/auth/refresh`
// against `baseUrl` (the InsForge backend, *.insforge.app). Our app is served
// from a different registrable domain (*.insforge.site), so the httpOnly refresh
// cookie is never sent cross-domain → 401 "No refresh token provided", and the
// app never recognizes the signed-in user. The correct SSR pattern is to read
// the user on the server (where proxy.ts/updateSession keeps the access-token
// cookie fresh) and pass it down to client components.

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  providers: string[]
  createdAt: string | null
}

type RawUser = {
  id?: string
  email?: string
  providers?: string[]
  createdAt?: string
  profile?: { name?: string | null } | null
}

export async function getServerUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get('insforge_access_token')?.value
  if (!token) return null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_INSFORGE_URL}/api/auth/sessions/current`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )
    if (!res.ok) return null
    const body = (await res.json()) as { user?: RawUser } & RawUser
    const u: RawUser = body.user ?? body
    if (!u || typeof u.id !== 'string') return null
    return {
      id: u.id,
      email: u.email ?? null,
      name: u.profile?.name ?? null,
      providers: u.providers ?? [],
      createdAt: u.createdAt ?? null,
    }
  } catch {
    return null
  }
}
