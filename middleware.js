import { NextResponse } from 'next/server'
import {
  locales,
  defaultLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from '@/i18n/config'

// Paths that must NOT be localized: APIs, admin tooling, the upload route,
// the Stripe/booking success flows, and Next.js internals / static files.
function isExcludedPath(pathname) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/upload') ||
    pathname.startsWith('/purchase') ||
    pathname.startsWith('/booking') ||
    pathname.startsWith('/_next') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    // Any path with a file extension (e.g. .png, .svg, .json) is a static asset.
    /\.[^/]+$/.test(pathname)
  )
}

function pathLocale(pathname) {
  const segment = pathname.split('/')[1]
  return locales.includes(segment) ? segment : null
}

// Pick the best locale for a visitor with no locale prefix:
// 1) an existing NEXT_LOCALE cookie, 2) the Accept-Language header, 3) default.
function detectLocale(request) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale

  const accept = request.headers.get('accept-language')
  if (accept) {
    const preferred = accept
      .split(',')
      .map((part) => part.split(';')[0].trim().toLowerCase())
    for (const lang of preferred) {
      const base = lang.split('-')[0]
      if (locales.includes(base)) return base
    }
  }

  return defaultLocale
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (isExcludedPath(pathname)) {
    return NextResponse.next()
  }

  const current = pathLocale(pathname)

  // Already locale-prefixed → let it through, but keep the cookie in sync so
  // the next unprefixed visit (and the language switcher) remembers the choice.
  if (current) {
    const response = NextResponse.next()
    if (request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: '/',
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
    }
    return response
  }

  // No locale prefix (e.g. "/", "/beats") → redirect to the detected locale.
  // Temporary (307) because the target varies per visitor (cookie /
  // Accept-Language); old links like /beats keep working via this redirect.
  const locale = detectLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  const response = NextResponse.redirect(url, 307)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  // Run on everything except Next internals and files with an extension.
  // Fine-grained exclusions are handled in isExcludedPath above.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
