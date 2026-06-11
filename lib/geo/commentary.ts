// The AI-coach layer: an encouraging, concrete read of both other layers.
import 'server-only'
import { chat, parseJson, GEO_FAST_MODEL, aiConfigured } from './openrouter'
import type { Commentary, FootprintLayer, HealthLayer } from './types'

export async function buildCommentary(input: {
  name: string
  tagline: string
  health: HealthLayer
  footprint: FootprintLayer
}): Promise<Commentary | null> {
  if (!aiConfigured()) return null
  try {
    const issues = input.health.items.filter((i) => i.status !== 'done').map((i) => i.label)
    const fp = input.footprint
    const user = `You are a GEO/AEO (generative engine optimization) coach for indie makers. Be specific, encouraging, and concrete — no fluff, no hype.

Product: ${input.name} — ${input.tagline}
On-page issues to fix: ${issues.join(', ') || 'none'}
AI footprint: ${fp.available ? `mentioned in ${fp.visibility.mentions}/${fp.visibility.probes} test answers; share of voice ${fp.shareOfVoice.score}%; cited in ${fp.citations.count}/${fp.citations.probes} answers` : 'not measured'}.

Return ONLY JSON: {"aiDescription":"<2-3 sentences describing how an AI assistant would characterize this product TODAY if a user asked about it, honest about whether it would surface yet given the footprint above>","improvements":["<the 3 highest-leverage next actions, each one specific sentence>"]}`

    const { content } = await chat({
      model: GEO_FAST_MODEL,
      system: 'Respond ONLY with valid JSON.',
      user,
      json: true,
      maxTokens: 400,
    })
    const j = parseJson<Commentary>(content)
    if (!j) return null
    return {
      aiDescription: String(j.aiDescription || '').trim(),
      improvements: (j.improvements || []).filter(Boolean).slice(0, 3),
    }
  } catch {
    return null
  }
}
