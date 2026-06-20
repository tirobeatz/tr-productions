import { pageMetadata } from '@/i18n/seo'

const CONTENT = {
  de: {
    title: 'Über mich',
    description:
      'Erfahre mehr über TR Productions – die Geschichte, den Weg und die Leidenschaft hinter der Musik. Ansässig in Trier.',
    ogTitle: 'Über mich | TR Productions',
    ogDescription:
      'Erfahre mehr über TR Productions – die Geschichte, den Weg und die Leidenschaft hinter der Musik.',
  },
  en: {
    title: 'About',
    description:
      'Learn about TR Productions — the story, the journey, and the passion behind the music. Based in Trier, Germany.',
    ogTitle: 'About | TR Productions',
    ogDescription:
      'Learn about TR Productions — the story, the journey, and the passion behind the music.',
  },
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  return pageMetadata(locale, '/about', CONTENT)
}

export default function AboutLayout({ children }) {
  return children
}
