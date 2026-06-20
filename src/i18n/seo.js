// SEO helpers shared by the localized layouts. Centralizes hreflang/canonical
// and OpenGraph locale logic so every page emits consistent alternates.

import { locales, defaultLocale } from './config'

// Keep the same default host the original root layout used for metadataBase.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://trproductions.de'

const OG_LOCALE = { de: 'de_DE', en: 'en_US' }

export function ogLocale(locale) {
  return OG_LOCALE[locale] || OG_LOCALE[defaultLocale]
}

export function alternateOgLocales(locale) {
  return locales.filter((l) => l !== locale).map(ogLocale)
}

// Build `alternates` for a page. `path` is the locale-less path, e.g. '/beats'
// (use '' for the home page). Emits canonical for the active locale plus
// hreflang languages for every locale and x-default → defaultLocale.
export function buildAlternates(locale, path = '') {
  const languages = {}
  for (const l of locales) {
    languages[l] = `/${l}${path}`
  }
  languages['x-default'] = `/${defaultLocale}${path}`

  return {
    canonical: `/${locale}${path}`,
    languages,
  }
}

// Build a full per-page metadata object (title, description, hreflang, OG).
// `content` is { de: {...}, en: {...} } with title/description and optional
// ogTitle/ogDescription. Used by each page's layout.js generateMetadata.
export function pageMetadata(locale, path, content) {
  const c = content[locale] || content[defaultLocale]

  return {
    title: c.title,
    description: c.description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      title: c.ogTitle || `${c.title} | TR Productions`,
      description: c.ogDescription || c.description,
      url: `${siteUrl}/${locale}${path}`,
      siteName: 'TR Productions',
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocales(locale),
    },
  }
}
