'use client'

import { createContext, useContext, useCallback, useMemo } from 'react'
import { defaultLocale } from './config'

const I18nContext = createContext({
  locale: defaultLocale,
  dict: {},
  t: (path) => path,
})

// Resolve a dot-separated path (e.g. "nav.beats") against the dictionary.
// Falls back to returning the key itself if the path is missing, so a missing
// translation is visible rather than crashing the render.
function resolve(dict, path) {
  const value = path
    .split('.')
    .reduce((obj, key) => (obj == null ? undefined : obj[key]), dict)
  return value == null ? path : value
}

export function I18nProvider({ locale, dict, children }) {
  const t = useCallback((path) => resolve(dict, path), [dict])
  const value = useMemo(() => ({ locale, dict, t }), [locale, dict, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

// Translate helper: const t = useT(); t('nav.beats')
export function useT() {
  return useContext(I18nContext).t
}

// Current active locale ('de' | 'en'), e.g. for building locale-aware links.
export function useLocale() {
  return useContext(I18nContext).locale
}
