'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function BeatsPage() {
  const [activeGenre, setActiveGenre] = useState('All')
  const [activeTag, setActiveTag] = useState(null)
  const [currentBeat, setCurrentBeat] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
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
  const progressRef = useRef(null)

  const genres = ['All', 'Trap', 'Drill', 'R&B', 'Jersey', 'Rap']
  const allTags = ['dark', 'melodic', 'hard', 'emotional', 'bouncy', 'chill', 'aggressive', 'sad']

  const licenses = [
    { 
      id: 'mp3', 
      name: 'MP3 Lease', 
      price: 29.99, 
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
      price: 49.99, 
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
      price: 99.99, 
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
      price: 299.99, 
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

  const beats = [
    { id: 1, title: 'Midnight Dreams', genre: 'Trap', bpm: 140, key: 'Cm', price: 29.99, duration: '3:24', tags: ['dark', 'melodic', 'emotional'] },
    { id: 2, title: 'City Lights', genre: 'R&B', bpm: 85, key: 'G', price: 34.99, duration: '2:58', tags: ['chill', 'melodic', 'emotional'] },
    { id: 3, title: 'No Mercy', genre: 'Drill', bpm: 150, key: 'Fm', price: 29.99, duration: '3:12', tags: ['dark', 'hard', 'aggressive'] },
    { id: 4, title: 'Diamonds', genre: 'Trap', bpm: 130, key: 'Am', price: 39.99, duration: '3:45', tags: ['melodic', 'bouncy', 'chill'] },
    { id: 5, title: 'Street Tales', genre: 'Rap', bpm: 90, key: 'Dm', price: 29.99, duration: '3:30', tags: ['dark', 'hard', 'emotional'] },
    { id: 6, title: 'Vibe Check', genre: 'Jersey', bpm: 110, key: 'Bb', price: 34.99, duration: '2:48', tags: ['bouncy', 'chill', 'melodic'] },
    { id: 7, title: 'Dark Mode', genre: 'Drill', bpm: 145, key: 'Em', price: 29.99, duration: '3:15', tags: ['dark', 'aggressive', 'hard'] },
    { id: 8, title: 'Summer Nights', genre: 'R&B', bpm: 75, key: 'F', price: 39.99, duration: '4:02', tags: ['chill', 'melodic', 'sad'] },
  ]

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

  const filteredBeats = beats.filter(beat => {
    const matchesGenre = activeGenre === 'All' || beat.genre === activeGenre
    const matchesTag = !activeTag || beat.tags.includes(activeTag)
    const matchesFavorites = !showFavoritesOnly || favorites.includes(beat.id)
    const matchesSearch = searchQuery === '' || 
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesGenre && matchesTag && matchesSearch && matchesFavorites
  })

  const formatTime = (progressPercent, totalDuration) => {
    const [mins, secs] = totalDuration.split(':').map(Number)
    const totalSeconds = mins * 60 + secs
    const currentSeconds = Math.floor((progressPercent / 100) * totalSeconds)
    const currentMins = Math.floor(currentSeconds / 60)
    const currentSecs = currentSeconds % 60
    return `${currentMins}:${currentSecs.toString().padStart(2, '0')}`
  }

  const handlePlay = (beat) => {
    if (currentBeat?.id === beat.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentBeat(beat)
      setIsPlaying(true)
      setProgress(0)
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
      alert(`Proceeding to checkout:\n${selectedBeat.title} - ${selectedLicense.name} ($${selectedLicense.price})`)
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

  const updateProgress = (clientX) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = ((clientX - rect.left) / rect.width) * 100
    setProgress(Math.max(0, Math.min(100, percent)))
  }

  const handleProgressClick = (e) => {
    updateProgress(e.clientX)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.classList.add('is-dragging')
    updateProgress(e.clientX)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      updateProgress(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.classList.remove('is-dragging')
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    return () => {
      document.body.classList.remove('is-dragging')
    }
  }, [])

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

      {/* Background Gradient + Sound Waves - Same as Homepage */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.07] blur-[180px] rounded-full" />
        
        {/* Subtle sound wave lines */}
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
                  <span className="text-5xl opacity-30">🎵</span>
                  
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
                </div>

                {/* Beat Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{beat.title}</h3>
                    <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-full">{beat.genre}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{beat.bpm} BPM • {beat.key} • {beat.duration}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {beat.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold">${beat.price}</span>
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
              <p className="text-gray-500 text-lg">No beats found matching your search.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveGenre('All'); setActiveTag(null); setShowFavoritesOnly(false); }}
                className="mt-4 text-[#8B5CF6] hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
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
                  <div className="w-24 h-24 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedBeat.title}</h2>
                    <p className="text-gray-500">{selectedBeat.genre} • {selectedBeat.bpm} BPM • {selectedBeat.key}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedBeat.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* License Options */}
                <h3 className="text-lg font-semibold mb-6">Select License</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {licenses.map((license) => (
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
                      <p className="text-2xl font-bold mb-4">${license.price}</p>
                      <ul className="space-y-2">
                        {license.features.map((feature, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-[#8B5CF6] mt-0.5">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Checkout Button */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    {selectedLicense && (
                      <p className="text-gray-400">
                        Total: <span className="text-white font-bold text-xl">${selectedLicense.price}</span>
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
      {currentBeat && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-6">
              
              {/* Track Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🎵</span>
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
                  onClick={() => setProgress(Math.max(0, progress - 15))}
                  title="Skip back 15s"
                >
                  <span className="text-xs font-bold">-15</span>
                </button>

                {/* Play/Pause */}
                <button 
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:scale-105 transition"
                  onClick={() => setIsPlaying(!isPlaying)}
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
                  onClick={() => setProgress(Math.min(100, progress + 15))}
                  title="Skip forward 15s"
                >
                  <span className="text-xs font-bold">+15</span>
                </button>
                
                {/* Progress Bar */}
                <div className="flex-1 hidden sm:block select-none">
                  <div 
                    ref={progressRef}
                    className="relative h-8 flex items-center group"
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
                    <span>{formatTime(progress, currentBeat.duration)}</span>
                    <span>{currentBeat.duration}</span>
                  </div>
                </div>
              </div>

              {/* Buy Section */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-bold hidden sm:block">${currentBeat.price}</span>
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

      <Footer />

    </main>
  )
}