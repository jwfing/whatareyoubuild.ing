import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminClient, adminConfigured } from '@/lib/insforge-admin'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const runtime = 'nodejs'

type Admin = ReturnType<typeof getAdminClient>

const VOTE_MILESTONES = new Set([1, 5, 10, 25, 50, 100, 250, 500, 1000])
const HOURLY_CAP = 12 // max notification emails per recipient per hour

const ok = () => NextResponse.json({ ok: true })

async function callerId(): Promise<string | null> {
  const token = (await cookies()).get('insforge_access_token')?.value
  if (!token) return null
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/api/auth/sessions/current`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!r.ok) return null
    const b = (await r.json()) as { user?: { id?: string }; id?: string }
    return b.user?.id ?? b.id ?? null
  } catch {
    return null
  }
}

async function emailFor(admin: Admin, uid: string): Promise<string | null> {
  try {
    const { data } = await admin.database.rpc('get_user_email', { uid })
    const val = typeof data === 'string' ? data : Array.isArray(data) ? data[0] : data
    return val ? String(val) : null
  } catch {
    return null
  }
}

async function nameFor(admin: Admin, uid: string): Promise<string> {
  try {
    const { data } = await admin.auth.getProfile(uid)
    return ((data?.profile as { name?: string } | undefined)?.name || '').trim() || 'a builder'
  } catch {
    return 'a builder'
  }
}

// Insert the dedup row; true only if this (kind, ref) is new.
async function claim(admin: Admin, recipientId: string, kind: string, ref: string): Promise<boolean> {
  const { data, error } = await admin.database
    .from('notification_log')
    .insert({ recipient_id: recipientId, kind, ref })
    .select()
    .maybeSingle()
  return !error && !!data
}

async function overHourlyCap(admin: Admin, recipientId: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 3_600_000).toISOString()
    const { data } = await admin.database
      .from('notification_log')
      .select('id')
      .eq('recipient_id', recipientId)
      .gte('created_at', since)
    return (data?.length ?? 0) >= HOURLY_CAP
  } catch {
    return false
  }
}

function layout(body: string, footer = `You're getting this because you have a product on ${SITE_NAME}.`): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;padding:8px;color:#111">
    <div style="font-weight:800;letter-spacing:-0.5px;font-size:18px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:18px">${SITE_NAME}</div>
    ${body}
    <p style="color:#777;font-size:12px;margin-top:28px;border-top:1px solid #ddd;padding-top:12px">${footer}</p>
  </div>`
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#111;color:#f4f1ea;text-decoration:none;font-family:monospace;font-size:13px;padding:10px 18px;margin-top:8px">${label}</a>`

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

// best-effort: dedup, cap, look up email, send. Never throws.
async function send(
  admin: Admin,
  recipientId: string,
  kind: string,
  ref: string,
  build: () => Promise<{ subject: string; html: string }>,
) {
  try {
    if (await overHourlyCap(admin, recipientId)) return
    if (!(await claim(admin, recipientId, kind, ref))) return
    const email = await emailFor(admin, recipientId)
    if (!email) return
    const { subject, html } = await build()
    await admin.emails.send({ to: email, subject, html })
  } catch {
    /* email not configured / send failed — silent by design */
  }
}

export async function POST(req: Request) {
  if (!adminConfigured()) return ok()
  const uid = await callerId()
  if (!uid) return ok()
  const body = (await req.json().catch(() => ({}))) as {
    type?: string
    commentId?: string
    productId?: string
    followingId?: string
    feedbackId?: string
  }
  const admin = getAdminClient()

  try {
    if (body.type === 'comment' && body.commentId) {
      const { data: c } = await admin.database
        .from('comments')
        .select('id, product_id, user_id, body')
        .eq('id', body.commentId)
        .maybeSingle()
      const comment = c as { id: string; product_id: string; user_id: string; body: string } | null
      if (!comment || comment.user_id !== uid) return ok() // must be the commenter
      const { data: p } = await admin.database
        .from('products')
        .select('id, name, author_id')
        .eq('id', comment.product_id)
        .maybeSingle()
      const prod = p as { id: string; name: string; author_id: string } | null
      if (!prod || prod.author_id === uid) return ok() // don't notify on your own comment
      await send(admin, prod.author_id, 'comment', comment.id, async () => ({
        subject: `New comment on ${prod.name}`,
        html: layout(
          `<p style="font-size:16px"><b>${esc(await nameFor(admin, uid))}</b> left feedback on <b>${esc(prod.name)}</b>:</p>
           <blockquote style="border-left:3px solid #111;margin:14px 0;padding:4px 0 4px 14px;color:#333;font-style:italic">${esc(comment.body)}</blockquote>
           ${btn(`${SITE_URL}/p/${prod.id}`, 'Reply on the product page →')}`,
        ),
      }))
    } else if (body.type === 'vote' && body.productId) {
      const { data: p } = await admin.database
        .from('products')
        .select('id, name, author_id, vote_count')
        .eq('id', body.productId)
        .maybeSingle()
      const prod = p as { id: string; name: string; author_id: string; vote_count: number } | null
      if (!prod || prod.author_id === uid) return ok()
      if (!VOTE_MILESTONES.has(prod.vote_count)) return ok()
      await send(admin, prod.author_id, 'vote', `${prod.id}:${prod.vote_count}`, async () => ({
        subject: `${prod.name} just hit ${prod.vote_count} upvote${prod.vote_count === 1 ? '' : 's'} 🎉`,
        html: layout(
          `<p style="font-size:16px"><b>${esc(prod.name)}</b> reached <b>${prod.vote_count} upvote${prod.vote_count === 1 ? '' : 's'}</b> on ${SITE_NAME}. Nice work.</p>
           ${btn(`${SITE_URL}/p/${prod.id}`, 'See it →')}`,
        ),
      }))
    } else if (body.type === 'follow' && body.followingId) {
      const { data: f } = await admin.database
        .from('follows')
        .select('follower_id')
        .eq('follower_id', uid)
        .eq('following_id', body.followingId)
        .maybeSingle()
      if (!f) return ok() // must actually be following
      const followerName = await nameFor(admin, uid)
      await send(admin, body.followingId, 'follow', `${uid}:${body.followingId}`, async () => ({
        subject: `${followerName} is now following you on ${SITE_NAME}`,
        html: layout(
          `<p style="font-size:16px"><b>${esc(followerName)}</b> just followed you on ${SITE_NAME}.</p>
           ${btn(`${SITE_URL}/u/${uid}`, 'See their profile →')}`,
        ),
      }))
    } else if (body.type === 'feedback' && body.feedbackId) {
      const to = process.env.FEEDBACK_EMAIL
      if (!to) return ok() // no destination configured — silently skip
      const { data: fb } = await admin.database
        .from('feedback')
        .select('id, user_id, body, images')
        .eq('id', body.feedbackId)
        .maybeSingle()
      const feedback = fb as { id: string; user_id: string; body: string; images: { url: string; key: string }[] } | null
      if (!feedback || feedback.user_id !== uid) return ok() // must be the submitter
      try {
        // dedup by feedback id; recipient_id = submitter doubles as a per-user rate limit
        if (await overHourlyCap(admin, uid)) return ok()
        if (!(await claim(admin, uid, 'feedback', feedback.id))) return ok()
        const fromEmail = await emailFor(admin, uid)
        const fromName = await nameFor(admin, uid)
        const imgs = Array.isArray(feedback.images) ? feedback.images : []
        const imgHtml = imgs.length
          ? `<div style="margin-top:14px">${imgs
              .map((i) => `<a href="${i.url}"><img src="${i.url}" alt="" style="max-width:160px;border:1px solid #ddd;margin:4px 4px 0 0" /></a>`)
              .join('')}</div>`
          : ''
        await admin.emails.send({
          to,
          ...(fromEmail ? { replyTo: fromEmail } : {}),
          subject: `Feedback from ${fromName}`,
          html: layout(
            `<p style="font-size:16px"><b>${esc(fromName)}</b>${fromEmail ? ` (${esc(fromEmail)})` : ''} sent feedback:</p>
             <blockquote style="border-left:3px solid #111;margin:14px 0;padding:4px 0 4px 14px;color:#333;white-space:pre-wrap">${esc(feedback.body)}</blockquote>
             ${imgHtml}`,
            fromEmail ? `Reply to this email to respond directly to ${esc(fromName)}.` : 'Sender email unavailable.',
          ),
        })
      } catch {
        /* email not configured / send failed — silent */
      }
    }
  } catch {
    /* best-effort */
  }
  return ok()
}
