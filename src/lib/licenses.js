// Single source of truth for the beat-license structure and availability /
// pricing rules, shared by the beats list and the beat detail page so the two
// can never drift. The license *names* are industry terms (kept English); the
// feature label *keys* are resolved per-component via t() so the copy stays
// translatable.

export const LICENSES = [
  {
    id: 'mp3',
    name: 'MP3 Lease',
    priceKey: 'price_mp3',
    featureKeys: [
      'beats.license.features.mp3File',
      'beats.license.features.streams50k',
      'beats.license.features.creditProducer',
      'beats.license.features.nonExclusive',
      'beats.license.features.split20',
    ],
  },
  {
    id: 'wav',
    name: 'WAV Lease',
    priceKey: 'price_wav',
    featureKeys: [
      'beats.license.features.wavMp3',
      'beats.license.features.streams100k',
      'beats.license.features.creditProducer',
      'beats.license.features.nonExclusive',
      'beats.license.features.split20',
    ],
  },
  {
    id: 'unlimited',
    name: 'Stems',
    priceKey: 'price_stems',
    featureKeys: [
      'beats.license.features.wavMp3Stems',
      'beats.license.features.streams250k',
      'beats.license.features.video1',
      'beats.license.features.nonExclusive',
      'beats.license.features.split20',
    ],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    priceKey: 'price_exclusive',
    featureKeys: [
      'beats.license.features.fullMaster',
      'beats.license.features.unlimitedStreams',
      'beats.license.features.removedFromStore',
      'beats.license.features.split20',
      'beats.license.features.unlimitedVideos',
    ],
    highlight: true,
  },
]

// Build the licenses array with translated feature bullets. Pass a t() fn.
export function buildLicenses(t) {
  return LICENSES.map((lic) => ({
    ...lic,
    features: lic.featureKeys.map((key) => t(key)),
  }))
}

const hasFile = (url) => url && url.trim() !== ''

// A license is available when it has a price set AND the required file(s).
export function isLicenseAvailable(beat, licenseId) {
  switch (licenseId) {
    case 'mp3':
      return beat.price_mp3 != null && beat.price_mp3 >= 0 && hasFile(beat.mp3_url)
    case 'wav':
      return beat.price_wav != null && beat.price_wav >= 0 && hasFile(beat.wav_url)
    case 'unlimited': // Stems
      return beat.price_stems != null && beat.price_stems >= 0 && hasFile(beat.stems_url)
    case 'exclusive':
      // Exclusive needs a price and at least one downloadable file.
      return beat.price_exclusive != null && beat.price_exclusive > 0 && (hasFile(beat.mp3_url) || hasFile(beat.wav_url))
    default:
      return false
  }
}

export function getLowestPrice(beat) {
  const prices = []
  if (isLicenseAvailable(beat, 'mp3')) prices.push(beat.price_mp3)
  if (isLicenseAvailable(beat, 'wav')) prices.push(beat.price_wav)
  if (isLicenseAvailable(beat, 'unlimited')) prices.push(beat.price_stems)
  if (isLicenseAvailable(beat, 'exclusive')) prices.push(beat.price_exclusive)
  return prices.length > 0 ? Math.min(...prices) : null
}
