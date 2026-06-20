import { NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { rateLimit } from '@/lib/rate-limit'

// Where request notifications are sent
const RECIPIENTS = {
  mix: process.env.MIX_REQUEST_EMAIL || 'mixmaster@trproductions.de',
  studio: process.env.STUDIO_REQUEST_EMAIL || 'studio@trproductions.de',
}

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function buildRows(fields) {
  return fields
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px;color:#888;font-size:13px;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;color:#111;font-size:14px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('')
}

export async function POST(request) {
  try {
    // Basic rate limiting per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const { limited } = rateLimit({ key: `service-request:${ip}`, limit: 5, window: 60 * 1000 })
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { type, name, email } = body

    if (!type || !['mix', 'studio'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const isMix = type === 'mix'
    const recipient = RECIPIENTS[type]

    // Fields shown in the notification email
    const fields = isMix
      ? [
          ['Name', body.name],
          ['Email', body.email],
          ['Track', body.trackName],
          ['Genre', body.genre],
          ['Reference', body.reference],
          ['Rush delivery', body.rushDelivery ? 'Yes (+€30)' : 'No'],
          ['Indicative price', body.totalPrice ? `€${body.totalPrice}` : null],
          ['Notes', body.notes],
        ]
      : [
          ['Name', body.name],
          ['Email', body.email],
          ['Phone', body.phone],
          ['Service', body.service],
          ['Preferred date/time', body.preferredTime],
          ['Message', body.message],
        ]

    const heading = isMix ? 'New Mix & Master request' : 'New studio session request'
    const subject = isMix
      ? `Mix & Master request — ${body.trackName || name}`
      : `Studio session request — ${name}`

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#8B5CF6;margin-bottom:4px;">${heading}</h2>
        <p style="color:#666;font-size:13px;margin-top:0;">Sent from trproductions.de</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          ${buildRows(fields)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;">Reply directly to this email to reach ${escapeHtml(name)}.</p>
      </div>
    `

    // Notify the studio
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      replyTo: email,
      subject,
      html,
    })

    if (sendError) {
      console.error('Service request email failed:', sendError)
      return NextResponse.json({ error: 'Failed to send request. Please email us directly.' }, { status: 500 })
    }

    // Confirmation to the customer (best-effort, never blocks)
    const filesAddress = isMix ? RECIPIENTS.mix : RECIPIENTS.studio
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: isMix ? 'We got your Mix & Master request' : 'We got your studio request',
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#8B5CF6;">Thanks, ${escapeHtml(name)}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6;">
              Your ${isMix ? 'mix & master' : 'studio session'} request came through. I'll get back to you within 24 hours.
            </p>
            ${
              isMix
                ? `<p style="color:#333;font-size:15px;line-height:1.6;">When you're ready, send your audio files (WAV preferred) or a WeTransfer link to
                   <a href="mailto:${filesAddress}" style="color:#8B5CF6;">${filesAddress}</a>.</p>`
                : `<p style="color:#333;font-size:15px;line-height:1.6;">Any questions in the meantime? Just reply to this email or write to
                   <a href="mailto:${filesAddress}" style="color:#8B5CF6;">${filesAddress}</a>.</p>`
            }
            <p style="color:#888;font-size:13px;margin-top:24px;">— TR Productions</p>
          </div>
        `,
      })
    } catch (e) {
      console.error('Customer confirmation email failed (non-blocking):', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Service request error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
