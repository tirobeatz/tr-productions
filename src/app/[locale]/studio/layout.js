import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Studio-Sessions',
    description:
      'Buche Aufnahme-Sessions im Tonstudio in Trier. Professionelles Equipment, entspannte Atmosphäre. Ideal für Vocals, Podcasts und Musikproduktion.',
    ogTitle: 'Studio-Sessions | TR Productions',
    ogDescription:
      'Buche Aufnahme-Sessions im Tonstudio in Trier. Professionelles Equipment, entspannte Atmosphäre.',
  },
  en: {
    title: 'Studio Sessions',
    description:
      'Book recording studio sessions in Trier, Germany. Professional equipment, comfortable environment. Perfect for vocals, podcasts, and music production.',
    ogTitle: 'Studio Sessions | TR Productions',
    ogDescription:
      'Book recording studio sessions in Trier, Germany. Professional equipment, comfortable environment.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/studio', CONTENT)
}

export default function StudioLayout({ children }) {
  return children
}
