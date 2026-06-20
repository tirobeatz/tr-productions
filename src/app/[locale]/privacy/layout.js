import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Datenschutzerklärung',
    description: 'Datenschutzerklärung von TR Productions – wie deine Daten verarbeitet werden.',
  },
  en: {
    title: 'Privacy Policy',
    description: 'Privacy policy for TR Productions — how your data is handled.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/privacy', CONTENT)
}

export default function PrivacyLayout({ children }) {
  return children
}
