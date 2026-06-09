import { describe, it, expect } from 'vitest'
import { timeAgo } from '@/lib/format'

describe('timeAgo', () => {
  const now = new Date('2026-06-08T12:00:00Z').getTime()
  it('shows minutes', () => {
    expect(timeAgo('2026-06-08T11:30:00Z', now)).toBe('30m ago')
  })
  it('shows hours', () => {
    expect(timeAgo('2026-06-08T09:00:00Z', now)).toBe('3h ago')
  })
  it('shows days', () => {
    expect(timeAgo('2026-06-06T12:00:00Z', now)).toBe('2d ago')
  })
})
