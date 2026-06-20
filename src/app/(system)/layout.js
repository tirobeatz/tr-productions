// Second root layout (multiple-root-layout pattern). Serves the non-localized
// system routes: /admin, /upload, /purchase/success, /booking/success. These
// keep their own <html><body> so there is no nested/duplicate <html>.
import '../globals.css'
import SmoothScroll from '@/app/components/SmoothScroll'
import CustomCursor from '@/app/components/animations/Cursor'
import PageTransitionProvider from '@/app/components/PageTransitionProvider'
import { PageLoaderProvider } from '@/app/components/PageLoader'
import CookieBanner from '@/app/components/CookieBanner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { siteUrl } from '@/i18n/seo'

export const metadata = {
  metadataBase: new URL(siteUrl),
  // System tooling and post-checkout pages must never be indexed.
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B5CF6',
}

export default function SystemLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PageLoaderProvider>
          <SmoothScroll>
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
          </SmoothScroll>
          <CustomCursor />
          <CookieBanner />
        </PageLoaderProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
