'use client'

import Link from 'next/link'
import { useT, useLocale } from '@/i18n/I18nProvider'

export default function NotFound() {
  const t = useT()
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-[#8B5CF6] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">{t('notFound.title')}</h2>
        <p className="text-gray-400 mb-8">
          {t('notFound.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/${locale}`}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            {t('notFound.backHome')}
          </Link>
          <Link
            href={`/${locale}/beats`}
            className="bg-white/5 hover:bg-white/10 text-gray-300 font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            {t('notFound.browseBeats')}
          </Link>
        </div>
      </div>
    </div>
  )
}
