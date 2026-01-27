import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyDownloadToken } from '@/lib/download-token'
import { LICENSE_DETAILS } from '@/lib/stripe'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const fileType = searchParams.get('file') // mp3, wav, or stems

    if (!token) {
      return NextResponse.json({ error: 'Missing download token' }, { status: 400 })
    }

    // Verify token
    const { valid, payload, error } = verifyDownloadToken(token)

    if (!valid) {
      return NextResponse.json({ error: error || 'Invalid token' }, { status: 401 })
    }

    const { beatId, licenseType, orderId } = payload

    // Check order exists and is valid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('download_token', token)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if download link has expired
    if (new Date(order.download_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 })
    }

    // Get beat details
    const { data: beat, error: beatError } = await supabaseAdmin
      .from('beats')
      .select('*')
      .eq('id', beatId)
      .single()

    if (beatError || !beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // Determine which files the user can download based on license
    const allowedFiles = LICENSE_DETAILS[licenseType]?.files || ['mp3']

    // If no specific file requested, return download page info
    if (!fileType) {
      const availableFiles = []

      if (allowedFiles.includes('mp3') && beat.mp3_url) {
        availableFiles.push({
          type: 'mp3',
          name: `${beat.title}.mp3`,
          url: beat.mp3_url
        })
      }

      if (allowedFiles.includes('wav') && beat.wav_url) {
        availableFiles.push({
          type: 'wav',
          name: `${beat.title}.wav`,
          url: beat.wav_url
        })
      }

      if (allowedFiles.includes('stems') && beat.stems_url) {
        availableFiles.push({
          type: 'stems',
          name: `${beat.title}_stems.zip`,
          url: beat.stems_url
        })
      }

      return NextResponse.json({
        order: {
          orderId: order.order_id,
          beatTitle: beat.title,
          licenseType: LICENSE_DETAILS[licenseType]?.name || licenseType,
          purchaseDate: order.created_at,
          expiresAt: order.download_expires_at
        },
        files: availableFiles,
        beat: {
          id: beat.id,
          title: beat.title,
          image_url: beat.image_url,
          genre: beat.genre,
          bpm: beat.bpm,
          key: beat.key
        }
      })
    }

    // Validate requested file type
    if (!allowedFiles.includes(fileType)) {
      return NextResponse.json(
        { error: 'This file type is not included in your license' },
        { status: 403 }
      )
    }

    // Get the appropriate file URL
    let fileUrl
    switch (fileType) {
      case 'mp3':
        fileUrl = beat.mp3_url
        break
      case 'wav':
        fileUrl = beat.wav_url
        break
      case 'stems':
        fileUrl = beat.stems_url
        break
      default:
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'File not available' }, { status: 404 })
    }

    // Determine filename and content type
    const fileExtensions = { mp3: 'mp3', wav: 'wav', stems: 'zip' }
    const contentTypes = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      stems: 'application/zip'
    }
    const ext = fileExtensions[fileType]
    const contentType = contentTypes[fileType]
    const sanitizedTitle = beat.title.replace(/[^a-zA-Z0-9-_]/g, '_')
    const filename = `${sanitizedTitle}.${ext}`

    // Fetch the file from Supabase Storage
    let fileData
    if (fileUrl.includes('supabase')) {
      const pathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)

      if (pathMatch) {
        const bucket = pathMatch[1]
        const path = pathMatch[2]

        const { data, error: downloadError } = await supabaseAdmin.storage
          .from(bucket)
          .download(path)

        if (downloadError) {
          console.error('Storage download error:', downloadError)
          return NextResponse.json({ error: 'File download failed' }, { status: 500 })
        }

        fileData = data
      }
    }

    if (!fileData) {
      // Fallback: fetch from URL directly
      const response = await fetch(fileUrl)
      if (!response.ok) {
        return NextResponse.json({ error: 'File not available' }, { status: 404 })
      }
      fileData = await response.blob()
    }

    // Increment download count
    await supabaseAdmin
      .from('orders')
      .update({
        download_count: (order.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    // Return file with download headers
    const arrayBuffer = await fileData.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
