'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'
import { BeatTiltCard, FadeUp, StaggerChildren } from '../components/animations'

export default function BeatsPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [beats, setBeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState('All')
  const [activeTag, setActiveTag] = useState(null)
  const [currentBeat, setCurrentBeat] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBeat, setSelectedBeat] = useState(null)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [showCopied, setShowCopied] = useState(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [volume, setVolume] = useState(1)
  const [notepadBeat, setNotepadBeat] = useState(null)
  const [lyrics, setLyrics] = useState({})
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const genres = ['All', 'Trap', 'Drill', 'R&B', 'Jersey', 'Rap']
  const allTags = ['dark', 'melodic', 'hard', 'emotional', 'bouncy', 'chill', 'aggressive', 'smooth', 'sad']

  const licenses = [
    { id: 'mp3', name: 'MP3 Lease', priceKey: 'price_mp3', features: ['MP3 File (320kbps)', 'Up to 50,000 streams', 'Must credit producer', 'Non-exclusive rights', '20% publishing split'] },
    { id: 'wav', name: 'WAV Lease', priceKey: 'price_wav', features: ['WAV + MP3 Files', 'Up to 100,000 streams', 'Must credit producer', 'Non-exclusive rights', '20% publishing split'] },
    { id: 'unlimited', name: 'Stems', priceKey: 'price_stems', features: ['WAV + MP3 + Stems', 'Up to 250,000 streams', '1 music video allowed', 'Non-exclusive rights', '20% publishing split'] },
    { id: 'exclusive', name: 'Exclusive', priceKey: 'price_exclusive', features: ['Full master ownership', 'Unlimited streams/sales', 'Beat removed from store', '20% publishing split', 'Unlimited music videos'], highlight: true }
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    fetchBeats()
    const saved = localStorage.getItem('tr-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    const savedLyrics = localStorage.getItem('tr-lyrics')
    if (savedLyrics) setLyrics(JSON.parse(savedLyrics))
  }, [])

  const fetchBeats = async () => {
    setLoading(true)
    // Fetch all beats, including sold ones (to show as "Sold")
    const { data } = await supabase.from('beats').select('*').order('created_at', { ascending: false })
    setBeats(data || [])
    setLoading(false)
  }

  useEffect(() => { localStorage.setItem('tr-favorites', JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem('tr-lyrics', JSON.stringify(lyrics)) }, [lyrics])

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

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])
  useEffect(() => { document.body.style.overflow = selectedBeat ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset' } }, [selectedBeat])

  const filteredBeats = beats.filter(b => {
    const matchGenre = activeGenre === 'All' || b.genre === activeGenre
    const matchTag = !activeTag || (b.tags && b.tags.includes(activeTag))
    const matchFav = !showFavoritesOnly || favorites.includes(b.id)
    const matchSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchGenre && matchTag && matchSearch && matchFav
  })

  const formatTime = (s) => isNaN(s) || s === Infinity ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  const formatPrice = (p) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p)

  // Check if a license is available (has price set AND required files)
  const isLicenseAvailable = (beat, licenseId) => {
    const hasFile = (url) => url && url.trim() !== ''
    switch (licenseId) {
      case 'mp3':
        return beat.price_mp3 != null && beat.price_mp3 >= 0 && hasFile(beat.mp3_url)
      case 'wav':
        return beat.price_wav != null && beat.price_wav >= 0 && hasFile(beat.wav_url)
      case 'unlimited': // Stems
        return beat.price_stems != null && beat.price_stems >= 0 && hasFile(beat.stems_url)
      case 'exclusive':
        // Exclusive needs price and at least one downloadable file
        return beat.price_exclusive != null && beat.price_exclusive > 0 && (hasFile(beat.mp3_url) || hasFile(beat.wav_url))
      default:
        return false
    }
  }

  const getLowestPrice = (beat) => {
    const availablePrices = []
    if (isLicenseAvailable(beat, 'mp3')) availablePrices.push(beat.price_mp3)
    if (isLicenseAvailable(beat, 'wav')) availablePrices.push(beat.price_wav)
    if (isLicenseAvailable(beat, 'unlimited')) availablePrices.push(beat.price_stems)
    if (isLicenseAvailable(beat, 'exclusive')) availablePrices.push(beat.price_exclusive)
    return availablePrices.length > 0 ? Math.min(...availablePrices) : null
  }

  const handlePlay = (beat) => {
    if (!beat.audio_url) return
    if (currentBeat?.id === beat.id) {
      isPlaying ? audioRef.current?.pause() : audioRef.current?.play()
    } else {
      setCurrentBeat(beat)
      setProgress(0)
      setCurrentTime(0)
      setTimeout(() => { audioRef.current?.load(); audioRef.current?.play().catch(() => {}) }, 100)
    }
  }

  const handleProgressClick = (e, mobileRef = null) => {
    const ref = mobileRef || progressRef.current
    if (!ref || !duration) return
    const rect = ref.getBoundingClientRect()
    // Handle both touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    audioRef.current.currentTime = (pct / 100) * duration
    setProgress(pct)
    setCurrentTime((pct / 100) * duration)
  }

  const mobileProgressRef = useRef(null)

  const toggleFavorite = (id) => setFavorites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleShare = async (beat) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/beats?id=${beat.id}`)
      setShowCopied(beat.id)
      setTimeout(() => setShowCopied(null), 2000)
    } catch (err) { console.error('Failed to copy:', err) }
  }

  const handleBuyClick = (beat) => {
    if (beat.is_sold) return // Don't allow buying sold beats
    setSelectedBeat(beat)
    setSelectedLicense(null)
    setCheckoutEmail('')
    setEmailError('')
  }
  const handleCloseModal = () => {
    setSelectedBeat(null)
    setSelectedLicense(null)
    setCheckoutEmail('')
    setEmailError('')
  }

  const openNotepad = (beat) => {
    setNotepadBeat(beat)
    if (!lyrics[beat.id]) setLyrics(p => ({ ...p, [beat.id]: '' }))
  }

  const updateLyrics = (id, text) => setLyrics(p => ({ ...p, [id]: text }))

  const downloadLyrics = (beat) => {
    const blob = new Blob([`${beat.title} - Lyrics\n\n${lyrics[beat.id] || ''}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${beat.title.replace(/\s+/g, '_')}_lyrics.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleCheckout = async () => {
    if (!selectedBeat || !selectedLicense) return

    // Validate email
    if (!checkoutEmail.trim()) {
      setEmailError('Please enter your email address')
      return
    }
    if (!validateEmail(checkoutEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    setCheckoutLoading(true)

    try {
      const priceKey = `price_${selectedLicense.id === 'unlimited' ? 'stems' : selectedLicense.id}`
      const price = selectedBeat[priceKey]
      const isFree = price != null && price < 0.50

      if (isFree) {
        // Free beat — skip Stripe, go directly to free download
        const response = await fetch('/api/free-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beatId: selectedBeat.id,
            licenseType: selectedLicense.id,
            customerEmail: checkoutEmail
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to get download')
        window.location.href = data.redirectUrl
      } else {
        // Paid beat — use Stripe checkout
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beatId: selectedBeat.id,
            licenseType: selectedLicense.id,
            customerEmail: checkoutEmail
          })
        })

        const text = await response.text()
        let data
        try { data = JSON.parse(text) } catch { throw new Error('Server error. Please try again.') }

        if (!response.ok) throw new Error(data.error || 'Failed to create checkout')
        if (!data.url) throw new Error('No checkout URL returned. Please try again.')

        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setEmailError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const clearFilters = () => { setSearchQuery(''); setActiveGenre('All'); setActiveTag(null); setShowFavoritesOnly(false) }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      <audio ref={audioRef} preload="metadata">
        {currentBeat?.audio_url && <source src={currentBeat.audio_url} type="audio/mpeg" />}
      </audio>

<Background />

      <Header />

      {/* Page Content */}
      <section className={`relative pt-28 md:pt-32 px-4 md:px-6 ${currentBeat ? 'pb-36 md:pb-32' : 'pb-20'}`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <FadeUp className="text-center mb-8 md:mb-16">
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Beat Store</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4">Browse Beats</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">Find your next hit. All beats are industry-ready and available for instant download.</p>
          </FadeUp>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            {genres.map(g => (
              <button key={g} onClick={() => setActiveGenre(g)}
                className={`px-3 md:px-5 py-2 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${activeGenre === g ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {g}
              </button>
            ))}
            <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 md:px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${showFavoritesOnly ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <span>♥</span>{favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-6 md:mb-12">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-2 md:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTag === tag ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                #{tag}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8 md:mb-16">
            <div className="relative">
              <input type="text" placeholder="Search beats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 md:px-6 py-2.5 md:py-3 text-base md:text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              <span className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Loading beats...</p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6" stagger={0.05}>
                {filteredBeats.map((beat) => (
                  <BeatTiltCard key={beat.id} className="group overflow-hidden">
                    {/* Cover */}
                    <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] relative cursor-pointer overflow-hidden" onClick={() => handlePlay(beat)}>
                      {beat.image_url ? (
                        <Image src={beat.image_url} alt={beat.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl md:text-5xl opacity-30">🎵</span></div>
                      )}
                      
                      {beat.is_sold && <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-wide z-20">SOLD</div>}
                      {!beat.is_sold && !beat.audio_url && <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">No Audio</div>}
                      {!beat.is_sold && beat.is_featured && <div className="absolute top-2 left-2 bg-[#8B5CF6] text-white text-xs px-1.5 py-0.5 rounded-full">Featured</div>}
                      
                      {/* Desktop Actions */}
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id) }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${favorites.includes(beat.id) ? 'bg-red-500/20 text-red-400' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                          <span className="text-sm">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(beat) }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition relative">
                          <span className="text-sm">↗</span>
                          {showCopied === beat.id && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">Copied!</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openNotepad(beat) }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition" title="Write lyrics">
                          <span className="text-sm">✎</span>
                        </button>
                      </div>

                      {/* Play Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                          {currentBeat?.id === beat.id && isPlaying ? <span className="text-black text-sm md:text-xl">❚❚</span> : <span className="text-black text-sm md:text-xl ml-0.5">▶</span>}
                        </div>
                      </div>

                      {/* Playing Indicator */}
                      {currentBeat?.id === beat.id && isPlaying && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-0.5">
                          {[0, 100, 200].map(d => <div key={d} className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-equalizer" style={{ animationDelay: `${d}ms` }} />)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 md:p-5">
                      {/* Title row */}
                      <h3 className="font-semibold text-xs md:text-base truncate mb-0.5 md:mb-1">{beat.title}</h3>

                      {/* Genre + BPM row */}
                      <div className="flex items-center gap-1.5 mb-1.5 md:mb-2">
                        <span className="text-[10px] md:text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">{beat.genre}</span>
                        <span className="text-gray-500 text-[10px] md:text-sm">{beat.bpm} BPM</span>
                      </div>

                      {/* Tags - Desktop */}
                      {beat.tags?.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1 mb-4">
                          {beat.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">#{tag}</span>)}
                        </div>
                      )}

                      {/* Price row */}
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs md:text-base ${beat.is_sold ? 'text-gray-500 line-through' : ''}`}>
                          {getLowestPrice(beat) !== null ? (
                            getLowestPrice(beat) === 0 ? (
                              <span className="text-green-400">Free</span>
                            ) : getLowestPrice(beat) < 0.50 ? (
                              <span className="text-green-400">Free</span>
                            ) : (
                              <>
                                <span className="text-gray-500 text-[10px] md:text-xs font-normal hidden md:inline">from </span>
                                {formatPrice(getLowestPrice(beat))}
                              </>
                            )
                          ) : (
                            <span className="text-gray-400 text-[10px] md:text-sm">Contact</span>
                          )}
                        </span>
                        {beat.is_sold ? (
                          <span className="bg-gray-600 text-gray-300 px-2 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium cursor-not-allowed">
                            Sold
                          </span>
                        ) : getLowestPrice(beat) !== null ? (
                          <button onClick={() => handleBuyClick(beat)}
                            className={`px-2.5 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium transition ${getLowestPrice(beat) < 0.50 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-black hover:bg-gray-200'}`}>
                            {getLowestPrice(beat) < 0.50 ? 'Get Free' : 'Buy'}
                          </button>
                        ) : (
                          <a href="mailto:contact@trproductions.de"
                            className="bg-white/10 text-white px-2.5 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/20 transition">
                            Contact
                          </a>
                        )}
                      </div>

                      {/* Mobile action buttons - separate row */}
                      <div className="flex items-center gap-1 mt-1.5 md:hidden">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id) }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${favorites.includes(beat.id) ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                          <span className="text-[10px]">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(beat) }}
                          className="w-7 h-7 rounded-full bg-white/5 text-gray-400 flex items-center justify-center relative">
                          <span className="text-[10px]">↗</span>
                          {showCopied === beat.id && <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">Copied!</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openNotepad(beat) }}
                          className="w-7 h-7 rounded-full bg-white/5 text-gray-400 flex items-center justify-center">
                          <span className="text-[10px]">✎</span>
                        </button>
                      </div>
                    </div>
                  </BeatTiltCard>
                ))}
              </StaggerChildren>

              {/* No Results */}
              {filteredBeats.length === 0 && (
                <div className="text-center py-16 md:py-20">
                  <span className="text-4xl md:text-5xl block mb-4">🎵</span>
                  <p className="text-gray-500 text-base md:text-lg mb-4">No beats found.</p>
                  <button onClick={clearFilters} className="text-[#8B5CF6] hover:underline text-sm">Clear filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Notepad Panel */}
      {notepadBeat && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNotepadBeat(null)} />
          <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm md:text-base">Lyrics Notepad</h3>
                <p className="text-xs md:text-sm text-gray-500">{notepadBeat.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadLyrics(notepadBeat)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition" title="Download"><span>↓</span></button>
                <button onClick={() => setNotepadBeat(null)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"><span>✕</span></button>
              </div>
            </div>
            <div className="p-4 border-b border-white/10 flex items-center gap-3 md:gap-4">
              <button onClick={() => handlePlay(notepadBeat)} className="w-10 h-10 md:w-12 md:h-12 bg-[#8B5CF6] rounded-full flex items-center justify-center hover:bg-[#7C3AED] transition flex-shrink-0">
                {currentBeat?.id === notepadBeat.id && isPlaying ? <span className="text-white text-sm">❚❚</span> : <span className="text-white text-sm ml-1">▶</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notepadBeat.title}</p>
                <p className="text-xs text-gray-500">{notepadBeat.bpm} BPM • {notepadBeat.key}</p>
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea value={lyrics[notepadBeat.id] || ''} onChange={(e) => updateLyrics(notepadBeat.id, e.target.value)}
                placeholder="Start writing your lyrics here..."
                className="w-full h-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 resize-none" />
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-[10px] md:text-xs text-gray-500">
              <span>Auto-saved</span>
              <span>{(lyrics[notepadBeat.id] || '').length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* License Modal */}
      {selectedBeat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseModal} className="absolute top-3 right-3 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition z-10">
              <span className="text-base md:text-xl">✕</span>
            </button>
            <div className="p-4 md:p-8">
              {/* Beat Info */}
              <div className="flex items-center gap-3 md:gap-6 mb-5 md:mb-8 pb-5 md:pb-8 border-b border-white/10">
                <div className="w-14 h-14 md:w-24 md:h-24 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg md:rounded-xl flex-shrink-0 overflow-hidden relative">
                  {selectedBeat.image_url ? <Image src={selectedBeat.image_url} alt={selectedBeat.title} fill className="object-cover" sizes="96px" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-xl md:text-4xl">🎵</span></div>}
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold mb-1">{selectedBeat.title}</h2>
                  <p className="text-gray-500 text-xs md:text-base">{selectedBeat.genre} • {selectedBeat.bpm} BPM • {selectedBeat.key}</p>
                </div>
              </div>

              {/* Licenses */}
              <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-6">Select License</h3>
              {(() => {
                const availableLicenses = licenses.filter(lic => isLicenseAvailable(selectedBeat, lic.id))

                if (availableLicenses.length === 0) {
                  return (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-5 md:mb-8">
                      <span className="text-3xl mb-3 block">🚫</span>
                      <p className="text-gray-400">No licenses available for this beat.</p>
                      <p className="text-gray-500 text-sm mt-1">Please contact us for pricing.</p>
                    </div>
                  )
                }

                return (
                  <div className={`grid gap-2 md:gap-4 mb-5 md:mb-8 ${availableLicenses.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : availableLicenses.length === 2 ? 'grid-cols-2 max-w-lg mx-auto' : availableLicenses.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                    {availableLicenses.map(lic => {
                      const price = selectedBeat[lic.priceKey]
                      const isExclusiveSold = lic.id === 'exclusive' && selectedBeat.is_sold
                      const isDisabled = isExclusiveSold

                      return (
                        <div
                          key={lic.id}
                          onClick={() => !isDisabled && setSelectedLicense(lic)}
                          className={`relative p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all ${
                            isDisabled
                              ? 'border-white/5 bg-white/[0.01] cursor-not-allowed opacity-50'
                              : selectedLicense?.id === lic.id
                              ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 cursor-pointer'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20 cursor-pointer'
                          } ${lic.highlight && !isDisabled ? 'ring-1 ring-[#8B5CF6]/50' : ''}`}
                        >
                          {isExclusiveSold ? (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] md:text-xs px-2 py-0.5 rounded-full whitespace-nowrap">Sold Out</span>
                          ) : lic.highlight ? (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[9px] md:text-xs px-2 py-0.5 rounded-full whitespace-nowrap">Best Value</span>
                          ) : null}
                          <h4 className="font-semibold text-xs md:text-base mb-0.5 md:mb-1">{lic.name}</h4>
                          <p className={`text-base md:text-2xl font-bold mb-2 md:mb-4 ${isDisabled ? 'line-through text-gray-500' : ''}`}>
                            {price < 0.50 ? <span className="text-green-400">Free</span> : formatPrice(price)}
                          </p>
                          <ul className="space-y-1 md:space-y-2 hidden md:block">
                            {lic.features.map((f, i) => (
                              <li key={i} className={`text-xs flex items-start gap-2 ${isDisabled ? 'text-gray-600' : 'text-gray-400'}`}>
                                <span className={isDisabled ? 'text-gray-600' : 'text-[#8B5CF6]'}>✓</span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Email Input & Checkout */}
              <div className="pt-4 md:pt-6 border-t border-white/10">
                {selectedLicense && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Email for delivery</label>
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
                    <p className="text-gray-600 text-xs mt-2">Download link and license will be sent to this email</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                  <div>
                    {selectedLicense && (
                      <p className="text-gray-400 text-sm">Total: <span className="text-white font-bold text-lg md:text-xl">
                        {selectedBeat[selectedLicense.priceKey] < 0.50 ? <span className="text-green-400">Free</span> : formatPrice(selectedBeat[selectedLicense.priceKey])}
                      </span></p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedLicense || checkoutLoading}
                    className={`w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold transition text-sm md:text-base flex items-center justify-center gap-2 ${
                      selectedLicense && !checkoutLoading
                        ? selectedBeat[selectedLicense?.priceKey] < 0.50
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {checkoutLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : selectedLicense ? (
                      selectedBeat[selectedLicense.priceKey] < 0.50 ? (
                        <>
                          <span>🎁</span>
                          Get Free Download
                        </>
                      ) : (
                        <>
                          <span>💳</span>
                          Proceed to Checkout
                        </>
                      )
                    ) : (
                      'Select a License'
                    )}
                  </button>
                </div>

                {/* Payment Methods Note */}
                {selectedLicense && selectedBeat[selectedLicense.priceKey] >= 0.50 && (
                  <p className="text-center text-gray-600 text-xs mt-4">
                    Secure checkout powered by Stripe. Pay with card, Apple Pay, or Google Pay.
                  </p>
                )}
                {selectedLicense && selectedBeat[selectedLicense.priceKey] < 0.50 && (
                  <p className="text-center text-gray-600 text-xs mt-4">
                    Download link will be sent to your email.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {currentBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
          {/* Mobile Progress - taller tap target with touch support */}
          <div 
            ref={mobileProgressRef}
            className="h-3 bg-white/10 cursor-pointer md:hidden relative"
            onClick={(e) => handleProgressClick(e, mobileProgressRef.current)}
            onTouchStart={(e) => handleProgressClick(e, mobileProgressRef.current)}
          >
            <div className="absolute top-1 left-0 right-0 h-1 bg-white/5 rounded-full">
              <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <div className="px-4 py-3 md:px-6 md:py-4">
            {/* Mobile Layout */}
            <div className="flex md:hidden items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex-shrink-0 overflow-hidden relative">
                {currentBeat.image_url ? <Image src={currentBeat.image_url} alt={currentBeat.title} fill className="object-cover" sizes="44px" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-base">🎵</span></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentBeat.title}</h4>
                <p className="text-gray-500 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0" onClick={() => handlePlay(currentBeat)}>
                  {isPlaying ? <span className="text-black text-xs">❚❚</span> : <span className="text-black text-xs ml-0.5">▶</span>}
                </button>
                {getLowestPrice(currentBeat) ? (
                  <button onClick={() => handleBuyClick(currentBeat)} className="bg-[#8B5CF6] px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0">Buy</button>
                ) : (
                  <a href="mailto:contact@trproductions.de" className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0">Contact</a>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0 w-1/4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex-shrink-0 overflow-hidden relative">
                  {currentBeat.image_url ? <Image src={currentBeat.image_url} alt={currentBeat.title} fill className="object-cover" sizes="48px" /> : <span className="text-lg flex items-center justify-center w-full h-full">🎵</span>}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{currentBeat.title}</h4>
                  <p className="text-gray-500 text-xs">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:scale-105 transition" onClick={() => handlePlay(currentBeat)}>
                  {isPlaying ? <span className="text-black text-sm">❚❚</span> : <span className="text-black text-sm ml-0.5">▶</span>}
                </button>
                <div className="flex-1">
                  <div ref={progressRef} className="h-1.5 bg-white/10 rounded-full cursor-pointer group" onClick={handleProgressClick}>
                    <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full relative" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setVolume(volume > 0 ? 0 : 1)} className="text-gray-400 hover:text-white">{volume === 0 ? '🔇' : '🔊'}</button>
                  <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 accent-[#8B5CF6]" />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {getLowestPrice(currentBeat) ? (
                  <>
                    <span className="font-bold">
                      <span className="text-gray-500 text-xs font-normal">from </span>
                      {formatPrice(getLowestPrice(currentBeat))}
                    </span>
                    <button onClick={() => handleBuyClick(currentBeat)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2 rounded-full text-sm font-medium transition">Buy Now</button>
                  </>
                ) : (
                  <a href="mailto:contact@trproductions.de" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-medium transition">Contact</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

    </main>
  )
}