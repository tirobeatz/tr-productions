import '../globals.css'
import { notFound } from 'next/navigation'
import SmoothScroll from '@/app/components/SmoothScroll'
import CustomCursor from '@/app/components/animations/Cursor'
import PageTransitionProvider from '@/app/components/PageTransitionProvider'
import { PageLoaderProvider } from '@/app/components/PageLoader'
import CookieBanner from '@/app/components/CookieBanner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { I18nProvider } from '@/i18n/I18nProvider'
import { getDictionary } from '@/i18n/dictionaries'
import { locales, isValidLocale } from '@/i18n/config'
import { siteUrl, ogLocale, alternateOgLocales, buildAlternates } from '@/i18n/seo'

// Pre-render both locales at build time.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// Localized root/home metadata + hreflang. Per-page metadata (beats, about, …)
// is layered on top by each page's own layout.js generateMetadata.
const ROOT_META = {
  de: {
    title: 'TR Productions | Musikproduzent in Trier',
    description:
      'Professionelle Beats, Mixing & Mastering für Hip-Hop-, Rap-, Trap-, Drill- und R&B-Artists. Studio-Sessions in Trier. Sound auf Industrieniveau.',
    keywords: ['Musikproduzent', 'Beats kaufen', 'Mixing', 'Mastering', 'Hip-Hop', 'Trap', 'Drill', 'R&B', 'Trier', 'Tonstudio', 'Recording'],
    ogTitle: 'TR Productions | Musikproduzent in Trier',
    ogDescription:
      'Professionelle Beats, Mixing & Mastering für Hip-Hop-, Rap-, Trap-, Drill- und R&B-Artists.',
    twitterTitle: 'TR Productions | Musikproduzent',
    imageAlt: 'TR Productions – Musikproduzent',
  },
  en: {
    title: 'TR Productions | Music Producer in Trier, Germany',
    description:
      'Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists. Studio sessions in Trier, Germany. Industry-ready sound.',
    keywords: ['music producer', 'beats', 'mixing', 'mastering', 'hip-hop', 'trap', 'drill', 'r&b', 'trier', 'germany', 'studio', 'recording'],
    ogTitle: 'TR Productions | Music Producer in Trier, Germany',
    ogDescription:
      'Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists.',
    twitterTitle: 'TR Productions | Music Producer',
    imageAlt: 'TR Productions - Music Producer',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  const m = ROOT_META[locale] || ROOT_META.de

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: m.title,
      template: '%s | TR Productions',
    },
    description: m.description,
    keywords: m.keywords,
    authors: [{ name: 'TR Productions' }],
    creator: 'TR Productions',
    publisher: 'TR Productions',
    alternates: buildAlternates(locale, ''),
    openGraph: {
      type: 'website',
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocales(locale),
      url: `${siteUrl}/${locale}`,
      siteName: 'TR Productions',
      title: m.ogTitle,
      description: m.ogDescription,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: m.imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.twitterTitle,
      description: m.ogDescription,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B5CF6',
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  if (!isValidLocale(locale)) {
    notFound()
  }

  const dict = getDictionary(locale)

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to Supabase for faster asset loading */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        {/* LocalBusiness structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RecordingStudio",
            "name": "TR Productions",
            "description": "Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists. Studio sessions available.",
            "url": siteUrl,
            "logo": `${siteUrl}/og-image.png`,
            "image": `${siteUrl}/og-image.png`,
            "genre": ["Hip-Hop", "Rap", "Trap", "Drill", "R&B"],
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Trier",
              "addressCountry": "DE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 49.749,
              "longitude": 6.637
            },
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": { "@type": "GeoCoordinates", "latitude": 49.749, "longitude": 6.637 },
              "geoRadius": "50000"
            },
            "priceRange": "€€",
            "makesOffer": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Beat Production", "description": "Custom and pre-made beats for Hip-Hop, Trap, Drill, and R&B" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mixing & Mastering", "description": "Professional mixing and mastering services" }},
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Studio Recording", "description": "Recording studio sessions in Trier, Germany" }}
            ],
            "sameAs": [
              "https://www.instagram.com/tr.productionz/",
              "https://www.youtube.com/@trproductionz",
              "https://www.tiktok.com/@trproductions"
            ]
          })}}
        />
      </head>
      <body>
        <I18nProvider locale={locale} dict={dict}>
          <PageLoaderProvider>
            <SmoothScroll>
              <PageTransitionProvider>
                {children}
              </PageTransitionProvider>
            </SmoothScroll>
            <CustomCursor />
            <CookieBanner />
          </PageLoaderProvider>
        </I18nProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
