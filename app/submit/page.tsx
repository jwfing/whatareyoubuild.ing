import Header from '@/components/Header'
import SubmitForm from '@/components/SubmitForm'
import { getServerUser } from '@/lib/auth-server'

export default async function SubmitPage() {
  const user = await getServerUser()
  return <main><Header user={user} /><SubmitForm authed={!!user} /></main>
}
