import { notFound, redirect } from 'next/navigation'
import Header from '@/components/Header'
import EditProductForm from '@/components/EditProductForm'
import { getServerClient, type Product } from '@/lib/insforge'
import { getServerUser } from '@/lib/auth-server'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getServerUser()
  if (!user) redirect('/signin')

  const { data } = await getServerClient().database.from('products').select().eq('id', id).maybeSingle()
  const p = (data as Product) ?? null
  if (!p) notFound()
  if (p.author_id !== user.id) redirect(`/p/${id}`) // only the author may edit

  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-xl px-6 pt-6">
        <h1 className="masthead text-2xl">Edit product</h1>
      </div>
      <EditProductForm product={p} />
    </main>
  )
}
