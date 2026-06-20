// Server-side dictionary loader. Used by app/[locale]/layout.js to hand the
// correct dictionary down to the client I18nProvider. Static imports keep the
// JSON in the bundle (the dictionaries are small static UI copy).

import de from './dictionaries/de.json'
import en from './dictionaries/en.json'
import { defaultLocale } from './config'

const dictionaries = { de, en }

export function getDictionary(locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}
