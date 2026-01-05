'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function BeatsPage() {
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
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notepadBeat, setNotepadBeat] = useState(null)
  const [lyrics, setLyrics] = useState({})
  
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const genres = ['All', 'Trap', 'Drill', 'R&B', 'Jersey', 'Rap']
  const allTags = ['dark', 'melodic', 'hard', 'emotional', 'bouncy', 'chill', 'aggressive', 'smooth', 'sad']

  const licenses = [
    { 
      id: 'mp3', 
      name: 'MP3 Lease', 
      priceKey: 'price_mp3',
      features: ['MP3 File', 'Up to 100,000 streams', 'Must credit producer', 'Non-exclusive rights']
    },
    { 
      id: 'wav', 
      name: 'WAV Lease', 
      priceKey: 'price_wav',
      features: ['WAV + MP3 Files', 'Up to 500,000 streams', 'Must credit producer', 'Non-exclusive rights']
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      priceKey: 'price_stems',
      features: ['WAV + MP3 + Stems', 'Unlimited streams', 'Music videos allowed', 'Non-exclusive rights']
    },
    { 
      id: 'exclusive', 
      name: 'Exclusive', 
      priceKey: 'price_exclusive',
      features: ['Full ownership rights', 'Beat removed from store', 'No credit required', 'Exclusive rights'],
      highlight: true
    },
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchBeats()
  }, [])

  const fetchBeats = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })

    if (!error) {
      setBeats(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const savedFavorites = localStorage.getItem('tr-favorites')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    const savedLyrics = localStorage.getItem('tr-lyrics')
    if (savedLyrics) setLyrics(JSON.parse(savedLyrics))
  }, [])

  useEffect(() => {
    localStorage.setItem('tr-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('tr-lyrics', JSON.stringify(lyrics))
  }, [lyrics])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const filteredBeats = beats.filter(beat => {
    const matchesGenre = activeGenre === 'All' || beat.genre === activeGenre
    const matchesTag = !activeTag || (beat.tags && beat.tags.includes(activeTag))
    const matchesFavorites = !showFavoritesOnly || favorites.includes(beat.id)
    const matchesSearch = searchQuery === '' || 
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGenre && matchesTag && matchesSearch && matchesFavorites
  })

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price || 29.99)
  }

  const handlePlay = (beat) => {
    if (!beat.audio_url) return

    if (currentBeat?.id === beat.id) {
      if (isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play()
      }
    } else {
      setCurrentBeat(beat)
      setProgress(0)
      setCurrentTime(0)
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
          audioRef.current.play().catch(err => console.error('Error playing:', err))
        }
      }, 100)
    }
  }

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    const clampedPercent = Math.max(0, Math.min(100, percent))
    const time = (clampedPercent / 100) * duration
    audioRef.current.currentTime = time
    setProgress(clampedPercent)
    setCurrentTime(time)
  }

  const toggleFavorite = (beatId) => {
    setFavorites(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    )
  }

  const handleShare = async (beat) => {
    const url = `${window.location.origin}/beats?id=${beat.id}`
    try {
      await navigator.clipboard.writeText(url)
      setShowCopied(beat.id)
      setTimeout(() => setShowCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleBuyClick = (beat) => {
    setSelectedBeat(beat)
    setSelectedLicense(null)
  }

  const handleCloseModal = () => {
    setSelectedBeat(null)
    setSelectedLicense(null)
  }

  const openNotepad = (beat) => {
    setNotepadBeat(beat)
    if (!lyrics[beat.id]) {
      setLyrics(prev => ({ ...prev, [beat.id]: '' }))
    }
  }

  const updateLyrics = (beatId, text) => {
    setLyrics(prev => ({ ...prev, [beatId]: text }))
  }

  const downloadLyrics = (beat) => {
    const text = lyrics[beat.id] || ''
    const blob = new Blob([`${beat.title} - Lyrics\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${beat.title.replace(/\s+/g, '_')}_lyrics.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCheckout = () => {
    if (selectedBeat && selectedLicense) {
      const price = selectedBeat[selectedLicense.priceKey] || 29.99
      alert(`Proceeding to checkout:\n${selectedBeat.title} - ${selectedLicense.name} (${formatPrice(price)})`)
      handleCloseModal()
    }
  }

  useEffect(() => {
    if (selectedBeat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [selectedBeat])

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">

      <audio ref={audioRef} preload="metadata">
        {currentBeat?.audio_url && <source src={currentBeat.audio_url} type="audio/mpeg" />}
      </audio>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.08] rounded-full"
          style={{ filter: isMobile ? 'blur(100px)' : 'blur(180px)' }}
        />
        <div 
          className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.05] rounded-full"
          style={{ filter: isMobile ? 'blur(80px)' : 'blur(150px)' }}
        />
        
        {!isMobile && (
          <>
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
              }}
            />
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="soundWavesBeats" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
                  <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                  <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#soundWavesBeats)" />
            </svg>
          </>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#050505] to-transparent" />
      </div>

      <Header />

      {/* Page Content */}
      <section className={`relative pt-28 md:pt-32 px-4 md:px-6 ${currentBeat ? 'pb-36 md:pb-32' : 'pb-20'}`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Beat Store</p>
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-3 md:mb-4">Browse Beats</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Find your next hit. All beats are industry-ready and available for instant download.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                  activeGenre === genre
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
            
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>♥</span>
              {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-8 md:mb-12">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10 md:mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search beats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-5 md:px-6 py-2.5 md:py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition"
              />
              <span className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Loading beats...</p>
            </div>
          ) : (
            <>
              {/* Beats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredBeats.map((beat, index) => (
                  <div
                    key={beat.id}
                    className="group bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl overflow-hidden hover:border-[#8B5CF6]/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Cover Art */}
                    <div 
                      className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] relative cursor-pointer overflow-hidden"
                      onClick={() => handlePlay(beat)}
                    >
                      {beat.image_url ? (
                        <img src={beat.image_url} alt={beat.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl md:text-5xl opacity-30">🎵</span>
                        </div>
                      )}
                      
                      {!beat.audio_url && (
                        <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          No Audio
                        </div>
                      )}
                      
                      {beat.is_featured && (
                        <div className="absolute top-2 left-2 bg-[#8B5CF6] text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          Featured
                        </div>
                      )}
                      
                      {/* Action Buttons - Desktop */}
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                            favorites.includes(beat.id) ? 'bg-red-500/20 text-red-400' : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                        >
                          <span className="text-sm">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                        </button>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(beat); }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition relative"
                        >
                          <span className="text-sm">↗</span>
                          {showCopied === beat.id && (
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                              Copied!
                            </span>
                          )}
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); openNotepad(beat); }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                          title="Write lyrics"
                        >
                          <span className="text-sm">✎</span>
                        </button>
                      </div>

                      {/* Play Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
                        currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                          {currentBeat?.id === beat.id && isPlaying ? (
                            <span className="text-black text-sm md:text-xl">❚❚</span>
                          ) : (
                            <span className="text-black text-sm md:text-xl ml-0.5">▶</span>
                          )}
                        </div>
                      </div>

                      {/* Playing Indicator */}
                      {currentBeat?.id === beat.id && isPlaying && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-0.5">
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-equalizer" />
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-100" />
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-200" />
                        </div>
                      )}
                    </div>

                    {/* Beat Info */}
                    <div className="p-3 md:p-5">
                      <div className="flex items-start justify-between mb-1 md:mb-2 gap-2">
                        <h3 className="font-semibold text-sm md:text-base truncate">{beat.title}</h3>
                        <span className="text-[10px] md:text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">{beat.genre}</span>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">{beat.bpm} BPM • {beat.key}</p>
                      
                      {/* Tags - Desktop only */}
                      {beat.tags && beat.tags.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1 mb-4">
                          {beat.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm md:text-base">{formatPrice(beat.price_mp3)}</span>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          {/* Mobile action buttons */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id); }}
                            className={`w-7 h-7 md:hidden rounded-full flex items-center justify-center transition ${
                              favorites.includes(beat.id) ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'
                            }`}
                          >
                            <span className="text-xs">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openNotepad(beat); }}
                            className="w-7 h-7 md:hidden rounded-full bg-white/5 text-gray-400 flex items-center justify-center"
                            title="Write lyrics"
                          >
                            <span className="text-xs">✎</span>
                          </button>
                          <button 
                            onClick={() => handleBuyClick(beat)}
                            className="bg-white text-black px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium hover:bg-gray-200 transition"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No results */}
              {filteredBeats.length === 0 && (
                <div className="text-center py-20">
                  <span className="text-5xl block mb-4">🎵</span>
                  <p className="text-gray-500 text-lg mb-4">No beats found.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveGenre('All'); setActiveTag(null); setShowFavoritesOnly(false); }}
                    className="text-[#8B5CF6] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lyrics Notepad Panel */}
      {notepadBeat && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotepadBeat(null)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Lyrics Notepad</h3>
                <p className="text-sm text-gray-500">{notepadBeat.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadLyrics(notepadBeat)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                  title="Download lyrics"
                >
                  <span>↓</span>
                </button>
                <button
                  onClick={() => setNotepadBeat(null)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  <span>✕</span>
                </button>
              </div>
            </div>

            {/* Play Button */}
            <div className="p-4 border-b border-white/10 flex items-center gap-4">
              <button
                onClick={() => handlePlay(notepadBeat)}
                className="w-12 h-12 bg-[#8B5CF6] rounded-full flex items-center justify-center hover:bg-[#7C3AED] transition flex-shrink-0"
              >
                {currentBeat?.id === notepadBeat.id && isPlaying ? (
                  <span className="text-white">❚❚</span>
                ) : (
                  <span className="text-white ml-1">▶</span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{notepadBeat.title}</p>
                <p className="text-xs text-gray-500">{notepadBeat.bpm} BPM • {notepadBeat.key}</p>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 p-4">
              <textarea
                value={lyrics[notepadBeat.id] || ''}
                onChange={(e) => updateLyrics(notepadBeat.id, e.target.value)}
                placeholder="Start writing your lyrics here...

Pro tip: Play the beat while you write to match the flow and vibe."
                className="w-full h-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
              <span>Auto-saved to browser</span>
              <span>{(lyrics[notepadBeat.id] || '').length} characters</span>
            </div>
          </div>
        </div>
      )}

      {/* License Modal */}
      {selectedBeat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition z-10"
            >
              <span className="text-lg md:text-xl">✕</span>
            </button>

            <div className="p-5 md:p-8">
              {/* Beat Info */}
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-white/10">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex-shrink-0 overflow-hidden">
                  {selectedBeat.image_url ? (
                    <img src={selectedBeat.image_url} alt={selectedBeat.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl md:text-4xl">🎵</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{selectedBeat.title}</h2>
                  <p className="text-gray-500 text-sm md:text-base">{selectedBeat.genre} • {selectedBeat.bpm} BPM • {selectedBeat.key}</p>
                </div>
              </div>

              {/* License Options */}
              <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Select License</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {licenses.map((license) => {
                  const price = selectedBeat[license.priceKey] || 29.99
                  return (
                    <div
                      key={license.id}
                      onClick={() => setSelectedLicense(license)}
                      className={`relative p-3 md:p-5 rounded-xl md:rounded-2xl border cursor-pointer transition-all ${
                        selectedLicense?.id === license.id
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      } ${license.highlight ? 'ring-1 ring-[#8B5CF6]/50' : ''}`}
                    >
                      {license.highlight && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          Best Value
                        </span>
                      )}
                      <h4 className="font-semibold text-sm md:text-base mb-1">{license.name}</h4>
                      <p className="text-lg md:text-2xl font-bold mb-2 md:mb-4">{formatPrice(price)}</p>
                      <ul className="space-y-1 md:space-y-2 hidden md:block">
                        {license.features.map((feature, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-[#8B5CF6]">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Checkout */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 md:pt-6 border-t border-white/10">
                <div>
                  {selectedLicense && (
                    <p className="text-gray-400 text-sm md:text-base">
                      Total: <span className="text-white font-bold text-lg md:text-xl">{formatPrice(selectedBeat[selectedLicense.priceKey])}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={!selectedLicense}
                  className={`w-full md:w-auto px-6 md:px-8 py-3 rounded-full font-semibold transition ${
                    selectedLicense
                      ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedLicense ? 'Proceed to Checkout' : 'Select a License'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Audio Player */}
      {currentBeat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
          {/* Progress Bar - Full Width on Mobile */}
          <div 
            ref={isMobile ? progressRef : null}
            className="h-1 bg-white/10 cursor-pointer md:hidden"
            onClick={isMobile ? handleProgressClick : undefined}
          >
            <div 
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="px-4 py-3 md:px-6 md:py-4">
            {/* Mobile Layout */}
            <div className="flex md:hidden items-center gap-3">
              {/* Album Art */}
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex-shrink-0 overflow-hidden">
                {currentBeat.image_url ? (
                  <img src={currentBeat.image_url} alt={currentBeat.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                )}
              </div>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentBeat.title}</h4>
                <p className="text-gray-500 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button 
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                  onClick={() => handlePlay(currentBeat)}
                >
                  {isPlaying ? (
                    <span className="text-black text-sm">❚❚</span>
                  ) : (
                    <span className="text-black text-sm ml-0.5">▶</span>
                  )}
                </button>
                
                <button 
                  onClick={() => handleBuyClick(currentBeat)}
                  className="bg-[#8B5CF6] px-4 py-2 rounded-full text-xs font-medium flex-shrink-0"
                >
                  Buy
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-6">
              {/* Track Info */}
              <div className="flex items-center gap-4 min-w-0 w-1/4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex-shrink-0 overflow-hidden">
                  {currentBeat.image_url ? (
                    <img src={currentBeat.image_url} alt={currentBeat.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg flex items-center justify-center w-full h-full">🎵</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{currentBeat.title}</h4>
                  <p className="text-gray-500 text-xs">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <button 
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:scale-105 transition"
                  onClick={() => handlePlay(currentBeat)}
                >
                  {isPlaying ? (
                    <span className="text-black text-sm">❚❚</span>
                  ) : (
                    <span className="text-black text-sm ml-0.5">▶</span>
                  )}
                </button>
                
                {/* Progress */}
                <div className="flex-1">
                  <div 
                    ref={progressRef}
                    className="h-1.5 bg-white/10 rounded-full cursor-pointer group"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setVolume(volume > 0 ? 0 : 1)} className="text-gray-400 hover:text-white">
                    {volume === 0 ? '🔇' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Buy */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-bold">{formatPrice(currentBeat.price_mp3)}</span>
                <button 
                  onClick={() => handleBuyClick(currentBeat)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2 rounded-full text-sm font-medium transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes equalizer {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-equalizer {
          animation: equalizer 0.5s ease-in-out infinite;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </main>
  )
}