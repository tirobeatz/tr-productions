'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [downloadStarted, setDownloadStarted] = useState({})

  useEffect(() => {
    if (token) {
      fetchOrderDetails(token)
    } else if (sessionId) {
      // Wait for webhook to process, then show generic success
      setTimeout(() => {
        setLoading(false)
        setOrderData({ pending: true })
      }, 2000)
    } else {
      setError('Invalid access')
      setLoading(false)
    }
  }, [token, sessionId])

  const fetchOrderDetails = async (downloadToken) => {
    try {
      const res = await fetch(`/api/download?token=${downloadToken}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load order')
      }
      const data = await res.json()
      setOrderData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (file, token) => {
    setDownloadStarted(prev => ({ ...prev, [file.type]: true }))
    window.location.href = `/api/download?token=${token}&file=${file.type}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'mp3': return '🎵'
      case 'wav': return '🎼'
      case 'stems': return '📦'
      default: return '📄'
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      <Background />
      <Header />

      <section className="relative pt-28 md:pt-32 pb-20 px-4 md:px-6 min-h-[80vh]">
        <div className="max-w-2xl mx-auto">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-gray-400">Loading your purchase...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">😕</div>
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-gray-400 mb-8">{error}</p>
              <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-full font-semibold transition">
                Back to Beats
              </a>
            </div>
          ) : orderData?.pending ? (
            // Payment successful but order still processing
            <div className="text-center py-12">
              <div className="text-7xl mb-6 animate-bounce-slow">✅</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Payment Successful!</h1>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your order is being processed. You'll receive an email with your download link within a few minutes.
              </p>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center gap-3 text-[#8B5CF6]">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Preparing your files...</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Didn't receive the email? Check your spam folder or <a href="/contact" className="text-[#8B5CF6] hover:underline">contact us</a>.
              </p>
            </div>
          ) : orderData ? (
            // Full order details with download
            <>
              {/* Success Header */}
              <div className="text-center mb-10">
                <div className="text-7xl mb-6">🎉</div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Thank You!</h1>
                <p className="text-gray-400">Your purchase was successful. Download your files below.</p>
              </div>

              {/* Order Card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-8">
                {/* Beat Preview */}
                <div className="flex items-center gap-4 p-5 border-b border-white/10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] overflow-hidden relative flex-shrink-0">
                    {orderData.beat?.image_url ? (
                      <Image
                        src={orderData.beat.image_url}
                        alt={orderData.beat.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg md:text-xl">{orderData.beat?.title}</h2>
                    <p className="text-gray-500 text-sm">{orderData.beat?.genre} • {orderData.beat?.bpm} BPM • {orderData.beat?.key}</p>
                    <p className="text-[#8B5CF6] text-sm font-medium mt-1">{orderData.order?.licenseType}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-5 border-b border-white/10 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID</span>
                    <span className="font-mono">{orderData.order?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purchase Date</span>
                    <span>{formatDate(orderData.order?.purchaseDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Download Expires</span>
                    <span className="text-yellow-400">{formatDate(orderData.order?.expiresAt)}</span>
                  </div>
                </div>

                {/* Download Files */}
                <div className="p-5">
                  <h3 className="font-semibold mb-4">Download Your Files</h3>
                  <div className="space-y-3">
                    {orderData.files?.map((file) => (
                      <button
                        key={file.type}
                        onClick={() => handleDownload(file, token)}
                        disabled={downloadStarted[file.type]}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                          downloadStarted[file.type]
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-white/[0.03] border-white/10 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500 uppercase">{file.type} file</p>
                          </div>
                        </div>
                        {downloadStarted[file.type] ? (
                          <span className="text-green-400 text-sm">✓ Started</span>
                        ) : (
                          <span className="bg-[#8B5CF6] px-4 py-2 rounded-full text-sm font-medium">
                            Download
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* License Note */}
              <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="font-medium mb-1">License Agreement</p>
                    <p className="text-sm text-gray-400">
                      Your license agreement has been sent to your email. Please keep it for your records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-full font-semibold transition text-center">
                  Browse More Beats
                </a>
                <a href="/contact" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 py-3 rounded-full font-semibold transition text-center">
                  Need Help?
                </a>
              </div>
            </>
          ) : null}

        </div>
      </section>

      <Footer />
    </main>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
