'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isDragging, setIsDragging] = useState(false)
  const [isHoveringProgress, setIsHoveringProgress] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBeat, setSelectedBeat] = useState(null)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [notepadBeat, setNotepadBeat] = useState(null)
  const [lyrics, setLyrics] = useState({})
  const [favorites, setFavorites] = useState([])
  const [showCopied, setShowCopied] = useState(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [volume, setVolume] = useState(1)
  
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const genres = ['All', 'Trap', 'Drill', 'R&B', 'Jersey', 'Rap']
  const allTags = ['dark', 'melodic', 'hard', 'emotional', 'bouncy', 'chill', 'aggressive', 'smooth', 'sad']

  const licenses = [
    { 
      id: 'mp3', 
      name: 'MP3 Lease', 
      priceKey: 'price_mp3',
      features: [
        'MP3 File',
        'Use for streaming only',
        'Up to 100,000 streams',
        'Must credit producer',
        'Non-exclusive rights'
      ]
    },
    { 
      id: 'wav', 
      name: 'WAV Lease', 
      priceKey: 'price_wav',
      features: [
        'WAV + MP3 Files',
        'Use for streaming & downloads',
        'Up to 500,000 streams',
        'Must credit producer',
        'Non-exclusive rights'
      ]
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      priceKey: 'price_stems',
      features: [
        'WAV + MP3 + Stems',
        'Unlimited streams & downloads',
        'Music videos allowed',
        'Must credit producer',
        'Non-exclusive rights'
      ]
    },
    { 
      id: 'exclusive', 
      name: 'Exclusive', 
      priceKey: 'price_exclusive',
      features: [
        'WAV + MP3 + Stems + Trackouts',
        'Full ownership rights',
        'Beat removed from store',
        'No credit required',
        'Exclusive rights'
      ],
      highlight: true
    },
  ]

  // Fetch beats from Supabase
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

    if (error) {
      console.error('Error fetching beats:', error)
    } else {
      setBeats(data || [])
    }
    setLoading(false)
  }

  // Load favorites and lyrics from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tr-favorites')
    const savedLyrics = localStorage.getItem('tr-lyrics')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedLyrics) setLyrics(JSON.parse(savedLyrics))
  }, [])

  useEffect(() => {
    localStorage.setItem('tr-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('tr-lyrics', JSON.stringify(lyrics))
  }, [lyrics])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
        setProgress((audio.currentTime / audio.duration) * 100 || 0)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

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
  }, [isDragging])

  // Update volume
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
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (beat.key && beat.key.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (beat.tags && beat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesGenre && matchesTag && matchesSearch && matchesFavorites
  })

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price || 29.99)
  }

  const handlePlay = (beat) => {
    if (!beat.audio_url) {
      alert('No audio file available for this beat')
      return
    }

    if (currentBeat?.id === beat.id) {
      // Toggle play/pause for same beat
      if (isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play()
      }
    } else {
      // Play new beat
      setCurrentBeat(beat)
      setProgress(0)
      setCurrentTime(0)
      
      // Small delay to ensure audio source is updated
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
          audioRef.current.play().catch(err => {
            console.error('Error playing audio:', err)
          })
        }
      }, 100)
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

  const handleCheckout = () => {
    if (selectedBeat && selectedLicense) {
      const price = selectedBeat[selectedLicense.priceKey] || 29.99
      alert(`Proceeding to checkout:\n${selectedBeat.title} - ${selectedLicense.name} (${formatPrice(price)})`)
      handleCloseModal()
    }
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

  const seekTo = (percent) => {
    if (audioRef.current && duration) {
      const time = (percent / 100) * duration
      audioRef.current.currentTime = time
      setCurrentTime(time)
      setProgress(percent)
    }
  }

  const updateProgress = (clientX) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = ((clientX - rect.left) / rect.width) * 100
    const clampedPercent = Math.max(0, Math.min(100, percent))
    setProgress(clampedPercent)
    return clampedPercent
  }

  const handleProgressClick = (e) => {
    const percent = updateProgress(e.clientX)
    seekTo(percent)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    updateProgress(e.clientX)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      updateProgress(e.clientX)
    }

    const handleMouseUp = (e) => {
      if (isDragging) {
        const percent = updateProgress(e.clientX)
        seekTo(percent)
      }
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, duration])

  const skipTime = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
      audioRef.current.currentTime = newTime
    }
  }

  useEffect(() => {
    if (selectedBeat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedBeat])

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata">
        {currentBeat?.audio_url && <source src={currentBeat.audio_url} type="audio/mpeg" />}
      </audio>

      {/* Background Gradient + Sound Waves */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.07] blur-[180px] rounded-full" />
        
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundWavesBeats" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 160 Q 100 120, 200 160 T 400 160 T 600 160 T 800 160 T 1000 160 T 1200 160 T 1400 160 T 1600 160 T 1800 160 T 2000 160 T 2200 160 T 2400 160" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundWavesBeats)" />
        </svg>
      </div>

      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract wave shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.04]" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 300 Q 360 150, 720 300 T 1440 300 L 1440 600 L 0 600 Z" fill="url(#waveGradientBeats)"/>
          <defs>
            <linearGradient id="waveGradientBeats" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-[50%] opacity-[0.03]" viewBox="0 0 1440 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 Q 480 100, 960 250 T 1920 250 L 1920 500 L 0 500 Z" fill="url(#waveGradient2Beats)"/>
          <defs>
            <linearGradient id="waveGradient2Beats" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle center glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <Header />

      {/* Page Content */}
      <section className="relative pt-32 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Beat Store</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Browse Beats</h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Find your next hit. All beats are industry-ready and available for instant download.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeGenre === genre
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
            
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>♥</span>
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </motion.div>

          {/* Tags */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  activeTag === tag
                    ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            className="max-w-md mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search beats by title, genre, key, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 transition"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-gray-500">Loading beats...</p>
            </div>
          ) : (
            <>
              {/* Beats Grid */}
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {filteredBeats.map((beat, index) => (
                  <motion.div
                    key={beat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.15 } }}
                    className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-150"
                  >
                    {/* Cover Art */}
                    <div 
                      className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] flex items-center justify-center relative cursor-pointer"
                      onClick={() => handlePlay(beat)}
                    >
                      {beat.image_url ? (
                        <img src={beat.image_url} alt={beat.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-30">🎵</span>
                      )}
                      
                      {/* No Audio Indicator */}
                      {!beat.audio_url && (
                        <div className="absolute top-3 left-3 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                          No Audio
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {beat.is_featured && (
                        <div className="absolute top-3 left-3 bg-[#8B5CF6] text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {/* Favorite */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(beat.id); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                            favorites.includes(beat.id)
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                        >
                          <span className="text-sm">{favorites.includes(beat.id) ? '♥' : '♡'}</span>
                        </button>
                        
                        {/* Share */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(beat); }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition relative"
                        >
                          <span className="text-sm">↗</span>
                          {showCopied === beat.id && (
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                              Link copied!
                            </span>
                          )}
                        </button>
                        
                        {/* Notepad */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openNotepad(beat); }}
                          className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                        >
                          <span className="text-sm">✎</span>
                        </button>
                      </div>

                      {/* Play Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                        currentBeat?.id === beat.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                          {currentBeat?.id === beat.id && isPlaying ? (
                            <span className="text-black text-xl">❚❚</span>
                          ) : (
                            <span className="text-black text-xl ml-1">▶</span>
                          )}
                        </div>
                      </div>

                      {/* Now Playing Indicator */}
                      {currentBeat?.id === beat.id && isPlaying && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1">
                          <motion.div 
                            className="w-1 h-3 bg-[#8B5CF6] rounded-full"
                            animate={{ scaleY: [1, 0.5, 1] }}
                            transition={{ duration: 0.4, repeat: Infinity }}
                          />
                          <motion.div 
                            className="w-1 h-3 bg-[#8B5CF6] rounded-full"
                            animate={{ scaleY: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                          />
                          <motion.div 
                            className="w-1 h-3 bg-[#8B5CF6] rounded-full"
                            animate={{ scaleY: [1, 0.5, 1] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Beat Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{beat.title}</h3>
                        <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-full">{beat.genre}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{beat.bpm} BPM • {beat.key}</p>
                      
                      {/* Tags */}
                      {beat.tags && beat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {beat.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{formatPrice(beat.price_mp3)}</span>
                        <button 
                          onClick={() => handleBuyClick(beat)}
                          className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* No results message */}
              {filteredBeats.length === 0 && (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-5xl block mb-4">🎵</span>
                  <p className="text-gray-500 text-lg mb-4">No beats found matching your search.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveGenre('All'); setActiveTag(null); setShowFavoritesOnly(false); }}
                    className="text-[#8B5CF6] hover:underline"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Lyrics Notepad Panel */}
      <AnimatePresence>
        {notepadBeat && (
          <motion.div 
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[90] flex flex-col bg-[#0a0a0a] border-l border-white/10 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
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
                className="w-12 h-12 bg-[#8B5CF6] rounded-full flex items-center justify-center hover:bg-[#7C3AED] transition"
              >
                {currentBeat?.id === notepadBeat.id && isPlaying ? (
                  <span className="text-white">❚❚</span>
                ) : (
                  <span className="text-white ml-1">▶</span>
                )}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium">{notepadBeat.title}</p>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Selection Modal */}
      <AnimatePresence>
        {selectedBeat && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />
            
            {/* Modal Content */}
            <motion.div 
              className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Close Button */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition z-10"
              >
                <span className="text-xl">✕</span>
              </button>

              <div className="p-8">
                {/* Beat Info Header */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {selectedBeat.image_url ? (
                      <img src={selectedBeat.image_url} alt={selectedBeat.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🎵</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedBeat.title}</h2>
                    <p className="text-gray-500">{selectedBeat.genre} • {selectedBeat.bpm} BPM • {selectedBeat.key}</p>
                    {selectedBeat.tags && selectedBeat.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {selectedBeat.tags.map(tag => (
                          <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* License Options */}
                <h3 className="text-lg font-semibold mb-6">Select License</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {licenses.map((license) => {
                    const price = selectedBeat[license.priceKey] || 29.99
                    return (
                      <div
                        key={license.id}
                        onClick={() => setSelectedLicense(license)}
                        className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                          selectedLicense?.id === license.id
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        } ${license.highlight ? 'ring-1 ring-[#8B5CF6]/50' : ''}`}
                      >
                        {license.highlight && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-xs px-3 py-1 rounded-full">
                            Best Value
                          </span>
                        )}
                        <h4 className="font-semibold mb-1">{license.name}</h4>
                        <p className="text-2xl font-bold mb-4">{formatPrice(price)}</p>
                        <ul className="space-y-2">
                          {license.features.map((feature, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-[#8B5CF6] mt-0.5">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>

                {/* Checkout Button */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    {selectedLicense && (
                      <p className="text-gray-400">
                        Total: <span className="text-white font-bold text-xl">{formatPrice(selectedBeat[selectedLicense.priceKey])}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedLicense}
                    className={`px-8 py-3 rounded-full font-semibold transition ${
                      selectedLicense
                        ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedLicense ? 'Proceed to Checkout' : 'Select a License'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Audio Player */}
      <AnimatePresence>
        {currentBeat && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between gap-6">
                
                {/* Track Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {currentBeat.image_url ? (
                      <img src={currentBeat.image_url} alt={currentBeat.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🎵</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate">{currentBeat.title}</h4>
                    <p className="text-gray-500 text-xs">{currentBeat.genre} • {currentBeat.bpm} BPM • {currentBeat.key}</p>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                  
                  {/* Skip Back 15s */}
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition flex-shrink-0"
                    onClick={() => skipTime(-15)}
                    title="Skip back 15s"
                  >
                    <span className="text-xs font-bold">-15</span>
                  </button>

                  {/* Play/Pause */}
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

                  {/* Skip Forward 15s */}
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition flex-shrink-0"
                    onClick={() => skipTime(15)}
                    title="Skip forward 15s"
                  >
                    <span className="text-xs font-bold">+15</span>
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="flex-1 hidden sm:block select-none">
                    <div 
                      ref={progressRef}
                      className="relative h-8 flex items-center group cursor-pointer"
                      onClick={handleProgressClick}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={() => setIsHoveringProgress(true)}
                      onMouseLeave={() => !isDragging && setIsHoveringProgress(false)}
                    >
                      {/* Track background */}
                      <div className={`absolute left-0 right-0 bg-white/10 rounded-full transition-all duration-75 ${
                        isHoveringProgress || isDragging ? 'h-2' : 'h-1'
                      }`}>
                        {/* Progress fill */}
                        <div 
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      
                      {/* Scrubber handle */}
                      <div 
                        className={`absolute transition-opacity duration-75 ${
                          isHoveringProgress || isDragging 
                            ? 'opacity-100' 
                            : 'opacity-0'
                        }`}
                        style={{ 
                          left: `${progress}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div 
                          className={`w-4 h-4 bg-white rounded-full shadow-lg shadow-[#8B5CF6]/50 transition-transform duration-75 ${
                            isDragging ? 'scale-125' : ''
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="hidden md:flex items-center gap-2">
                    <button 
                      onClick={() => setVolume(volume > 0 ? 0 : 1)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
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

                {/* Buy Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold hidden sm:block">{formatPrice(currentBeat.price_mp3)}</span>
                  <button 
                    onClick={() => handleBuyClick(currentBeat)}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2 rounded-full text-sm font-medium transition"
                  >
                    Buy Now
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

    </main>
  )
}