import { locales, defaultLocale } from '@/i18n/config'

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trproductions.de'

  // Locale-less paths with their SEO weighting. (/datenschutz is omitted — it
  // only redirects to /privacy and shouldn't be indexed.)
  const pages = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/beats', changeFrequency: 'daily', priority: 0.9 },
    { path: '/mixing', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/studio', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/impressum', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const lastModified = new Date()

  // One entry per locale per page, each carrying hreflang alternates
  // (every locale + x-default → defaultLocale).
  return pages.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, `${siteUrl}/${l}${path}`])
    )
    languages['x-default'] = `${siteUrl}/${defaultLocale}${path}`

    return locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    }))
  })
}
