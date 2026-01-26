// Spotify API utilities
// Uses Spotify's oEmbed API (no authentication required) for basic track info
// For full API access, you'd need to set up OAuth with client credentials

/**
 * Extract Spotify track/album ID from URL
 * Supports: open.spotify.com/track/xxx, open.spotify.com/album/xxx, spotify:track:xxx
 */
export function extractSpotifyId(url) {
  if (!url) return null

  // Handle spotify:track:xxx format
  const uriMatch = url.match(/spotify:(track|album):([a-zA-Z0-9]+)/)
  if (uriMatch) return { type: uriMatch[1], id: uriMatch[2] }

  // Handle open.spotify.com/track/xxx or open.spotify.com/album/xxx
  const urlMatch = url.match(/open\.spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/)
  if (urlMatch) return { type: urlMatch[1], id: urlMatch[2] }

  // Handle embed URLs
  const embedMatch = url.match(/embed\/(track|album)\/([a-zA-Z0-9]+)/)
  if (embedMatch) return { type: embedMatch[1], id: embedMatch[2] }

  return null
}

/**
 * Fetch track/album data from Spotify oEmbed API
 * This doesn't require authentication!
 */
export async function fetchSpotifyData(spotifyUrl) {
  try {
    const extracted = extractSpotifyId(spotifyUrl)
    if (!extracted) {
      throw new Error('Invalid Spotify URL')
    }

    const { type, id } = extracted

    // Use Spotify oEmbed API (no auth required)
    const oEmbedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`
    const response = await fetch(oEmbedUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch from Spotify')
    }

    const data = await response.json()

    // Parse title - oEmbed returns "Song Name by Artist Name"
    let title = data.title || ''
    let artist = ''

    if (title.includes(' by ')) {
      const parts = title.split(' by ')
      title = parts[0]
      artist = parts.slice(1).join(' by ') // Handle "by" in artist names
    }

    return {
      success: true,
      data: {
        spotify_id: id,
        spotify_url: `https://open.spotify.com/${type}/${id}`,
        title: title.trim(),
        artist: artist.trim(),
        cover_image: data.thumbnail_url || null,
        type: type,
        provider: data.provider_name,
        embed_url: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
      }
    }
  } catch (error) {
    console.error('Spotify fetch error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch Spotify data'
    }
  }
}

/**
 * Get Spotify embed URL for iframe
 */
export function getSpotifyEmbedUrl(spotifyUrl, options = {}) {
  const extracted = extractSpotifyId(spotifyUrl)
  if (!extracted) return null

  const { type, id } = extracted
  const theme = options.theme || '0' // 0 = dark theme
  const compact = options.compact ? '&compact=1' : ''

  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${theme}${compact}`
}

/**
 * Validate if a string is a valid Spotify URL
 */
export function isValidSpotifyUrl(url) {
  return extractSpotifyId(url) !== null
}
