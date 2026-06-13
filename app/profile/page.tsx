import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProfileForm from '@/components/ProfileForm'
import { getServerClient } from '@/lib/insforge'
import { getServerUser } from '@/lib/auth-server'

export default async function ProfilePage() {
  const user = await getServerUser()
  if (!user) redirect('/signin')

  // The profile carries avatar_url (often pre-filled from the Google/GitHub
  // OAuth login). Merge so the name falls back to the session name if unset.
  let profile: Record<string, unknown> = { name: user.name ?? '' }
  try {
    const { data } = await getServerClient().auth.getProfile(user.id)
    if (data?.profile) profile = { name: user.name ?? '', ...(data.profile as Record<string, unknown>) }
  } catch {
    /* fall back to the session name */
  }

  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-md px-5 py-6">
        <h1 className="masthead text-2xl">Your profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Signed in as {user.email ?? user.providers[0] ?? 'a builder'}.{' '}
          <Link href={`/u/${user.id}`} className="underline transition-colors hover:text-[var(--ink)]">
            View public profile →
          </Link>
        </p>
      </div>
      <ProfileForm initialProfile={profile} />
    </main>
  )
}
