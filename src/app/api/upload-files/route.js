import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
const BUCKET = 'client-uploads'

// Verify booking and return upload permission
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

// Handle file upload
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const bookingId = formData.get('bookingId')
    const serviceType = formData.get('type')

    if (!file || !bookingId || !serviceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 2GB.' }, { status: 400 })
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

    // Upload to Supabase Storage
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${serviceType}/${bookingId}/${fileName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: { name: fileName, size: file.size, path }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// Delete a file
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
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
