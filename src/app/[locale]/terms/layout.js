import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'AGB',
    description: 'Allgemeine Geschäftsbedingungen von TR Productions für Beats, Mixing und Studio.',
  },
  en: {
    title: 'Terms & Conditions',
    description: 'Terms & Conditions for TR Productions — beats, mixing, and studio services.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/terms', CONTENT)
}

export default function TermsLayout({ children }) {
  return children
}
