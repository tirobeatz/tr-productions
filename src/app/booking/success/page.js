'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const isFinal = searchParams.get('payment') === 'final'

  const isStudio = type === 'studio'
  const serviceName = isStudio ? 'Studio Session' : 'Mix & Master'

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">{isFinal ? '✅' : (isStudio ? '🎙️' : '🎚️')}</div>

        <h1 className="text-3xl font-bold text-white mb-3">
          {isFinal ? 'Payment Complete!' : 'Booking Confirmed!'}
        </h1>

        <p className="text-gray-400 mb-8">
          {isFinal
            ? `Your ${serviceName.toLowerCase()} is fully paid. Thank you!`
            : `Your deposit has been received. Your ${serviceName.toLowerCase()} booking is confirmed.`
          }
        </p>

        {!isFinal && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-medium mb-3">Next Steps</h3>
            {isStudio ? (
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">1.</span>
                  <span>Check your email for the booking confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">2.</span>
                  <span>Show up at the studio on your booked date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">3.</span>
                  <span>The remaining balance is due on your session day</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">1.</span>
                  <span>Check your email for the booking confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">2.</span>
                  <span>Send your files to <strong className="text-white">mixmaster@trproductions.de</strong> or via WeTransfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">3.</span>
                  <span>You&apos;ll receive an invoice for the remaining balance upon delivery</span>
                </li>
              </ul>
            )}
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
