import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Mixing & Mastering',
    description:
      'Professionelles Mixing & Mastering für Artists. Hol das Maximum aus deinen Tracks – radiotauglicher Sound von TR Productions in Trier.',
    ogTitle: 'Mixing & Mastering | TR Productions',
    ogDescription:
      'Professionelles Mixing & Mastering für Artists. Hol das Maximum aus deinen Tracks – radiotauglicher Sound.',
  },
  en: {
    title: 'Mixing & Mastering',
    description:
      'Professional mixing and mastering services for artists. Get your tracks radio-ready with TR Productions in Trier, Germany.',
    ogTitle: 'Mixing & Mastering | TR Productions',
    ogDescription:
      'Professional mixing and mastering services for artists. Get your tracks radio-ready.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/mixing', CONTENT)
}

export default function MixingLayout({ children }) {
  return children
}
