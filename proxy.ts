import { NextResponse, type NextRequest } from 'next/server'
import { updateSession, type CookieStore, type CookieOptions } from '@insforge/sdk/ssr'

// Derive Next's cookie jar types from the public API surface so we avoid
// importing internal `next/dist/...` paths.
type RequestCookies = NextRequest['cookies']
type ResponseCookies = ReturnType<typeof NextResponse.next>['cookies']

// Next 16's RequestCookies/ResponseCookies are structurally close to the SDK's
// CookieStore, but their `set` overloads differ enough that they aren't directly
// assignable, so we wrap each in a thin adapter that satisfies CookieStore.
// updateSession only needs to READ the request cookies; it writes the real
// Set-Cookie headers through the response cookies (which do carry options).
function requestCookieStore(cookies: RequestCookies): CookieStore {
  return {
    get: (name) => cookies.get(name),
    // Request cookies are read-only in practice; options are not serialized.
    set: (
      nameOrOptions: string | { name: string; value: string },
      value?: string,
    ) => {
      if (typeof nameOrOptions === 'string') {
        return cookies.set(nameOrOptions, value ?? '')
      }
      return cookies.set(nameOrOptions.name, nameOrOptions.value)
    },
    delete: (nameOrOptions: string | { name: string }) =>
      cookies.delete(typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name),
  }
}

function responseCookieStore(cookies: ResponseCookies): CookieStore {
  return {
    get: (name) => cookies.get(name),
    set: (
      nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
      value?: string,
      options?: CookieOptions,
    ) => {
      if (typeof nameOrOptions === 'string') {
        return cookies.set(nameOrOptions, value ?? '', options)
      }
      const { name, value: v, ...opts } = nameOrOptions
      return cookies.set({ name, value: v, ...opts })
    },
    delete: (nameOrOptions: string | { name: string }) =>
      cookies.delete(typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name),
  }
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  await updateSession({
    requestCookies: requestCookieStore(request.cookies),
    responseCookies: responseCookieStore(response.cookies),
  })
  return response
}

export const config = {
  // run on app routes, skip static assets and the refresh endpoint
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/refresh).*)'],
}
