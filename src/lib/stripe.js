import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const LICENSE_DETAILS = {
  mp3: {
    name: 'MP3 Lease',
    files: ['mp3'],
    streams: '100,000',
    credit: true,
    exclusive: false,
    description: 'MP3 file with up to 100,000 streams'
  },
  wav: {
    name: 'WAV Lease',
    files: ['mp3', 'wav'],
    streams: '500,000',
    credit: true,
    exclusive: false,
    description: 'WAV + MP3 files with up to 500,000 streams'
  },
  unlimited: {
    name: 'Unlimited Lease',
    files: ['mp3', 'wav', 'stems'],
    streams: 'Unlimited',
    credit: true,
    exclusive: false,
    description: 'WAV + MP3 + Stems with unlimited streams'
  },
  exclusive: {
    name: 'Exclusive Rights',
    files: ['mp3', 'wav', 'stems'],
    streams: 'Unlimited',
    credit: false,
    exclusive: true,
    description: 'Full exclusive ownership rights'
  }
}
