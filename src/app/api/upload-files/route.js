import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const BUCKET = 'client-uploads'

// GET: Verify booking + list files + download file
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const serviceType = searchParams.get('type')
    const download = searchParams.get('download')

    // Download a specific file
    if (download && bookingId && serviceType) {
      const path = `${serviceType}/${bookingId}/${download}`
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .download(path)

      if (error || !data) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }

      const buffer = Buffer.from(await data.arrayBuffer())
      return new Response(buffer, {
        headers: {
          'Content-Type': data.type || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${download}"`,
        }
      })
    }

    if (!bookingId || !serviceType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const table = serviceType === 'mix' ? 'mix_requests' : 'studio_bookings'

    const { data: booking, error } = await supabaseAdmin
      .from(table)
      .select('id, name, email, payment_status, track_name')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!['deposit_paid', 'invoice_sent', 'fully_paid'].includes(booking.payment_status)) {
      return NextResponse.json({ error: 'Deposit must be paid before uploading files' }, { status: 403 })
    }

    // List existing uploaded files for this booking
    const { data: files } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(`${serviceType}/${bookingId}`)

    return NextResponse.json({
      booking: {
        id: booking.id,
        name: booking.name,
        trackName: booking.track_name || null,
      },
      files: (files || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        created: f.created_at
      }))
    })
  } catch (error) {
    console.error('Upload verify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Generate a signed upload URL (client uploads directly to Supabase)
export async function POST(request) {
  try {
    const { bookingId, serviceType, fileName, contentType } = await request.json()

    if (!bookingId || !serviceType || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['mix', 'studio'].includes(serviceType)) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    // Verify booking exists and deposit is paid
    const table = serviceType === 'mix' ? 'mix_requests' : 'studio_bookings'

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from(table)
      .select('id, payment_status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!['deposit_paid', 'invoice_sent', 'fully_paid'].includes(booking.payment_status)) {
      return NextResponse.json({ error: 'Deposit must be paid before uploading' }, { status: 403 })
    }

    // Sanitize filename and create path
    // Sanitize filename: strip path separators, leading dots, and non-safe characters
    const sanitizedName = fileName
      .replace(/^\.+/, '')           // remove leading dots
      .replace(/[^a-zA-Z0-9._-]/g, '_')  // keep only safe chars
      .replace(/\.{2,}/g, '.')       // collapse multiple dots
      || 'unnamed_file'              // fallback if empty
    const path = `${serviceType}/${bookingId}/${sanitizedName}`

    // Create signed upload URL (valid for 2 hours)
    const { data, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path)

    if (signError) {
      console.error('Signed URL error:', signError)
      return NextResponse.json({ error: 'Failed to create upload URL: ' + signError.message }, { status: 500 })
    }

    if (!data?.signedUrl || !data?.token) {
      console.error('Signed URL missing data:', data)
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      fileName: sanitizedName
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }
}

// DELETE: Remove a file
export async function DELETE(request) {
  try {
    const { bookingId, serviceType, fileName } = await request.json()

    if (!bookingId || !serviceType || !fileName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const path = `${serviceType}/${bookingId}/${fileName}`

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
