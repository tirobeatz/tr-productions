import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Impressum',
    description: 'Impressum und rechtliche Angaben zu TR Productions, Musikproduzent in Trier.',
  },
  en: {
    title: 'Legal Notice',
    description: 'Legal notice and provider information for TR Productions, music producer in Trier, Germany.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/impressum', CONTENT)
}

export default function ImpressumLayout({ children }) {
  return children
}
