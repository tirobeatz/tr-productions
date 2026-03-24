'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function UploadContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  const serviceType = searchParams.get('type')

  const [booking, setBooking] = useState(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (bookingId && serviceType) verifyBooking()
  }, [bookingId, serviceType])

  async function verifyBooking() {
    setLoading(true)
    try {
      const res = await fetch(`/api/upload-files?bookingId=${bookingId}&type=${serviceType}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBooking(data.booking)
        setFiles(data.files)
      }
    } catch {
      setError('Failed to verify booking')
    }
    setLoading(false)
  }

  const uploadFile = async (file) => {
    const id = Date.now() + '-' + file.name
    setUploading(prev => [...prev, { id, name: file.name, size: file.size, progress: 0 }])

    try {
      // Step 1: Get a signed upload URL from our API
      const res = await fetch('/api/upload-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          serviceType,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream'
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error (${res.status})`)
      }

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!data.signedUrl || !data.token) throw new Error('Invalid upload URL response')

      // Step 2: Upload file directly to Supabase using the signed URL
      setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 10 } : u))

      const uploadRes = await fetch(data.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file
      })

      if (!uploadRes.ok) {
        const errBody = await uploadRes.text().catch(() => '')
        console.error('Supabase upload error:', uploadRes.status, errBody)
        throw new Error(`Upload failed (${uploadRes.status}): ${errBody.slice(0, 100) || uploadRes.statusText}`)
      }

      setUploading(prev => prev.filter(u => u.id !== id))
      setFiles(prev => [...prev, { name: data.fileName, size: file.size, created: new Date().toISOString() }])
    } catch (err) {
      console.error('Upload error:', err)
      setUploading(prev => prev.map(u => u.id === id ? { ...u, error: err.message } : u))
    }
  }

  const handleFiles = useCallback((fileList) => {
    Array.from(fileList).forEach(file => {
      if (file.size > 2 * 1024 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 2GB.`)
        return
      }
      uploadFile(file)
    })
  }, [bookingId, serviceType])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const handleDragLeave = () => setDragActive(false)

  const deleteFile = async (fileName) => {
    try {
      const res = await fetch('/api/upload-files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, serviceType, fileName })
      })
      const data = await res.json()
      if (data.success) {
        setFiles(prev => prev.filter(f => f.name !== fileName))
      }
    } catch {
      alert('Failed to delete file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error || 'Invalid upload link. Make sure you have the correct URL from your booking confirmation email.'}</p>
          <Link href="/" className="inline-block bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const serviceName = serviceType === 'mix' ? 'Mix & Master' : 'Studio Session'

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#8B5CF6]">TR</span> Productions
          </h1>
          <p className="text-gray-500 text-sm">File Upload</p>
        </div>

        {/* Booking Info */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{serviceType === 'mix' ? '🎚️' : '🎙️'}</span>
            <div>
              <h2 className="text-white font-medium">{serviceName}</h2>
              <p className="text-sm text-gray-500">
                {booking.name}{booking.trackName ? ` — ${booking.trackName}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${
            dragActive
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
              : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
          }`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-4xl mb-4">📁</div>
          <p className="text-white font-medium mb-1">
            {dragActive ? 'Drop files here' : 'Drag & drop your files here'}
          </p>
          <p className="text-sm text-gray-500 mb-3">or click to browse</p>
          <p className="text-xs text-gray-600">Max 2GB per file. Any file type accepted.</p>
        </div>

        {/* Upload Progress */}
        {uploading.length > 0 && (
          <div className="space-y-2 mb-6">
            {uploading.map(u => (
              <div key={u.id} className="bg-white/[0.03] border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(u.size)} — {u.error ? <span className="text-red-400">{u.error}</span> : 'Uploading...'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.size ? formatFileSize(f.size) : ''}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(f.name) }}
                    className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs flex-shrink-0 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-5">
          <h3 className="text-[#A78BFA] font-medium mb-2">Tips for best results</h3>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {serviceType === 'mix' ? (
              <>
                <li>Upload your vocal stems as WAV files (24-bit preferred)</li>
                <li>Include the instrumental/beat if it&apos;s not from TR Productions</li>
                <li>Label your files clearly (e.g., &quot;vocals_main.wav&quot;, &quot;vocals_adlib.wav&quot;)</li>
                <li>Include a reference track if you have a specific sound in mind</li>
              </>
            ) : (
              <>
                <li>Upload any reference tracks or beats you want to record over</li>
                <li>Include lyrics or session notes if available</li>
                <li>Files will be accessible during your studio session</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <UploadContent />
    </Suspense>
  )
}
