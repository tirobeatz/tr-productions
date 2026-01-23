import './globals.css'
import Cursor from './components/Cursor'
import { SpeedInsights } from "@vercel/speed-insights/next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trproductions.de'

export const metadata = {
  // Basic metadata
  title: {
    default: 'TR Productions | Music Producer in Trier, Germany',
    template: '%s | TR Productions',
  },
  description: 'Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists. Studio sessions in Trier, Germany. Industry-ready sound.',
  keywords: ['music producer', 'beats', 'mixing', 'mastering', 'hip-hop', 'trap', 'drill', 'r&b', 'trier', 'germany', 'studio', 'recording'],
  authors: [{ name: 'TR Productions' }],
  creator: 'TR Productions',
  publisher: 'TR Productions',

  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'de_DE',
    url: siteUrl,
    siteName: 'TR Productions',
    title: 'TR Productions | Music Producer in Trier, Germany',
    description: 'Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'TR Productions - Music Producer',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'TR Productions | Music Producer',
    description: 'Professional beats, mixing & mastering for Hip-Hop, Rap, Trap, Drill, and R&B artists.',
    images: [`${siteUrl}/og-image.jpg`],
  },

  // Robots
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

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // Manifest for PWA
  manifest: '/manifest.json',

  // Verification (add your IDs when ready)
  // verification: {
  //   google: 'your-google-verification-code',
  // },

  // Canonical URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
}

// Viewport configuration (moved from metadata in Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B5CF6',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase for faster asset loading */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body>
        {children}
        <Cursor />
        <SpeedInsights />
      </body>
    </html>
  )
}
