'use client'
import { useEffect } from 'react'
import { track } from '@/lib/posthog'

export default function PageView({ productId }: { productId: string }) {
  useEffect(() => { track.productPageViewed(productId) }, [productId])
  return null
}
