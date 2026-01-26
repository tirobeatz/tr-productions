'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'
import { Parallax } from '../components/animations'

export default function MixingPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', trackName: '', genre: '', reference: '', notes: '', rushDelivery: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)
  const [hoveredProcess, setHoveredProcess] = useState(null)

  const [audioMode, setAudioMode] = useState('mixed')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [mixDemo, setMixDemo] = useState(null)
  const [recentMixes, setRecentMixes] = useState([])
  const [playingMixId, setPlayingMixId] = useState(null)

  const audioRef = useRef(null)
  const mixAudioRef = useRef(null)

  const MIX_MASTER_PRICE = 60
  const RUSH_FEE = 30

  const stats = [
    { value: '150+', label: 'Tracks Mixed', icon: '🎚️' },
    { value: '80+', label: 'Happy Artists', icon: '🎤' },
    { value: '48h', label: 'Avg. Delivery', icon: '⚡' },
    { value: '100%', label: 'Satisfaction', icon: '⭐' }
  ]

  const genres = [
    { name: 'Hip-Hop', icon: '🎤', desc: 'Hard-hitting drums, punchy 808s, crisp vocals', color: '#8B5CF6' },
    { name: 'Trap', icon: '🔥', desc: 'Heavy bass, sharp hi-hats, atmospheric vibes', color: '#EF4444' },
    { name: 'Drill', icon: '💀', desc: 'Sliding 808s, dark melodies, aggressive energy', color: '#6B7280' },
    { name: 'R&B', icon: '💜', desc: 'Smooth vocals, warm tones, lush harmonies', color: '#EC4899' },
    { name: 'Pop', icon: '✨', desc: 'Radio-ready polish, bright and punchy', color: '#F59E0B' },
    { name: 'Afrobeat', icon: '🌍', desc: 'Rhythmic percussion, vibrant energy', color: '#10B981' }
  ]

  const process = [
    { step: '01', title: 'Upload', desc: 'Send your files via the form or WeTransfer', icon: '📤', time: 'Day 1' },
    { step: '02', title: 'Review', desc: 'I listen and confirm the project details', icon: '🎧', time: 'Day 1' },
    { step: '03', title: 'Mix', desc: 'Balancing, EQ, compression, effects', icon: '🎚️', time: 'Day 2' },
    { step: '04', title: 'Master', desc: 'Final polish and loudness optimization', icon: '💎', time: 'Day 2-3' },
    { step: '05', title: 'Deliver', desc: 'You receive WAV + MP3 files', icon: '✅', time: 'Day 3' }
  ]

  const whyMe = [
    { icon: '👤', title: 'Personal Attention', desc: 'Not a big studio factory. I personally work on every track.', highlight: 'Every mix gets my full focus' },
    { icon: '💬', title: 'Direct Communication', desc: 'No middleman, no waiting days for replies.', highlight: 'Quick responses, always' },
    { icon: '🎵', title: 'Genre Expertise', desc: 'I actually listen to Hip-Hop, Trap, Drill, and R&B daily.', highlight: 'I understand the sound you want' },
    { icon: '💰', title: 'Fair & Transparent', desc: 'One price, no hidden fees, no upsells.', highlight: 'Just €60 per track' }
  ]

  const testimonials = [
    { name: 'Jay Flex', role: 'Rapper', text: 'TR made my vocals sit perfectly in the mix. The 808s hit hard and everything sounds professional.', avatar: 'JF' },
    { name: 'Luna Marie', role: 'Singer', text: 'Finally found someone who understands R&B vocals. The warmth and clarity is exactly what I wanted.', avatar: 'LM' },
    { name: 'Dre Money', role: 'Artist', text: 'Quick turnaround, great communication, and the final mix was fire. 10/10 recommend.', avatar: 'DM' }
  ]

  const faqs = [
    { q: 'What files do I need to send?', a: 'At minimum: your raw vocal recording (WAV preferred) and the beat/instrumental. If you have stems, even better!' },
    { q: 'How long does it take?', a: 'Standard delivery is 2-3 business days. Rush delivery (24-48 hours) is available for +€30.' },
    { q: 'What if I need changes?', a: 'One revision is included. Additional revisions are €15 each.' },
    { q: 'Can you mix tracks recorded elsewhere?', a: 'Absolutely! As long as the recordings are decent quality, I can work with them.' },
    { q: 'Do you offer bulk discounts?', a: 'Yes! For EP/album projects (5+ tracks), I offer 15% off.' },
    { q: 'What do I get when it is done?', a: 'You receive the final mix in WAV + MP3 formats. Ready for Spotify, Apple Music, etc.' }
  ]

  const trustBadges = [
    { icon: '⚡', title: 'Fast Delivery', sub: '2-3 days' },
    { icon: '🔄', title: 'Free Revision', sub: '1 included' },
    { icon: '💬', title: 'Direct Contact', sub: 'No middleman' },
    { icon: '✅', title: 'Satisfaction', sub: 'Guaranteed' }
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    fetchMixDemo()
    fetchRecentMixes()

    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchMixDemo = async () => {
    const { data } = await supabase.from('mix_demos').select('*').eq('is_active', true).limit(1).single()
    if (data) setMixDemo(data)
  }

  const fetchRecentMixes = async () => {
    const { data } = await supabase.from('recent_mixes').select('*').eq('is_visible', true).order('created_at', { ascending: false }).limit(8)
    setRecentMixes(data || [])
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => { setCurrentTime(audio.currentTime); if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100) }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd) }
  }, [])

  useEffect(() => {
    const audio = mixAudioRef.current
    if (!audio) return
    const onEnd = () => setPlayingMixId(null)
    audio.addEventListener('ended', onEnd)
    return () => audio.removeEventListener('ended', onEnd)
  }, [])

  useEffect(() => {
    if (audioRef.current && mixDemo) {
      const newSrc = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
      if (newSrc && audioRef.current.src !== newSrc) {
        const wasPlaying = isPlaying, pos = audioRef.current.currentTime
        audioRef.current.src = newSrc
        audioRef.current.currentTime = Math.min(pos, audioRef.current.duration || pos)
        if (wasPlaying) audioRef.current.play().catch(() => {})
      }
    }
  }, [audioMode, mixDemo, isPlaying])

  const togglePlay = () => {
    if (!audioRef.current || !mixDemo) return
    const url = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
    if (!url) return
    if (playingMixId) { mixAudioRef.current?.pause(); setPlayingMixId(null) }
    if (!audioRef.current.src) audioRef.current.src = url
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play().catch(console.error); setIsPlaying(true) }
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    audioRef.current.currentTime = (pct / 100) * duration
    setProgress(pct)
    setCurrentTime((pct / 100) * duration)
  }

  const formatTime = (s) => !s || isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  const playRecentMix = (mix) => {
    if (!mix.audio_url) return
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false) }
    if (playingMixId === mix.id) { mixAudioRef.current?.pause(); setPlayingMixId(null) }
    else if (mixAudioRef.current) { mixAudioRef.current.src = mix.audio_url; mixAudioRef.current.play().catch(console.error); setPlayingMixId(mix.id) }
  }

  const calculateTotal = () => MIX_MASTER_PRICE + (formData.rushDelivery ? RUSH_FEE : 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const { error } = await supabase.from('mix_requests').insert([{
        name: formData.name, email: formData.email, track_name: formData.trackName, genre: formData.genre,
        reference_url: formData.reference || null, notes: formData.notes || null, rush_delivery: formData.rushDelivery,
        total_price: calculateTotal(), status: 'pending'
      }])
      if (error) throw error
      setSubmitted(true)
      setFormData({ name: '', email: '', trackName: '', genre: '', reference: '', notes: '', rushDelivery: false })
      setTimeout(() => setSubmitted(false), 10000)
    } catch (err) { setSubmitError(err.message || 'Failed to submit. Please try again.') }
    finally { setIsSubmitting(false) }
  }

  const hasDemoAudio = mixDemo && (mixDemo.raw_audio_url || mixDemo.mixed_audio_url)
  const currentAudioAvailable = mixDemo && (audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url)

  // Animation variants
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }
  const slideInLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } }
  const slideInRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } }

  // Memoized waveform bars
  const waveformBars = useMemo(() => (
    [...Array(50)].map((_, i) => ({
      height: Math.sin(i * 0.25) * 35 + 45,
      delay: i * 0.02
    }))
  ), [])

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      <audio ref={audioRef} preload="metadata" />
      <audio ref={mixAudioRef} preload="metadata" />

      <Background />

      <Header />

      {/* Hero Section - with parallax and animations */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 md:pb-20 px-4 md:px-6">
        {/* Floating Elements - Desktop only */}
        {!isMobile && mounted && (
          <>
            <Parallax speed={-0.2} className="absolute top-1/4 left-[5%] pointer-events-none">
              <motion.div
                className="text-6xl opacity-20"
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                🎚️
              </motion.div>
            </Parallax>
            <Parallax speed={0.1} className="absolute top-1/3 right-[8%] pointer-events-none">
              <motion.div
                className="text-5xl opacity-20"
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                🎧
              </motion.div>
            </Parallax>
            <Parallax speed={-0.15} className="absolute bottom-1/3 left-[12%] pointer-events-none">
              <motion.div
                className="text-4xl opacity-15"
                animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                🔊
              </motion.div>
            </Parallax>
            <Parallax speed={0.2} className="absolute bottom-1/4 right-[15%] pointer-events-none">
              <motion.div
                className="text-5xl opacity-15"
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              >
                🎹
              </motion.div>
            </Parallax>
          </>
        )}

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
              variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            >
              <motion.p
                variants={fadeUp}
                className="text-[#8B5CF6] font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs"
              >
                Online Mixing Service
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6"
              >
                Make Your Track{' '}
                <span className="relative inline-block">
                  <span className="text-[#8B5CF6]">Sound Pro</span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-purple-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 leading-relaxed"
              >
                Professional mixing and mastering for artists who want radio-ready sound. Send your files, get back a polished track.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-10">
                <motion.a
                  href="#submit"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all text-center relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Get Started - €{MIX_MASTER_PRICE}</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
                <motion.a
                  href="#process"
                  className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  See How It Works
                </motion.a>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 md:gap-6">
                {trustBadges.map((b, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 group cursor-default"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg md:text-xl group-hover:scale-110 transition-transform">{b.icon}</span>
                    <div>
                      <p className="text-xs md:text-sm font-medium">{b.title}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">{b.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Before/After Player */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60, rotateY: -10 }}
              animate={mounted ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="relative bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 backdrop-blur-sm"
                whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect behind player */}
                <div className="absolute -inset-4 bg-[#8B5CF6]/10 rounded-3xl blur-2xl opacity-50 -z-10" />

                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Before & After</p>
                    <p className="font-semibold text-sm md:text-base">Hear The Difference</p>
                  </div>
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {[0, 100, 200].map(d => (
                          <motion.div
                            key={d}
                            className="w-1 bg-[#8B5CF6] rounded-full"
                            animate={{ height: ['16px', '24px', '16px'] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: d / 1000 }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-white/5 rounded-full p-1 mb-4 md:mb-6 relative">
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-purple-600"
                    initial={false}
                    animate={{
                      left: audioMode === 'raw' ? '4px' : '50%',
                      right: audioMode === 'raw' ? '50%' : '4px'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  {['raw', 'mixed'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setAudioMode(mode)}
                      className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition relative z-10 ${
                        audioMode === mode ? 'text-white' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {mode === 'raw' ? '🔇 Raw' : '🔊 Mixed'}
                    </button>
                  ))}
                </div>

                {/* Waveform Visualization */}
                <div className={`relative h-20 md:h-24 flex items-center justify-center gap-[2px] mb-4 md:mb-6 transition-all ${audioMode === 'raw' ? 'opacity-50 grayscale' : ''}`}>
                  {waveformBars.map((bar, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full transition-colors duration-300 ${
                        (i / waveformBars.length) * 100 <= progress
                          ? (audioMode === 'mixed' ? 'bg-gradient-to-t from-[#8B5CF6] to-purple-400' : 'bg-gray-500')
                          : 'bg-white/20'
                      }`}
                      initial={{ height: 0 }}
                      animate={{
                        height: isPlaying
                          ? `${bar.height + Math.sin(Date.now() / 200 + i * 0.5) * 10}%`
                          : `${bar.height}%`
                      }}
                      transition={{ duration: 0.3, delay: bar.delay }}
                    />
                  ))}
                </div>

                {/* Mode Badge */}
                <div className="flex justify-center mb-3 md:mb-4">
                  <motion.span
                    className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium ${
                      audioMode === 'mixed'
                        ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                        : 'bg-white/10 text-gray-400'
                    }`}
                    layout
                  >
                    {audioMode === 'mixed' ? '✨ Professional Mix' : '📼 Unprocessed Audio'}
                  </motion.span>
                </div>

                {/* Play Controls */}
                <div className="flex items-center gap-3 md:gap-4">
                  <motion.button
                    onClick={togglePlay}
                    disabled={!currentAudioAvailable}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${
                      !currentAudioAvailable
                        ? 'bg-white/5 cursor-not-allowed opacity-50'
                        : audioMode === 'mixed'
                          ? 'bg-gradient-to-br from-[#8B5CF6] to-purple-600 shadow-lg shadow-purple-500/25'
                          : 'bg-white/10 hover:bg-white/20'
                    }`}
                    whileHover={currentAudioAvailable ? { scale: 1.1 } : {}}
                    whileTap={currentAudioAvailable ? { scale: 0.95 } : {}}
                  >
                    {isPlaying ? (
                      <span className="text-lg md:text-xl">❚❚</span>
                    ) : (
                      <span className="text-lg md:text-xl ml-1">▶</span>
                    )}
                  </motion.button>
                  <div className="flex-1">
                    <div
                      className="h-2 md:h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                      onClick={handleProgressClick}
                    >
                      <motion.div
                        className={`h-full rounded-full ${audioMode === 'mixed' ? 'bg-gradient-to-r from-[#8B5CF6] to-purple-400' : 'bg-white/40'}`}
                        style={{ width: `${progress}%` }}
                        layoutId="progress"
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 md:mt-2 text-[10px] md:text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {!hasDemoAudio && (
                  <motion.p
                    className="text-center text-gray-600 text-xs mt-4 md:mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Demo audio coming soon
                  </motion.p>
                )}
              </motion.div>

              {/* Price Badge */}
              <motion.div
                className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-gradient-to-r from-[#8B5CF6] to-purple-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm md:text-base font-bold shadow-lg shadow-purple-500/30"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                €{MIX_MASTER_PRICE}/track
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 bg-[#8B5CF6] rounded-full mt-2"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Stats */}
      <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center group"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  className="text-3xl md:text-4xl block mb-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {s.icon}
                </motion.span>
                <motion.p
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#8B5CF6] to-purple-400 bg-clip-text text-transparent mb-1 md:mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                  {s.value}
                </motion.p>
                <p className="text-gray-500 text-xs md:text-sm">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Work With Me */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">The Difference</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 md:mb-4">Why Work With Me</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Not just another mixing service. Here's what sets me apart.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {whyMe.map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 hover:border-[#8B5CF6]/30 transition-all duration-500 group relative overflow-hidden"
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Hover glow */}
                <div className="absolute -inset-px bg-gradient-to-r from-[#8B5CF6]/20 to-purple-500/20 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />

                <div className="flex items-start gap-4 md:gap-5">
                  <motion.div
                    className="w-14 h-14 md:w-16 md:h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 group-hover:bg-[#8B5CF6]/20 transition"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 mb-3 leading-relaxed text-sm md:text-base">{item.desc}</p>
                    <p className="text-[#8B5CF6] text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
                      {item.highlight}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Genres - Interactive Cards */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">Specialties</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 md:mb-4">Genres I Mix</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Every genre has its own sound. I know what makes each one hit.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {genres.map((g, i) => (
              <motion.div
                key={g.name}
                className={`relative bg-white/[0.02] border rounded-2xl p-5 md:p-7 cursor-pointer transition-all duration-300 overflow-hidden group ${
                  activeGenre === g.name
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5'
                    : 'border-white/5 hover:border-white/20'
                }`}
                variants={scaleIn}
                onClick={() => setActiveGenre(activeGenre === g.name ? null : g.name)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background glow on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${g.color}15 0%, transparent 70%)`
                  }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <motion.span
                    className="text-4xl md:text-5xl"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {g.icon}
                  </motion.span>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1">{g.name}</h3>
                    <AnimatePresence mode="wait">
                      {(activeGenre === g.name || !isMobile) && (
                        <motion.p
                          className="text-gray-500 text-xs md:text-sm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {g.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Active indicator */}
                {activeGenre === g.name && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#8B5CF6]"
                    layoutId="genreIndicator"
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process - Animated Timeline */}
      <section id="process" className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">The Process</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 md:mb-4">From Raw to Radio-Ready</h2>
            <p className="text-gray-500 text-sm md:text-base">Simple 5-step process. You send files, I deliver hits.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            {!isMobile && (
              <motion.div
                className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            )}

            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            >
              {process.map((p, i) => (
                <motion.div
                  key={p.step}
                  className="relative text-center group"
                  variants={fadeUp}
                  onHoverStart={() => setHoveredProcess(i)}
                  onHoverEnd={() => setHoveredProcess(null)}
                >
                  {/* Step Circle */}
                  <motion.div
                    className={`relative z-10 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      hoveredProcess === i
                        ? 'bg-[#8B5CF6] shadow-lg shadow-purple-500/30'
                        : 'bg-[#0a0a0a] border-2 border-[#8B5CF6]/50'
                    }`}
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-2xl md:text-3xl">{p.icon}</span>

                    {/* Pulse ring on hover */}
                    <AnimatePresence>
                      {hoveredProcess === i && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[#8B5CF6]"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.span
                    className="text-[#8B5CF6] text-xs font-bold tracking-wider"
                    animate={{ opacity: hoveredProcess === i ? 1 : 0.7 }}
                  >
                    {p.time}
                  </motion.span>
                  <h3 className="font-bold mt-2 mb-1 text-base md:text-lg">{p.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Mixes - Only show if there's data */}
      {recentMixes.length > 0 && (
        <section className="relative py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10 md:mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">Portfolio</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Recent Mixes</h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {recentMixes.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="group cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ y: -10 }}
                >
                  <div className={`aspect-square bg-gradient-to-br ${m.color || 'from-purple-500/20'} to-[#050505] rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:border-[#8B5CF6]/30 transition relative overflow-hidden`}>
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-5xl opacity-30">🎵</span>
                    )}

                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      {m.audio_url && (
                        <motion.div
                          className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            playingMixId === m.id ? 'bg-white' : 'bg-[#8B5CF6]'
                          }`}
                          onClick={() => playRecentMix(m)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {playingMixId === m.id ? (
                            <span className="text-[#8B5CF6] text-lg">❚❚</span>
                          ) : (
                            <span className="text-white text-lg ml-1">▶</span>
                          )}
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Playing indicator */}
                    <AnimatePresence>
                      {playingMixId === m.id && (
                        <motion.div
                          className="absolute bottom-3 left-3 right-3 bg-black/80 rounded-xl px-3 py-2 flex items-center gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <div className="flex items-center gap-1">
                            {[0, 100, 200].map(d => (
                              <motion.div
                                key={d}
                                className="w-1 bg-[#8B5CF6] rounded-full"
                                animate={{ height: ['8px', '16px', '8px'] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: d / 1000 }}
                              />
                            ))}
                          </div>
                          <span className="text-xs">Playing</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{m.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm">{m.artist} - {m.genre}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="relative bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-8 md:p-12 overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

            <motion.div
              className="text-center mb-8"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.span
                className="text-6xl md:text-7xl block mb-4"
                variants={scaleIn}
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              >
                🎚️
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-3"
                variants={fadeUp}
              >
                Mix & Master
              </motion.h2>
              <motion.div
                className="flex items-center justify-center gap-2"
                variants={fadeUp}
              >
                <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#8B5CF6] to-purple-400 bg-clip-text text-transparent">€{MIX_MASTER_PRICE}</span>
                <span className="text-gray-400 text-base md:text-lg">per track</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              variants={fadeUp}
            >
              <motion.div
                className="bg-white/5 rounded-2xl p-4 md:p-5 text-center"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <p className="font-semibold mb-1 md:text-lg">Standard</p>
                <p className="text-gray-500 text-sm">2-3 business days</p>
                <p className="text-[#8B5CF6] font-bold mt-2">Included</p>
              </motion.div>
              <motion.div
                className="bg-[#8B5CF6]/10 rounded-2xl p-4 md:p-5 text-center border border-[#8B5CF6]/30"
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-semibold mb-1 md:text-lg flex items-center justify-center gap-2">
                  Rush <span className="text-lg">⚡</span>
                </p>
                <p className="text-gray-500 text-sm">24-48 hours</p>
                <p className="text-[#8B5CF6] font-bold mt-2">+€{RUSH_FEE}</p>
              </motion.div>
            </motion.div>

            <motion.ul className="space-y-3 mb-8" variants={fadeUp}>
              {['Full mixing & mastering', 'WAV + MP3 delivery', '1 revision included', 'Direct communication', 'Streaming-ready format'].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 text-sm md:text-base"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="w-5 h-5 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-[#8B5CF6] text-xs">✓</span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.a
              href="#submit"
              className="block w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-4 rounded-full font-bold text-center transition-all text-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Now
            </motion.a>
            <p className="text-center text-gray-500 text-xs mt-4">15% discount on 5+ tracks</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">Reviews</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Artists Love It</h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-[#8B5CF6]/20 transition-all duration-500 group"
                variants={fadeUp}
                whileHover={{ y: -5 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-[#8B5CF6] text-lg"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed text-sm md:text-base italic">"{t.text}"</p>

                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-purple-600 rounded-full flex items-center justify-center text-sm font-bold"
                    whileHover={{ scale: 1.1 }}
                  >
                    {t.avatar}
                  </motion.div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Submit Form */}
      <section id="submit" className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">Get Started</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 md:mb-4">Submit Your Track</h2>
            <p className="text-gray-500 text-sm md:text-base">Fill out the form and I'll get back to you within 24 hours.</p>
          </motion.div>

          <motion.div
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  className="text-center py-10 md:py-16"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.span
                    className="text-6xl md:text-7xl block mb-4"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    ✅
                  </motion.span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Request Submitted!</h3>
                  <p className="text-gray-500 mb-6 text-sm md:text-base">I'll review your project and get back to you within 24 hours.</p>
                  <div className="bg-white/5 rounded-2xl p-4 inline-block">
                    <p className="text-sm text-gray-400">Send your audio files to:</p>
                    <p className="text-[#8B5CF6] font-bold text-lg">mix@trproductions.de</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-5 md:space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {submitError && (
                    <motion.div
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {submitError}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: 'Name', k: 'name', t: 'text', p: 'Your name' },
                      { l: 'Email', k: 'email', t: 'email', p: 'your@email.com' }
                    ].map(f => (
                      <div key={f.k}>
                        <label className="block text-sm text-gray-400 mb-2">{f.l} *</label>
                        <input
                          type={f.t}
                          required
                          value={formData[f.k]}
                          onChange={(e) => setFormData({ ...formData, [f.k]: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                          placeholder={f.p}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Track Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.trackName}
                        onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        placeholder="Song title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Genre *</label>
                      <select
                        required
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      >
                        <option value="">Select genre</option>
                        {['Hip-Hop', 'Trap', 'Drill', 'R&B', 'Pop', 'Afrobeat', 'Other'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Reference Track (optional)</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Link to a song with a similar vibe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
                      placeholder="Any specific requests..."
                    />
                  </div>

                  <motion.div
                    onClick={() => setFormData({ ...formData, rushDelivery: !formData.rushDelivery })}
                    className={`p-4 md:p-5 rounded-2xl border cursor-pointer transition-all ${
                      formData.rushDelivery
                        ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <p className="font-semibold">Rush Delivery</p>
                          <p className="text-gray-500 text-sm">Get your mix in 24-48 hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8B5CF6] font-bold">+€{RUSH_FEE}</span>
                        <motion.div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                            formData.rushDelivery ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/30'
                          }`}
                          animate={formData.rushDelivery ? { scale: [1, 1.2, 1] } : {}}
                        >
                          {formData.rushDelivery && <span className="text-xs">✓</span>}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-gray-400">Total</span>
                    <motion.span
                      className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-purple-400 bg-clip-text text-transparent"
                      key={calculateTotal()}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      €{calculateTotal()}
                    </motion.span>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-lg ${
                      isSubmitting
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                        : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                    }`}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
                  </motion.button>

                  <p className="text-center text-gray-600 text-xs">
                    After submitting, send your files to mix@trproductions.de or via WeTransfer
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.3em] uppercase text-xs">FAQ</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Questions?</h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
                variants={fadeUp}
              >
                <motion.button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-5 md:px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="font-medium pr-4 text-sm md:text-base">{faq.q}</span>
                  <motion.span
                    className="text-[#8B5CF6] text-xl flex-shrink-0"
                    animate={{ rotate: activeFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    +
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 md:px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-10 md:p-16 text-center overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-3xl -z-10" />

            <motion.h2
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              variants={fadeUp}
            >
              Ready to Sound Pro?
            </motion.h2>
            <motion.p
              className="text-gray-400 mb-8 max-w-xl mx-auto text-base md:text-lg"
              variants={fadeUp}
            >
              Submit your track today. Professional mix and master for just €{MIX_MASTER_PRICE}.
            </motion.p>
            <motion.a
              href="#submit"
              className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 md:px-10 py-4 md:py-5 rounded-full font-bold transition-all text-lg"
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Now
            </motion.a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
