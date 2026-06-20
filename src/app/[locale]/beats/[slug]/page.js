import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import { extractBeatId, slugify } from '@/lib/beat-url'
import { siteUrl, buildAlternates, ogLocale, alternateOgLocales } from '@/i18n/seo'
import { isValidLocale } from '@/i18n/config'
import BeatDetail from './BeatDetail'

// Always server-render on demand so social crawlers (which run no JS) and
// shared links get fresh, correct per-beat metadata.
export const dynamic = 'force-dynamic'

async function getBeat(slugParam) {
  const id = extractBeatId(slugParam)
  if (!id) return null
  const { data } = await supabaseAdmin
    .from('beats')
    .select('*')
    .eq('id', id)
    .single()
  return data || null
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const beat = await getBeat(slug)

  if (!beat) {
    return { title: 'Beat not found' }
  }

  const path = `/beats/${slugify(beat.title)}-${beat.id}`
  const image = beat.image_url || `${siteUrl}/og-image.png`
  const ogTitle = `${beat.title} | TR Productions`
  const description =
    locale === 'de'
      ? `${beat.genre} Type Beat, ${beat.bpm} BPM — bei TR Productions lizenzieren.`
      : `${beat.genre} Type Beat, ${beat.bpm} BPM — license at TR Productions.`

  return {
    // Root layout template adds " | TR Productions"
    title: beat.title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: 'music.song',
      title: ogTitle,
      description,
      url: `${siteUrl}${path}`,
      siteName: 'TR Productions',
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocales(locale),
      images: [{ url: image, width: 1200, height: 1200, alt: beat.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [image],
    },
  }
}

export default async function BeatDetailPage({ params }) {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) notFound()

  const beat = await getBeat(slug)
  if (!beat) notFound()

  return <BeatDetail beat={beat} locale={locale} />
}
