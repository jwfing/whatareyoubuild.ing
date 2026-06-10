import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

// Redirect back to the SAME host the user is on (deploy URL or custom domain),
// not the build-time site URL — otherwise the session cookies land on the
// wrong host.
function originOf(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host
  const proto = request.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function GET(request: NextRequest) {
  const origin = originOf(request)
  const code = request.nextUrl.searchParams.get('insforge_code')
  const oauthError = request.nextUrl.searchParams.get('error')
  if (oauthError || !code) {
    return NextResponse.redirect(`${origin}/?error=oauth_failed`)
  }
  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('insforge_code_verifier')?.value
  if (!codeVerifier) {
    return NextResponse.redirect(`${origin}/?error=missing_verifier`)
  }
  const client = createServerClient()
  const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier)
  if (error || !data?.accessToken) {
    return NextResponse.redirect(`${origin}/?error=exchange_failed`)
  }
  const response = NextResponse.redirect(`${origin}/`)
  setAuthCookies(response.cookies, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })
  response.cookies.delete('insforge_code_verifier')
  return response
}
