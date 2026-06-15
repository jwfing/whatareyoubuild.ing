import type { MetadataRoute } from 'next'
import { getServerClient } from '@/lib/insforge'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { id: string; created_at: string; author_id: string }[] = []
  try {
    const { data } = await getServerClient()
      .database.from('products')
      .select('id, created_at, author_id')
      .order('created_at', { ascending: false })
      .limit(5000)
    products = (data ?? []) as { id: string; created_at: string; author_id: string }[]
  } catch {
    products = []
  }

  const builders = [...new Set(products.map((p) => p.author_id))]

  return [
    { url: `${SITE_URL}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/how-hot-works`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/geo-guide`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/submit`, changeFrequency: 'monthly', priority: 0.3 },
    ...products.map((p) => ({
      url: `${SITE_URL}/p/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...builders.map((uid) => ({
      url: `${SITE_URL}/u/${uid}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]
}
