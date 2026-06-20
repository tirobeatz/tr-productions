'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { useT } from '@/i18n/I18nProvider'
import { buildLicenses, isLicenseAvailable, getLowestPrice } from '@/lib/licenses'
import { buildBeatPath } from '@/lib/beat-url'

export default function BeatDetail({ beat, locale }) {
  const t = useT()

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  const audioRef = useRef(null)
  const progressRef = useRef(null)

  // Same license structure / availability rules as the store list.
  const licenses = buildLicenses(t)
  const availableLicenses = licenses.filter((lic) => isLicenseAvailable(beat, lic.id))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => { setCurrentTime(audio.currentTime); setProgress((audio.currentTime / audio.duration) * 100 || 0) }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0) }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd); audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause) }
  }, [])

  const formatTime = (s) => isNaN(s) || s === Infinity ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  const formatPrice = (p) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p)

  const togglePlay = () => {
    if (!beat.audio_url) return
    isPlaying ? audioRef.current?.pause() : audioRef.current?.play().catch(() => {})
  }

  const handleProgressClick = (e) => {
    const ref = progressRef.current
    if (!ref || !duration) return
    const rect = ref.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    audioRef.current.currentTime = (pct / 100) * duration
    setProgress(pct)
    setCurrentTime((pct / 100) * duration)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${buildBeatPath(locale, beat)}`)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (err) { console.error('Failed to copy:', err) }
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Identical checkout / free-download calls as the store list.
  const handleCheckout = async () => {
    if (!selectedLicense) return

    if (!checkoutEmail.trim()) {
      setEmailError(t('beats.checkout.errEmailRequired'))
      return
    }
    if (!validateEmail(checkoutEmail)) {
      setEmailError(t('beats.checkout.errEmailInvalid'))
      return
    }

    setEmailError('')
    setCheckoutLoading(true)

    try {
      const priceKey = `price_${selectedLicense.id === 'unlimited' ? 'stems' : selectedLicense.id}`
      const price = beat[priceKey]
      const isFree = price != null && price < 0.50

      if (isFree) {
        const response = await fetch('/api/free-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beatId: beat.id,
            licenseType: selectedLicense.id,
            customerEmail: checkoutEmail
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || t('beats.checkout.errDownload'))
        window.location.href = data.redirectUrl
      } else {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beatId: beat.id,
            licenseType: selectedLicense.id,
            customerEmail: checkoutEmail
          })
        })

        const text = await response.text()
        let data
        try { data = JSON.parse(text) } catch { throw new Error(t('beats.checkout.errServer')) }

        if (!response.ok) throw new Error(data.error || t('beats.checkout.errCheckout'))
        if (!data.url) throw new Error(t('beats.checkout.errNoUrl'))

        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setEmailError(error.message || t('beats.checkout.errGeneric'))
    } finally {
      setCheckoutLoading(false)
    }
  }

  const lowest = getLowestPrice(beat)

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      {beat.audio_url && (
        <audio ref={audioRef} preload="metadata">
          <source src={beat.audio_url} type="audio/mpeg" />
        </audio>
      )}

      <Background />
      <Header />

      <section className="relative pt-28 md:pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">

          {/* Back to store */}
          <Link href={`/${locale}/beats`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6 md:mb-10">
            <span>←</span> {t('beatDetail.backToStore')}
          </Link>

          {/* Hero: cover + info */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
            {/* Cover */}
            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/5">
              {beat.image_url ? (
                <Image src={beat.image_url} alt={beat.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><span className="text-6xl md:text-8xl opacity-30">🎵</span></div>
              )}

              {beat.is_sold && <div className="absolute top-3 left-3 bg-red-500/90 text-white text-xs px-2.5 py-1 rounded-full font-bold tracking-wide z-20">{t('beats.card.sold')}</div>}
              {!beat.is_sold && beat.is_featured && <div className="absolute top-3 left-3 bg-[#8B5CF6] text-white text-xs px-2.5 py-1 rounded-full">{t('beats.card.featured')}</div>}

              {beat.audio_url && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group"
                  aria-label={t('beatDetail.preview')}
                >
                  <span className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform">
                    {isPlaying ? <span className="text-black text-xl md:text-2xl">❚❚</span> : <span className="text-black text-xl md:text-2xl ml-1">▶</span>}
                  </span>
                </button>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{beat.title}</h1>
              <p className="text-gray-500 text-sm md:text-base mb-4">
                {beat.genre} • {beat.bpm} BPM{beat.key ? ` • ${beat.key}` : ''}
              </p>

              {beat.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {beat.tags.map((tag) => <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">#{tag}</span>)}
                </div>
              )}

              {/* Preview progress */}
              {beat.audio_url && (
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{t('beatDetail.preview')}</p>
                  <div ref={progressRef} className="h-1.5 bg-white/10 rounded-full cursor-pointer group" onClick={handleProgressClick}>
                    <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Price + share */}
              <div className="flex items-center gap-4 mb-2">
                <span className={`text-xl font-bold ${beat.is_sold ? 'text-gray-500 line-through' : ''}`}>
                  {lowest !== null ? (
                    lowest < 0.50 ? (
                      <span className="text-green-400">{t('beats.price.free')}</span>
                    ) : (
                      <>
                        <span className="text-gray-500 text-sm font-normal">{t('beats.price.from')}</span>
                        {formatPrice(lowest)}
                      </>
                    )
                  ) : (
                    <span className="text-gray-400 text-base">{t('beats.card.contact')}</span>
                  )}
                </span>

                <button onClick={handleShare} className="relative inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
                  <span>↗</span> {t('beatDetail.share')}
                  {showCopied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">{t('beatDetail.copied')}</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Purchase / Licenses */}
          <div className="mt-10 md:mt-14 bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8">
            {beat.is_sold ? (
              <div className="text-center py-6">
                <span className="text-3xl mb-3 block">🔒</span>
                <p className="text-gray-300">{t('beatDetail.sold')}</p>
                <Link href={`/${locale}/beats`} className="inline-block mt-4 text-[#8B5CF6] hover:underline text-sm">{t('beatDetail.backToStore')}</Link>
              </div>
            ) : (
              <>
                <h2 className="text-sm md:text-lg font-semibold mb-3 md:mb-6">{t('beats.license.select')}</h2>

                {availableLicenses.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                    <span className="text-3xl mb-3 block">🚫</span>
                    <p className="text-gray-400">{t('beats.license.none')}</p>
                    <p className="text-gray-500 text-sm mt-1">{t('beats.license.contactPricing')}</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid gap-2 md:gap-4 mb-5 md:mb-8 ${availableLicenses.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : availableLicenses.length === 2 ? 'grid-cols-2 max-w-lg mx-auto' : availableLicenses.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                      {availableLicenses.map((lic) => {
                        const price = beat[lic.priceKey]
                        return (
                          <div
                            key={lic.id}
                            onClick={() => setSelectedLicense(lic)}
                            className={`relative p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all cursor-pointer ${
                              selectedLicense?.id === lic.id
                                ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            } ${lic.highlight ? 'ring-1 ring-[#8B5CF6]/50' : ''}`}
                          >
                            {lic.highlight && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[9px] md:text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{t('beats.license.bestValue')}</span>
                            )}
                            <h4 className="font-semibold text-xs md:text-base mb-0.5 md:mb-1">{lic.name}</h4>
                            <p className="text-base md:text-2xl font-bold mb-2 md:mb-4">
                              {price < 0.50 ? <span className="text-green-400">{t('beats.price.free')}</span> : formatPrice(price)}
                            </p>
                            <ul className="space-y-1 md:space-y-2 hidden md:block">
                              {lic.features.map((f, i) => (
                                <li key={i} className="text-xs flex items-start gap-2 text-gray-400">
                                  <span className="text-[#8B5CF6]">✓</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>

                    {/* Email + checkout */}
                    <div className="pt-4 md:pt-6 border-t border-white/10">
                      {selectedLicense && (
                        <div className="mb-4">
                          <label className="block text-sm text-gray-400 mb-2">{t('beats.checkout.emailLabel')}</label>
                          <input
                            type="email"
                            value={checkoutEmail}
                            onChange={(e) => { setCheckoutEmail(e.target.value); setEmailError('') }}
                            placeholder="your@email.com"
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-base md:text-sm placeholder-gray-500 focus:outline-none transition ${
                              emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#8B5CF6]/50'
                            }`}
                          />
                          {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
                          <p className="text-gray-600 text-xs mt-2">{t('beats.checkout.emailHint')}</p>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                        <div>
                          {selectedLicense && (
                            <p className="text-gray-400 text-sm">{t('beats.checkout.total')} <span className="text-white font-bold text-lg md:text-xl">
                              {beat[selectedLicense.priceKey] < 0.50 ? <span className="text-green-400">{t('beats.price.free')}</span> : formatPrice(beat[selectedLicense.priceKey])}
                            </span></p>
                          )}
                        </div>
                        <button
                          onClick={handleCheckout}
                          disabled={!selectedLicense || checkoutLoading}
                          className={`w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold transition text-sm md:text-base flex items-center justify-center gap-2 ${
                            selectedLicense && !checkoutLoading
                              ? beat[selectedLicense?.priceKey] < 0.50
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                              : 'bg-white/10 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {checkoutLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {t('beats.checkout.processing')}
                            </>
                          ) : selectedLicense ? (
                            beat[selectedLicense.priceKey] < 0.50 ? (
                              <><span>🎁</span>{t('beats.checkout.getFree')}</>
                            ) : (
                              <><span>💳</span>{t('beats.checkout.proceed')}</>
                            )
                          ) : (
                            t('beats.checkout.selectLicense')
                          )}
                        </button>
                      </div>

                      {selectedLicense && beat[selectedLicense.priceKey] >= 0.50 && (
                        <p className="text-center text-gray-600 text-xs mt-4">{t('beats.checkout.stripeNote')}</p>
                      )}
                      {selectedLicense && beat[selectedLicense.priceKey] < 0.50 && (
                        <p className="text-center text-gray-600 text-xs mt-4">{t('beats.checkout.freeNote')}</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
