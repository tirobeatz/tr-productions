// URL helpers for beat detail pages.
//
// A beat URL looks like: /<locale>/beats/<slug>-<uuid>
// The <slug> part is purely cosmetic — lookups always run off the trailing
// UUID, so renaming a beat never breaks an existing link.

const UUID_TAIL_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Common German/Latin characters → ASCII before stripping the rest.
const CHAR_MAP = {
  ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
  à: 'a', á: 'a', â: 'a', ã: 'a', å: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u',
  ñ: 'n', ç: 'c',
}

export function slugify(title) {
  if (!title) return 'beat'
  let s = String(title).toLowerCase().trim()
  s = s.replace(/[äöüßàáâãåéèêëíìîïóòôõúùûñç]/g, (ch) => CHAR_MAP[ch] || ch)
  // Drop any remaining diacritics, then non-alphanumerics → hyphens.
  s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return s || 'beat'
}

export function buildBeatPath(locale, beat) {
  return `/${locale}/beats/${slugify(beat?.title)}-${beat.id}`
}

// Pull the UUID off the end of the slug param. Returns null if none present.
export function extractBeatId(slugParam) {
  if (!slugParam) return null
  const match = String(slugParam).match(UUID_TAIL_RE)
  return match ? match[0] : null
}
