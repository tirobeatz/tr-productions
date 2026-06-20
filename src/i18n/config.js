// Central i18n configuration. Imported by middleware, layouts, and client hooks.
// Keep this file dependency-free (no React, no JSON) so it can run in the
// middleware (edge/runtime) bundle without pulling in extra weight.

export const locales = ['de', 'en']
export const defaultLocale = 'de'

// Cookie used to remember the visitor's locale choice across requests.
export const LOCALE_COOKIE = 'NEXT_LOCALE'

// 1 year, in seconds.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isValidLocale(locale) {
  return locales.includes(locale)
}
