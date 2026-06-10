import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import ProfileForm from '@/components/ProfileForm'
import { getServerUser } from '@/lib/auth-server'

export default async function ProfilePage() {
  const user = await getServerUser()
  if (!user) redirect('/signin')

  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-md px-5 py-6">
        <h1 className="masthead text-2xl">Your profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Signed in as {user.email ?? user.providers[0] ?? 'a builder'}.
        </p>
      </div>
      <ProfileForm initialName={user.name ?? ''} />
    </main>
  )
}
