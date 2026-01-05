'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Hook: detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}

export default function MixingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    trackName: '',
    genre: '',
    reference: '',
    notes: '',
    rushDelivery: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)
  
  // Audio player state
  const [audioMode, setAudioMode] = useState('mixed')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // Database state
  const [mixDemo, setMixDemo] = useState(null)
  const [recentMixes, setRecentMixes] = useState([])
  const [playingMixId, setPlayingMixId] = useState(null)
  
  // Audio refs
  const audioRef = useRef(null)
  const mixAudioRef = useRef(null)

  const MIX_MASTER_PRICE = 60
  const RUSH_FEE = 30

  const stats = [
    { value: '150+', label: 'Tracks Mixed' },
    { value: '80+', label: 'Happy Artists' },
    { value: '48h', label: 'Avg. Delivery' },
    { value: '100%', label: 'Satisfaction' }
  ]

  const genres = [
    { name: 'Hip-Hop', icon: '🎤', description: 'Hard-hitting drums, punchy 808s, crisp vocals' },
    { name: 'Trap', icon: '🔥', description: 'Heavy bass, sharp hi-hats, atmospheric vibes' },
    { name: 'Drill', icon: '💀', description: 'Sliding 808s, dark melodies, aggressive energy' },
    { name: 'R&B', icon: '💜', description: 'Smooth vocals, warm tones, lush harmonies' },
    { name: 'Pop', icon: '✨', description: 'Radio-ready polish, bright and punchy' },
    { name: 'Afrobeat', icon: '🌍', description: 'Rhythmic percussion, vibrant energy' }
  ]

  const process = [
    { step: '01', title: 'Upload', description: 'Send your files via the form or WeTransfer', icon: '📤', time: 'Day 1' },
    { step: '02', title: 'Review', description: 'I listen and confirm the project details', icon: '🎧', time: 'Day 1' },
    { step: '03', title: 'Mix', description: 'Balancing, EQ, compression, effects', icon: '🎚️', time: 'Day 2' },
    { step: '04', title: 'Master', description: 'Final polish and loudness optimization', icon: '💎', time: 'Day 2-3' },
    { step: '05', title: 'Deliver', description: 'You receive WAV + MP3 files', icon: '✅', time: 'Day 3' }
  ]

  const whyWorkWithMe = [
    { 
      icon: '👤', 
      title: 'Personal Attention', 
      description: 'Not a big studio factory. I personally work on every track and treat it like my own.',
      highlight: 'Every mix gets my full focus'
    },
    { 
      icon: '💬', 
      title: 'Direct Communication', 
      description: 'No middleman, no waiting days for replies. You talk directly to me throughout the process.',
      highlight: 'Quick responses, always'
    },
    { 
      icon: '🎵', 
      title: 'Genre Expertise', 
      description: 'I actually listen to Hip-Hop, Trap, Drill, and R&B daily. I know what makes these genres hit.',
      highlight: 'I understand the sound you want'
    },
    { 
      icon: '💰', 
      title: 'Fair & Transparent', 
      description: 'One price, no hidden fees, no upsells. What you see is what you pay.',
      highlight: 'Just €60 per track'
    }
  ]

  const testimonials = [
    { name: 'Jay Flex', role: 'Rapper', text: 'TR made my vocals sit perfectly in the mix. The 808s hit hard and everything sounds professional. Will be back!', avatar: 'JF' },
    { name: 'Luna Marie', role: 'Singer', text: 'Finally found someone who understands R&B vocals. The warmth and clarity is exactly what I wanted.', avatar: 'LM' },
    { name: 'Dre Money', role: 'Artist', text: 'Quick turnaround, great communication, and the final mix was fire. 10/10 recommend.', avatar: 'DM' }
  ]

  const faqs = [
    { question: 'What files do I need to send?', answer: 'At minimum: your raw vocal recording (WAV preferred) and the beat/instrumental. If you have stems (separate tracks for drums, melody, bass), even better! The more I have to work with, the better the result.' },
    { question: 'How long does it take?', answer: 'Standard delivery is 2-3 business days. Need it faster? Rush delivery (24-48 hours) is available for an additional €30.' },
    { question: 'What if I need changes?', answer: 'One revision is included in the price. After hearing the first mix, you can request specific adjustments. Additional revisions are €15 each.' },
    { question: 'Can you mix tracks recorded elsewhere?', answer: 'Absolutely! Most of my clients record at home or other studios. As long as the recordings are decent quality, I can work with them.' },
    { question: 'Do you offer bulk discounts?', answer: 'Yes! For EP/album projects (5+ tracks), I offer 15% off. Get in touch to discuss your project.' },
    { question: 'What do I get when it is done?', answer: 'You receive the final mix in WAV (high quality) and MP3 (streaming ready) formats. Ready to upload to Spotify, Apple Music, etc.' }
  ]

  const trustBadges = [
    { icon: '⚡', title: 'Fast Delivery', subtitle: '2-3 days standard' },
    { icon: '🔄', title: 'Free Revision', subtitle: '1 included' },
    { icon: '💬', title: 'Direct Contact', subtitle: 'No middleman' },
    { icon: '✅', title: 'Satisfaction', subtitle: 'Guaranteed' }
  ]

  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  // Helper for scroll animations (disabled on mobile / reduced motion)
  const getScrollAnimation = (delay = 0) => {
    if (isMobile || prefersReducedMotion) return {}
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { delay }
    }
  }

  // Waveform configuration (lighter & deterministic)
  const BAR_COUNT = 40
  const waveformHeights = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => ({
      mixed: Math.sin(i * 0.3) * 30 + 50,
      raw: Math.sin(i * 0.3) * 15 + 25,
    }))
  }, [])

  // Fetch data on mount
  useEffect(() => {
    fetchMixDemo()
    fetchRecentMixes()
  }, [])

  const fetchMixDemo = async () => {
    const { data } = await supabase
      .from('mix_demos')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (data) setMixDemo(data)
  }

  const fetchRecentMixes = async () => {
    const { data } = await supabase
      .from('recent_mixes')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(8)
    
    setRecentMixes(data || [])
  }

  // Audio event listeners for demo player
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
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

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Audio event listeners for recent mixes player
  useEffect(() => {
    const audio = mixAudioRef.current
    if (!audio) return

    const handleEnded = () => setPlayingMixId(null)
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  // Update audio source when mode changes
  useEffect(() => {
    if (audioRef.current && mixDemo) {
      const newSrc = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
      if (newSrc && audioRef.current.src !== newSrc) {
        const wasPlaying = isPlaying
        const currentPos = audioRef.current.currentTime
        
        audioRef.current.src = newSrc
        audioRef.current.currentTime = Math.min(currentPos, audioRef.current.duration || currentPos)
        
        if (wasPlaying) {
          audioRef.current.play().catch(() => {})
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMode, mixDemo])

  const togglePlay = () => {
    if (!audioRef.current || !mixDemo) return
    
    const audioUrl = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
    if (!audioUrl) return

    // Stop any playing recent mix
    if (playingMixId) {
      mixAudioRef.current?.pause()
      setPlayingMixId(null)
    }

    if (!audioRef.current.src) {
      audioRef.current.src = audioUrl
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  const switchAudioMode = (mode) => {
    setAudioMode(mode)
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    const newTime = (percent / 100) * duration
    audioRef.current.currentTime = newTime
    setProgress(percent)
    setCurrentTime(newTime)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Play recent mix
  const playRecentMix = (mix) => {
    if (!mix.audio_url) return

    // Stop demo player if playing
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    }

    if (playingMixId === mix.id) {
      mixAudioRef.current?.pause()
      setPlayingMixId(null)
    } else {
      if (mixAudioRef.current) {
        mixAudioRef.current.src = mix.audio_url
        mixAudioRef.current.play().catch(console.error)
        setPlayingMixId(mix.id)
      }
    }
  }

  const calculateTotal = () => {
    return MIX_MASTER_PRICE + (formData.rushDelivery ? RUSH_FEE : 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { data, error } = await supabase
        .from('mix_requests')
        .insert([{
          name: formData.name,
          email: formData.email,
          track_name: formData.trackName,
          genre: formData.genre,
          reference_url: formData.reference || null,
          notes: formData.notes || null,
          rush_delivery: formData.rushDelivery,
          total_price: calculateTotal(),
          status: 'pending'
        }])
        .select()

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: '', email: '', trackName: '', genre: '', reference: '', notes: '', rushDelivery: false })
      setTimeout(() => setSubmitted(false), 10000)
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError(error.message || 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if demo audio is available
  const hasDemoAudio = mixDemo && (mixDemo.raw_audio_url || mixDemo.mixed_audio_url)
  const currentAudioAvailable = mixDemo && (audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url)

  const shouldAnimateWaveform = isPlaying && !isMobile && !prefersReducedMotion

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Hidden Audio Elements */}
      <audio ref={audioRef} preload="metadata" />
      <audio ref={mixAudioRef} preload="metadata" />
      
      {/* Background Effects - desktop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
        {/* Main gradient glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.08] rounded-full animate-glow-pulse"
          style={{ filter: 'blur(150px)' }}
        />
        
        {/* Secondary glow - bottom right */}
        <div 
          className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.05] rounded-full"
          style={{ filter: 'blur(120px)' }}
        />
        
        {/* Accent glow - left side */}
        <div 
          className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#6D28D9] opacity-[0.04] rounded-full"
          style={{ filter: 'blur(100px)' }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        
        {/* Sound waves SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundWavesMix" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundWavesMix)" />
        </svg>

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      {/* Simple mobile background */}
      <div className="fixed inset-0 pointer-events-none md:hidden">
        <div className="w-full h-full bg-gradient-to-b from-[#050505] via-[#050505] to-black" />
      </div>

      {/* Extra glow - desktop only */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none hidden md:block" />

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[#8B5CF6] font-medium mb-4 tracking-[0.2em] uppercase text-xs">Online Mixing Service</p>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Make Your Track <span className="text-[#8B5CF6]">Sound Pro</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Professional mixing and mastering for artists who want radio-ready sound. 
                Send your files, get back a polished track.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#submit" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
                  Get Started - €{MIX_MASTER_PRICE}
                </a>
                <a href="#process" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                  See How It Works
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{badge.title}</p>
                      <p className="text-xs text-gray-500">{badge.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Before/After Player - Real Audio */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-none md:backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Before & After</p>
                    <p className="font-semibold">Hear The Difference</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPlaying && (
                      <div className="flex items-center gap-1">
                        <motion.div 
                          className="w-1.5 h-4 bg-[#8B5CF6] rounded-full"
                          animate={{ scaleY: [1, 0.5, 1] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                        />
                        <motion.div 
                          className="w-1.5 h-4 bg-[#8B5CF6] rounded-full"
                          animate={{ scaleY: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div 
                          className="w-1.5 h-4 bg-[#8B5CF6] rounded-full"
                          animate={{ scaleY: [1, 0.5, 1] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex bg-white/5 rounded-full p-1 mb-6">
                  <button
                    onClick={() => switchAudioMode('raw')}
                    className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition ${
                      audioMode === 'raw' 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    🔇 Raw Recording
                  </button>
                  <button
                    onClick={() => switchAudioMode('mixed')}
                    className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition ${
                      audioMode === 'mixed' 
                        ? 'bg-[#8B5CF6] text-white' 
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    🔊 Mixed & Mastered
                  </button>
                </div>

                {/* Waveform Visualization (optimized) */}
                <div className={`relative h-24 flex items-center justify-center gap-[2px] mb-6 transition-all ${
                  audioMode === 'raw' ? 'opacity-50 grayscale' : 'opacity-100'
                }`}>
                  {waveformHeights.map((h, i) => {
                    const baseHeight = audioMode === 'mixed' ? h.mixed : h.raw
                    const isActive = (i / BAR_COUNT) * 100 <= progress

                    return (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-full transition-colors duration-150 ${
                          isActive 
                            ? audioMode === 'mixed'
                              ? 'bg-gradient-to-t from-[#8B5CF6] to-[#A78BFA]'
                              : 'bg-gradient-to-t from-gray-500 to-gray-400'
                            : 'bg-white/20'
                        }`}
                        style={{ height: baseHeight }}
                        animate={
                          shouldAnimateWaveform
                            ? { height: [baseHeight * 0.8, baseHeight * 1.2, baseHeight * 0.8] }
                            : { height: baseHeight }
                        }
                        transition={
                          shouldAnimateWaveform
                            ? { duration: 0.6, repeat: Infinity, delay: i * 0.02 }
                            : undefined
                        }
                      />
                    )
                  })}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                    audioMode === 'mixed' 
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {audioMode === 'mixed' ? '✨ Professional Mix' : '📼 Unprocessed Audio'}
                  </span>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={togglePlay}
                    disabled={!currentAudioAvailable}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      !currentAudioAvailable
                        ? 'bg-white/5 cursor-not-allowed opacity-50'
                        : audioMode === 'mixed' 
                          ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105' 
                          : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {isPlaying ? (
                      <span className="text-lg">❚❚</span>
                    ) : (
                      <span className="text-lg ml-1">▶</span>
                    )}
                  </button>
                  <div className="flex-1">
                    <div 
                      className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                      onClick={handleProgressClick}
                    >
                      <div
                        className={`h-full rounded-full transition-all relative ${
                          audioMode === 'mixed' ? 'bg-[#8B5CF6]' : 'bg-white/40'
                        }`}
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg transform translate-x-1/2" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {!hasDemoAudio && (
                  <p className="text-center text-gray-600 text-xs mt-6">
                    Demo audio coming soon
                  </p>
                )}
              </div>

              {/* Price Badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-[#8B5CF6] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-[#8B5CF6]/25"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                €{MIX_MASTER_PRICE}/track
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            {...getScrollAnimation()}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                {...getScrollAnimation(index * 0.1)}
              >
                <p className="text-4xl md:text-5xl font-bold text-[#8B5CF6] mb-2">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Work With Me */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">The Difference</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Why Work With Me</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Not just another mixing service. Here is what sets me apart.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {whyWorkWithMe.map((item, index) => (
              <motion.div
                key={item.title}
                {...getScrollAnimation(index * 0.1)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-[#8B5CF6]/30 transition group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#8B5CF6]/20 transition">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 mb-3 leading-relaxed">{item.description}</p>
                    <p className="text-[#8B5CF6] text-sm font-medium">{item.highlight}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Genre Specialties */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Specialties</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Genres I Mix</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Every genre has its own sound. I know what makes each one hit.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {genres.map((genre, index) => (
              <motion.div
                key={genre.name}
                {...getScrollAnimation(index * 0.1)}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveGenre(activeGenre === genre.name ? null : genre.name)}
                className={`relative bg-white/[0.02] border rounded-2xl p-6 cursor-pointer transition-all ${
                  activeGenre === genre.name 
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{genre.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{genre.name}</h3>
                    <p className="text-gray-500 text-sm">{genre.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="process" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">From Raw to Radio-Ready</h2>
            <p className="text-gray-500">Simple 5-step process. You send files, I deliver hits.</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
            
            <div className="grid md:grid-cols-5 gap-6">
              {process.map((item, index) => (
                <motion.div
                  key={item.step}
                  {...getScrollAnimation(index * 0.1)}
                  className="relative text-center"
                >
                  <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-[#0a0a0a] border-2 border-[#8B5CF6]/50 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  
                  <span className="text-[#8B5CF6] text-xs font-bold">{item.time}</span>
                  <h3 className="font-semibold mt-2 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects - From Database */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Portfolio</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Recent Mixes</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentMixes.map((project, index) => (
              <motion.div
                key={project.id}
                {...getScrollAnimation(index * 0.1)}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className={`aspect-square bg-gradient-to-br ${project.color || 'from-purple-500/20'} to-[#050505] rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-white/20 transition relative overflow-hidden`}>
                  {project.image_url ? (
                    // You can swap this <img> to Next.js <Image> if desired
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-5xl opacity-30">🎵</span>
                  )}
                  
                  {/* Play overlay */}
                  {project.audio_url && (
                    <div 
                      onClick={() => playRecentMix(project)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        playingMixId === project.id ? 'bg-white' : 'bg-[#8B5CF6]'
                      }`}>
                        {playingMixId === project.id ? (
                          <span className="text-[#8B5CF6]">❚❚</span>
                        ) : (
                          <span className="text-white ml-1">▶</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Now playing indicator */}
                  {playingMixId === project.id && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-[#8B5CF6] rounded-full"
                            animate={
                              isMobile || prefersReducedMotion
                                ? { height: '12px' }
                                : { height: ['8px', '16px', '8px'] }
                            }
                            transition={
                              isMobile || prefersReducedMotion
                                ? undefined
                                : { duration: 0.5, repeat: Infinity, delay: i * 0.1 }
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs">Playing</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-gray-500 text-sm">{project.artist} - {project.genre}</p>
              </motion.div>
            ))}

            {recentMixes.length === 0 && (
              <>
                {/* Fallback static projects if none in database */}
                {[
                  { title: 'Midnight Run', artist: 'Jay Flex', genre: 'Trap', color: 'from-purple-500/20' },
                  { title: 'City Dreams', artist: 'Luna', genre: 'R&B', color: 'from-pink-500/20' },
                  { title: 'No Cap', artist: 'Dre Money', genre: 'Hip-Hop', color: 'from-blue-500/20' },
                  { title: 'Slide', artist: 'K-Drill', genre: 'Drill', color: 'from-red-500/20' }
                ].map((project, index) => (
                  <motion.div
                    key={project.title}
                    {...getScrollAnimation(index * 0.1)}
                    whileHover={{ y: -8 }}
                    className="group cursor-pointer"
                  >
                    <div className={`aspect-square bg-gradient-to-br ${project.color} to-[#050505] rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-white/20 transition relative overflow-hidden`}>
                      <span className="text-5xl opacity-30">🎵</span>
                    </div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-gray-500 text-sm">{project.artist} - {project.genre}</p>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-8 md:p-12"
            {...getScrollAnimation()}
          >
            <div className="text-center mb-8">
              <span className="text-6xl block mb-4">🎚️</span>
              <h2 className="text-3xl font-bold mb-2">Mix & Master</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold">€{MIX_MASTER_PRICE}</span>
                <span className="text-gray-400">per track</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="font-medium mb-2">Standard Delivery</p>
                <p className="text-gray-500 text-sm">2-3 business days</p>
                <p className="text-[#8B5CF6] font-semibold mt-2">Included</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-[#8B5CF6]/20">
                <p className="font-medium mb-2">Rush Delivery ⚡</p>
                <p className="text-gray-500 text-sm">24-48 hours</p>
                <p className="text-[#8B5CF6] font-semibold mt-2">+€{RUSH_FEE}</p>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {['Full mixing & mastering', 'WAV + MP3 delivery', '1 revision included', 'Direct communication', 'Streaming-ready format'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-[#8B5CF6]">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a href="#submit" className="block w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-4 rounded-full font-semibold text-center transition">
              Get Started Now
            </a>

            <p className="text-center text-gray-500 text-xs mt-4">
              15% discount on 5+ tracks
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Reviews</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Artists Love It</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                {...getScrollAnimation(index * 0.1)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4 text-[#8B5CF6]">
                  {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Form */}
      <section id="submit" className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Get Started</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Submit Your Track</h2>
            <p className="text-gray-500">Fill out the form and I will get back to you within 24 hours.</p>
          </motion.div>

          <motion.div
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8"
            {...getScrollAnimation()}
          >
            {submitted ? (
              <div className="text-center py-12">
                <motion.span 
                  className="text-6xl block mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  ✅
                </motion.span>
                <h3 className="text-2xl font-bold mb-2">Request Submitted!</h3>
                <p className="text-gray-500 mb-4">I will review your project and get back to you within 24 hours.</p>
                <div className="bg-white/5 rounded-xl p-4 inline-block">
                  <p className="text-sm text-gray-400">Send your audio files to:</p>
                  <p className="text-[#8B5CF6] font-medium">mix@trproductions.de</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Track Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.trackName}
                      onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Song title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Genre *</label>
                    <select
                      required
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                    >
                      <option value="">Select genre</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="Trap">Trap</option>
                      <option value="Drill">Drill</option>
                      <option value="R&B">R&B</option>
                      <option value="Pop">Pop</option>
                      <option value="Afrobeat">Afrobeat</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reference Track (optional)</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                    placeholder="Link to a song with a similar vibe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
                    placeholder="Any specific requests or vision for the track..."
                  />
                </div>

                {/* Rush Delivery Toggle */}
                <div
                  onClick={() => setFormData({ ...formData, rushDelivery: !formData.rushDelivery })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.rushDelivery
                      ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <p className="font-medium">Rush Delivery</p>
                        <p className="text-gray-500 text-sm">Get your mix in 24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8B5CF6] font-semibold">+€{RUSH_FEE}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        formData.rushDelivery ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/30'
                      }`}>
                        {formData.rushDelivery && <span className="text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-[#8B5CF6]">€{calculateTotal()}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-full font-semibold transition flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>

                <p className="text-center text-gray-600 text-xs">
                  After submitting, send your files to mix@trproductions.de or via WeTransfer
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...getScrollAnimation()}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Questions?</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                {...getScrollAnimation(index * 0.05)}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <span className={`text-[#8B5CF6] transition-transform text-xl ${activeFaq === index ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Ready to Sound Pro?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Submit your track today. Professional mix and master for just €{MIX_MASTER_PRICE}.
            </p>
            <a href="#submit" className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.08; transform: scale(1) translateX(-50%); }
          50% { opacity: 0.12; transform: scale(1.05) translateX(-50%); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
