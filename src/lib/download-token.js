import crypto from 'crypto'

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET

if (!SECRET) {
  throw new Error('DOWNLOAD_TOKEN_SECRET environment variable is required. Set it in your .env file.')
}

// Create a secure download token
export function createDownloadToken(beatId, licenseType, orderId) {
  const payload = {
    beatId,
    licenseType,
    orderId,
    created: Date.now()
  }

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url')

  return `${data}.${signature}`
}

// Verify and decode a download token
export function verifyDownloadToken(token) {
  try {
    const [data, signature] = token.split('.')

    if (!data || !signature) {
      return { valid: false, error: 'Invalid token format' }
    }

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(data)
      .digest('base64url')

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' }
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())

    return {
      valid: true,
      payload
    }
  } catch (error) {
    return { valid: false, error: 'Token verification failed' }
  }
}
