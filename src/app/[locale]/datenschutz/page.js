// Redirect /[locale]/datenschutz to the localized privacy page.
import { redirect } from 'next/navigation'

export default async function DatenschutzPage({ params }) {
  const { locale } = await params
  redirect(`/${locale}/privacy`)
}
