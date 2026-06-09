import { describe, it, expect } from 'vitest'
import { toggleVote } from '@/lib/vote'

describe('toggleVote', () => {
  it('adds a vote when not yet voted', () => {
    expect(toggleVote({ voted: false, count: 4 })).toEqual({ voted: true, count: 5 })
  })
  it('removes a vote when already voted', () => {
    expect(toggleVote({ voted: true, count: 5 })).toEqual({ voted: false, count: 4 })
  })
  it('never drops below zero', () => {
    expect(toggleVote({ voted: true, count: 0 })).toEqual({ voted: false, count: 0 })
  })
})
