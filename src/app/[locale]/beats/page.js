'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { BeatTiltCard, FadeUp, StaggerChildren } from '@/app/components/animations'
import { useT, useLocale } from '@/i18n/I18nProvider'
import { getLowestPrice } from '@/lib/licenses'
import { buildBeatPath } from '@/lib/beat-url'

export default function BeatsPage() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
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
  const [favorites, setFavorites] = useState([])
  const [showCopied, setShowCopied] = useState(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [volume, setVolume] = useState(1)
  const [notepadBeat, setNotepadBeat] = useState(null)
  const [lyrics, setLyrics] = useState({})

  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const genres = ['All', 'Trap', 'Drill', 'R&B', 'Jersey', 'Rap']
  const allTags = ['dark', 'melodic', 'hard', 'emotional', 'bouncy', 'chill', 'aggressive', 'smooth', 'sad']

  // Navigate to a beat's dedicated detail page (purchase happens there now).
  const goToBeat = (beat) => router.push(buildBeatPath(locale, beat))

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    fetchBeats()
    const saved = localStorage.getItem('tr-favorites')
    if (saved) setFavorites(JSON.parse(saved))
    const savedLyrics = localStorage.getItem('tr-lyrics')
    if (savedLyrics) setLyrics(JSON.parse(savedLyrics))
  }, [])

  // Backward-compat: old shared links (/<locale>/beats?id=<uuid>) → detail page.
  useEffect(() => {
    if (typeof window === 'undefined' || beats.length === 0) return
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) return
    const beat = beats.find((b) => b.id === id)
    if (beat) router.replace(buildBeatPath(locale, beat))
  }, [beats, locale, router])

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

  const filteredBeats = beats.filter(b => {
    const matchGenre = activeGenre === 'All' || b.genre === activeGenre
    const matchTag = !activeTag || (b.tags && b.tags.includes(activeTag))
    const matchFav = !showFavoritesOnly || favorites.includes(b.id)
    const matchSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchGenre && matchTag && matchSearch && matchFav
  })

  const formatTime = (s) => isNaN(s) || s === Infinity ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  const formatPrice = (p) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p)

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
      await navigator.clipboard.writeText(`${window.location.origin}${buildBeatPath(locale, beat)}`)
      setShowCopied(beat.id)
      setTimeout(() => setShowCopied(null), 2000)
    } catch (err) { console.error('Failed to copy:', err) }
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
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('beats.hero.label')}</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4">{t('beats.hero.title')}</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">{t('beats.hero.subtitle')}</p>
          </FadeUp>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            {genres.map(g => (
              <button key={g} onClick={() => setActiveGenre(g)}
                className={`px-3 md:px-5 py-2 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${activeGenre === g ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {g === 'All' ? t('beats.filters.all') : g}
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
              <input type="text" placeholder={t('beats.search.placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 md:px-6 py-2.5 md:py-3 text-base md:text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              <span className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">{t('beats.loading')}</p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6" stagger={0.05}>
                {filteredBeats.map((beat) => (
                  <BeatTiltCard key={beat.id} className="group overflow-hidden">
                    {/* Cover */}
                    <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] relative cursor-pointer overflow-hidden" onClick={() => goToBeat(beat)}>
                      {beat.image_url ? (
                        <Image src={beat.image_url} alt={beat.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl md:text-5xl opacity-30">🎵</span></div>
                      )}
                      
                      {beat.is_sold && <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-wide z-20">{t('beats.card.sold')}</div>}
                      {!beat.is_sold && !beat.audio_url && <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">{t('beats.card.noAudio')}</div>}
                      {!beat.is_sold && beat.is_featured && <div className="absolute top-2 left-2 bg-[#8B5CF6] text-white text-xs px-1.5 py-0.5 rounded-full">{t('beats.card.featured')}</div>}
                      
                      {/* Desktop Actions */}
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id) }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${favorites.includes(beat.id) ? 'bg-red-500/20 text-red-400' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                          <span className="text-sm">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(beat) }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition relative">
                          <span className="text-sm">↗</span>
                          {showCopied === beat.id && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">{t('beats.card.copied')}</span>}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openNotepad(beat) }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition" title={t('beats.card.writeLyrics')}>
                          <span className="text-sm">✎</span>
                        </button>
                      </div>

                      {/* Play Overlay (preview — stops navigation) */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 pointer-events-none ${currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlay(beat) }}
                          className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform"
                          aria-label="Play preview"
                        >
                          {currentBeat?.id === beat.id && isPlaying ? <span className="text-black text-sm md:text-xl">❚❚</span> : <span className="text-black text-sm md:text-xl ml-0.5">▶</span>}
                        </button>
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
                      <h3 onClick={() => goToBeat(beat)} className="font-semibold text-xs md:text-base truncate mb-0.5 md:mb-1 cursor-pointer hover:text-[#8B5CF6] transition-colors">{beat.title}</h3>

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
                              <span className="text-green-400">{t('beats.price.free')}</span>
                            ) : getLowestPrice(beat) < 0.50 ? (
                              <span className="text-green-400">{t('beats.price.free')}</span>
                            ) : (
                              <>
                                <span className="text-gray-500 text-[10px] md:text-xs font-normal hidden md:inline">{t('beats.price.from')}</span>
                                {formatPrice(getLowestPrice(beat))}
                              </>
                            )
                          ) : (
                            <span className="text-gray-400 text-[10px] md:text-sm">{t('beats.card.contact')}</span>
                          )}
                        </span>
                        {beat.is_sold ? (
                          <span className="bg-gray-600 text-gray-300 px-2 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium cursor-not-allowed">
                            {t('beats.card.soldBtn')}
                          </span>
                        ) : getLowestPrice(beat) !== null ? (
                          <button onClick={() => goToBeat(beat)}
                            className={`px-2.5 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium transition ${getLowestPrice(beat) < 0.50 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-black hover:bg-gray-200'}`}>
                            {getLowestPrice(beat) < 0.50 ? t('beats.card.getFree') : t('beats.card.buy')}
                          </button>
                        ) : (
                          <a href="mailto:contact@trproductions.de"
                            className="bg-white/10 text-white px-2.5 md:px-4 py-0.5 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium hover:bg-white/20 transition">
                            {t('beats.card.contact')}
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
                          {showCopied === beat.id && <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">{t('beats.card.copied')}</span>}
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
                  <p className="text-gray-500 text-base md:text-lg mb-4">{t('beats.empty.title')}</p>
                  <button onClick={clearFilters} className="text-[#8B5CF6] hover:underline text-sm">{t('beats.empty.clear')}</button>
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
                <h3 className="font-semibold text-sm md:text-base">{t('beats.notepad.title')}</h3>
                <p className="text-xs md:text-sm text-gray-500">{notepadBeat.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadLyrics(notepadBeat)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition" title={t('beats.notepad.download')}><span>↓</span></button>
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
                placeholder={t('beats.notepad.placeholder')}
                className="w-full h-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 resize-none" />
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-[10px] md:text-xs text-gray-500">
              <span>{t('beats.notepad.autoSaved')}</span>
              <span>{(lyrics[notepadBeat.id] || '').length} {t('beats.notepad.chars')}</span>
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
                  <button onClick={() => goToBeat(currentBeat)} className="bg-[#8B5CF6] px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0">{t('beats.card.buy')}</button>
                ) : (
                  <a href="mailto:contact@trproductions.de" className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0">{t('beats.card.contact')}</a>
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
                      <span className="text-gray-500 text-xs font-normal">{t('beats.price.from')}</span>
                      {formatPrice(getLowestPrice(currentBeat))}
                    </span>
                    <button onClick={() => goToBeat(currentBeat)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2 rounded-full text-sm font-medium transition">{t('beats.card.buyNow')}</button>
                  </>
                ) : (
                  <a href="mailto:contact@trproductions.de" className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-medium transition">{t('beats.card.contact')}</a>
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