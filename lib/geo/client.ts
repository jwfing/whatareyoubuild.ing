'use client'
// Browser-side helpers: the heavy lifting runs in /api/geo-check; persistence
// goes through the authenticated browser client so RLS gates ownership.
import { getBrowserClient } from '@/lib/insforge'
import type { GeoRow } from './types'

export async function runGeoCheck(productId: string): Promise<GeoRow> {
  const res = await fetch('/api/geo-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  })
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
    throw new Error(b?.message || b?.error || `Check failed (${res.status})`)
  }
  const { report, healthScore, footprintScore } = await res.json()

  const { data, error } = await getBrowserClient()
    .database.from('product_geo_reports')
    .insert({ product_id: productId, report, health_score: healthScore, footprint_score: footprintScore })
    .select()
    .single()
  if (error || !data) throw new Error('Could not save the report.')
  return data as GeoRow
}

export async function loadGeoHistory(productId: string): Promise<GeoRow[]> {
  const { data } = await getBrowserClient()
    .database.from('product_geo_reports')
    .select()
    .eq('product_id', productId)
    .order('checked_at', { ascending: false })
  return (data ?? []) as GeoRow[]
}
