import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Beats kaufen',
    description:
      'Exklusive und Non-Exclusive Beats für Hip-Hop, Rap, Trap, Drill und R&B durchstöbern und kaufen. Sofortige Lieferung, professionelle Qualität von TR Productions.',
    ogTitle: 'Beats kaufen | TR Productions',
    ogDescription:
      'Exklusive und Non-Exclusive Beats für Hip-Hop, Rap, Trap, Drill und R&B – durchstöbern und kaufen.',
  },
  en: {
    title: 'Buy Beats Online',
    description:
      'Browse and buy exclusive and non-exclusive beats for Hip-Hop, Rap, Trap, Drill, and R&B. Instant delivery, professional quality by TR Productions.',
    ogTitle: 'Buy Beats Online | TR Productions',
    ogDescription:
      'Browse and buy exclusive and non-exclusive beats for Hip-Hop, Rap, Trap, Drill, and R&B.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/beats', CONTENT)
}

export default function BeatsLayout({ children }) {
  return children
}
