import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Kontakt',
    description:
      'Nimm Kontakt mit TR Productions auf – für Bookings, Kollaborationen oder Fragen. Ansässig in Trier.',
    ogTitle: 'Kontakt | TR Productions',
    ogDescription:
      'Nimm Kontakt mit TR Productions auf – für Bookings, Kollaborationen oder Fragen.',
  },
  en: {
    title: 'Contact',
    description:
      'Get in touch with TR Productions for bookings, collaborations, or questions. Based in Trier, Germany.',
    ogTitle: 'Contact | TR Productions',
    ogDescription:
      'Get in touch with TR Productions for bookings, collaborations, or questions.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/contact', CONTENT)
}

export default function ContactLayout({ children }) {
  return children
}
