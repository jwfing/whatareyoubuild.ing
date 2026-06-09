export type VoteState = { voted: boolean; count: number }

export function toggleVote(s: VoteState): VoteState {
  return s.voted
    ? { voted: false, count: Math.max(s.count - 1, 0) }
    : { voted: true, count: s.count + 1 }
}
