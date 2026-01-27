import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const LICENSE_DETAILS = {
  mp3: {
    name: 'MP3 Lease',
    files: ['mp3'],
    streams: '50,000',
    credit: true,
    exclusive: false,
    publishingSplit: '20%',
    description: 'MP3 file with up to 50,000 streams. 20% publishing split to producer.'
  },
  wav: {
    name: 'WAV Lease',
    files: ['mp3', 'wav'],
    streams: '100,000',
    credit: true,
    exclusive: false,
    publishingSplit: '20%',
    description: 'WAV + MP3 files with up to 100,000 streams. 20% publishing split to producer.'
  },
  unlimited: {
    name: 'Stems License',
    files: ['mp3', 'wav', 'stems'],
    streams: '250,000',
    credit: true,
    exclusive: false,
    publishingSplit: '20%',
    description: 'WAV + MP3 + Stems with up to 250,000 streams. 20% publishing split to producer.'
  },
  exclusive: {
    name: 'Exclusive Rights',
    files: ['mp3', 'wav', 'stems'],
    streams: 'Unlimited',
    credit: false,
    exclusive: true,
    publishingSplit: '20%',
    description: 'Full exclusive ownership. 20% publishing split to producer.'
  }
}
