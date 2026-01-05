'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MixingPage() {
  const [mounted, setMounted] = useState(false)
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

  // Scroll animation
  const [visibleSections, setVisibleSections] = useState({})
  
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
    { question: 'What files do I need to send?', answer: 'At minimum: your raw vocal recording (WAV preferred) and the beat/instrumental. If you have stems (separate tracks for drums, melody, bass), even better!' },
    { question: 'How long does it take?', answer: 'Standard delivery is 2-3 business days. Need it faster? Rush delivery (24-48 hours) is available for an additional €30.' },
    { question: 'What if I need changes?', answer: 'One revision is included in the price. After hearing the first mix, you can request specific adjustments. Additional revisions are €15 each.' },
    { question: 'Can you mix tracks recorded elsewhere?', answer: 'Absolutely! Most of my clients record at home or other studios. As long as the recordings are decent quality, I can work with them.' },
    { question: 'Do you offer bulk discounts?', answer: 'Yes! For EP/album projects (5+ tracks), I offer 15% off. Get in touch to discuss your project.' },
    { question: 'What do I get when it is done?', answer: 'You receive the final mix in WAV (high quality) and MP3 (streaming ready) formats. Ready to upload to Spotify, Apple Music, etc.' }
  ]

  const trustBadges = [
    { icon: '⚡', title: 'Fast Delivery', subtitle: '2-3 days' },
    { icon: '🔄', title: 'Free Revision', subtitle: '1 included' },
    { icon: '💬', title: 'Direct Contact', subtitle: 'No middleman' },
    { icon: '✅', title: 'Satisfaction', subtitle: 'Guaranteed' }
  ]

  useEffect(() => {
    setMounted(true)
    fetchMixDemo()
    fetchRecentMixes()
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const sections = document.querySelectorAll('[data-animate]')
    sections.forEach(section => observer.observe(section))

    return () => observer.disconnect()
  }, [mounted])

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

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0) }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const audio = mixAudioRef.current
    if (!audio) return
    const handleEnded = () => setPlayingMixId(null)
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [])

  useEffect(() => {
    if (audioRef.current && mixDemo) {
      const newSrc = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
      if (newSrc && audioRef.current.src !== newSrc) {
        const wasPlaying = isPlaying
        const currentPos = audioRef.current.currentTime
        audioRef.current.src = newSrc
        audioRef.current.currentTime = Math.min(currentPos, audioRef.current.duration || currentPos)
        if (wasPlaying) audioRef.current.play().catch(() => {})
      }
    }
  }, [audioMode, mixDemo])

  const togglePlay = () => {
    if (!audioRef.current || !mixDemo) return
    const audioUrl = audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url
    if (!audioUrl) return

    if (playingMixId) { mixAudioRef.current?.pause(); setPlayingMixId(null) }
    if (!audioRef.current.src) audioRef.current.src = audioUrl

    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play().catch(console.error); setIsPlaying(true) }
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

  const playRecentMix = (mix) => {
    if (!mix.audio_url) return
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false) }

    if (playingMixId === mix.id) { mixAudioRef.current?.pause(); setPlayingMixId(null) }
    else {
      if (mixAudioRef.current) {
        mixAudioRef.current.src = mix.audio_url
        mixAudioRef.current.play().catch(console.error)
        setPlayingMixId(mix.id)
      }
    }
  }

  const calculateTotal = () => MIX_MASTER_PRICE + (formData.rushDelivery ? RUSH_FEE : 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { error } = await supabase
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

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: '', email: '', trackName: '', genre: '', reference: '', notes: '', rushDelivery: false })
      setTimeout(() => setSubmitted(false), 10000)
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasDemoAudio = mixDemo && (mixDemo.raw_audio_url || mixDemo.mixed_audio_url)
  const currentAudioAvailable = mixDemo && (audioMode === 'raw' ? mixDemo.raw_audio_url : mixDemo.mixed_audio_url)

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      
      <audio ref={audioRef} preload="metadata" />
      <audio ref={mixAudioRef} preload="metadata" />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[400px] md:h-[600px] bg-[#8B5CF6] opacity-[0.08] rounded-full"
          style={{ filter: 'blur(120px)' }}
        />
        
        <div 
          className="hidden md:block absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.05] rounded-full"
          style={{ filter: 'blur(150px)' }}
        />
        
        <div 
          className="hidden md:block absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#6D28D9] opacity-[0.04] rounded-full"
          style={{ filter: 'blur(120px)' }}
        />
        
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        
        <svg className="hidden md:block absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundWavesMix" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundWavesMix)" />
        </svg>

        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[#8B5CF6] font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Online Mixing Service</p>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6">
                Make Your Track <span className="text-[#8B5CF6]">Sound Pro</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 leading-relaxed">
                Professional mixing and mastering for artists who want radio-ready sound. 
                Send your files, get back a polished track.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                <a href="#submit" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105 text-center">
                  Get Started - €{MIX_MASTER_PRICE}
                </a>
                <a href="#process" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition text-center">
                  See How It Works
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 md:gap-6">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-lg md:text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-xs md:text-sm font-medium">{badge.title}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">{badge.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Before/After Player */}
            <div className={`relative transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Before & After</p>
                    <p className="font-semibold text-sm md:text-base">Hear The Difference</p>
                  </div>
                  {isPlaying && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-4 bg-[#8B5CF6] rounded-full animate-equalizer" />
                      <div className="w-1 h-4 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-100" />
                      <div className="w-1 h-4 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-200" />
                    </div>
                  )}
                </div>

                {/* Toggle Switch */}
                <div className="flex bg-white/5 rounded-full p-1 mb-4 md:mb-6">
                  <button
                    onClick={() => setAudioMode('raw')}
                    className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition ${
                      audioMode === 'raw' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    🔇 Raw
                  </button>
                  <button
                    onClick={() => setAudioMode('mixed')}
                    className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition ${
                      audioMode === 'mixed' ? 'bg-[#8B5CF6] text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    🔊 Mixed
                  </button>
                </div>

                {/* Static Waveform */}
                <div className={`relative h-16 md:h-20 flex items-center justify-center gap-[2px] mb-4 md:mb-6 transition-all ${
                  audioMode === 'raw' ? 'opacity-50' : 'opacity-100'
                }`}>
                  {[...Array(40)].map((_, i) => {
                    const height = Math.sin(i * 0.3) * 30 + 40
                    const isActive = (i / 40) * 100 <= progress
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isActive 
                            ? audioMode === 'mixed' ? 'bg-[#8B5CF6]' : 'bg-gray-500'
                            : 'bg-white/20'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-3 md:mb-4">
                  <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium ${
                    audioMode === 'mixed' 
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {audioMode === 'mixed' ? '✨ Professional Mix' : '📼 Unprocessed Audio'}
                  </span>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={togglePlay}
                    disabled={!currentAudioAvailable}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                      !currentAudioAvailable
                        ? 'bg-white/5 cursor-not-allowed opacity-50'
                        : audioMode === 'mixed' 
                          ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105' 
                          : 'bg-white/10 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    {isPlaying ? <span className="text-base md:text-lg">❚❚</span> : <span className="text-base md:text-lg ml-1">▶</span>}
                  </button>
                  <div className="flex-1">
                    <div 
                      className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                      onClick={handleProgressClick}
                    >
                      <div
                        className={`h-full rounded-full transition-all ${audioMode === 'mixed' ? 'bg-[#8B5CF6]' : 'bg-white/40'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 md:mt-2 text-[10px] md:text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {!hasDemoAudio && (
                  <p className="text-center text-gray-600 text-xs mt-4 md:mt-6">Demo audio coming soon</p>
                )}
              </div>

              {/* Price Badge */}
              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-[#8B5CF6] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg animate-bounce-slow">
                €{MIX_MASTER_PRICE}/track
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" data-animate className="relative py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 transition-all duration-1000 ${visibleSections['stats'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center" style={{ transitionDelay: `${index * 100}ms` }}>
                <p className="text-3xl md:text-5xl font-bold text-[#8B5CF6] mb-1 md:mb-2">{stat.value}</p>
                <p className="text-gray-500 text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Work With Me */}
      <section id="why" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-10 md:mb-16 transition-all duration-1000 ${visibleSections['why'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">The Difference</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">Why Work With Me</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Not just another mixing service. Here is what sets me apart.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {whyWorkWithMe.map((item, index) => (
              <div
                key={item.title}
                className={`bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl p-5 md:p-8 hover:border-[#8B5CF6]/30 transition-all duration-500 hover:-translate-y-1 group ${
                  visibleSections['why'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#8B5CF6]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0 group-hover:bg-[#8B5CF6]/20 transition">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{item.title}</h3>
                    <p className="text-gray-400 mb-2 md:mb-3 leading-relaxed text-sm">{item.description}</p>
                    <p className="text-[#8B5CF6] text-xs md:text-sm font-medium">{item.highlight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genre Specialties */}
      <section id="genres" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${visibleSections['genres'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Specialties</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">Genres I Mix</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Every genre has its own sound. I know what makes each one hit.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {genres.map((genre, index) => (
              <div
                key={genre.name}
                onClick={() => setActiveGenre(activeGenre === genre.name ? null : genre.name)}
                className={`relative bg-white/[0.02] border rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  activeGenre === genre.name 
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5' 
                    : 'border-white/5 hover:border-white/10'
                } ${visibleSections['genres'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-2xl md:text-4xl">{genre.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm md:text-lg">{genre.name}</h3>
                    <p className="text-gray-500 text-xs md:text-sm hidden sm:block">{genre.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="process" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-10 md:mb-16 transition-all duration-1000 ${visibleSections['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">The Process</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">From Raw to Radio-Ready</h2>
            <p className="text-gray-500 text-sm md:text-base">Simple 5-step process. You send files, I deliver hits.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {process.map((item, index) => (
                <div
                  key={item.step}
                  className={`relative text-center transition-all duration-500 ${visibleSections['process'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-[#0a0a0a] border-2 border-[#8B5CF6]/50 rounded-full flex items-center justify-center">
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                  </div>
                  
                  <span className="text-[#8B5CF6] text-[10px] md:text-xs font-bold">{item.time}</span>
                  <h3 className="font-semibold mt-1 md:mt-2 mb-1 text-sm md:text-base">{item.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section id="portfolio" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${visibleSections['portfolio'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Portfolio</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Recent Mixes</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(recentMixes.length > 0 ? recentMixes : [
              { id: 1, title: 'Midnight Run', artist: 'Jay Flex', genre: 'Trap', color: 'from-purple-500/20' },
              { id: 2, title: 'City Dreams', artist: 'Luna', genre: 'R&B', color: 'from-pink-500/20' },
              { id: 3, title: 'No Cap', artist: 'Dre Money', genre: 'Hip-Hop', color: 'from-blue-500/20' },
              { id: 4, title: 'Slide', artist: 'K-Drill', genre: 'Drill', color: 'from-red-500/20' }
            ]).map((project, index) => (
              <div
                key={project.id}
                className={`group cursor-pointer transition-all duration-500 hover:-translate-y-2 ${visibleSections['portfolio'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`aspect-square bg-gradient-to-br ${project.color || 'from-purple-500/20'} to-[#050505] rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 border border-white/5 group-hover:border-white/20 transition relative overflow-hidden`}>
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-4xl md:text-5xl opacity-30">🎵</span>
                  )}
                  
                  {project.audio_url && (
                    <div 
                      onClick={() => playRecentMix(project)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition ${
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

                  {playingMixId === project.id && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 bg-[#8B5CF6] rounded-full animate-equalizer" style={{ height: '12px' }} />
                        <div className="w-1 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-100" style={{ height: '12px' }} />
                        <div className="w-1 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-200" style={{ height: '12px' }} />
                      </div>
                      <span className="text-[10px] md:text-xs">Playing</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm md:text-base">{project.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{project.artist} - {project.genre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className={`bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-2xl md:rounded-3xl p-6 md:p-12 transition-all duration-1000 ${visibleSections['pricing'] ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
          >
            <div className="text-center mb-6 md:mb-8">
              <span className="text-4xl md:text-6xl block mb-3 md:mb-4">🎚️</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Mix & Master</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl md:text-5xl font-bold">€{MIX_MASTER_PRICE}</span>
                <span className="text-gray-400 text-sm md:text-base">per track</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white/5 rounded-xl p-3 md:p-4">
                <p className="font-medium mb-1 md:mb-2 text-sm md:text-base">Standard</p>
                <p className="text-gray-500 text-xs md:text-sm">2-3 business days</p>
                <p className="text-[#8B5CF6] font-semibold mt-1 md:mt-2 text-sm">Included</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-[#8B5CF6]/20">
                <p className="font-medium mb-1 md:mb-2 text-sm md:text-base">Rush ⚡</p>
                <p className="text-gray-500 text-xs md:text-sm">24-48 hours</p>
                <p className="text-[#8B5CF6] font-semibold mt-1 md:mt-2 text-sm">+€{RUSH_FEE}</p>
              </div>
            </div>

            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {['Full mixing & mastering', 'WAV + MP3 delivery', '1 revision included', 'Direct communication', 'Streaming-ready format'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                  <span className="text-[#8B5CF6]">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a href="#submit" className="block w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 md:py-4 rounded-full font-semibold text-center transition-all hover:scale-105 text-sm md:text-base">
              Get Started Now
            </a>

            <p className="text-center text-gray-500 text-[10px] md:text-xs mt-3 md:mt-4">
              15% discount on 5+ tracks
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${visibleSections['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Reviews</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Artists Love It</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#8B5CF6]/20 transition-all duration-500 ${visibleSections['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-3 md:mb-4 text-[#8B5CF6] text-sm">
                  {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-gray-300 mb-4 md:mb-6 text-xs md:text-sm leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-xs md:text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-xs md:text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-[10px] md:text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Form */}
      <section id="submit" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${visibleSections['submit'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Get Started</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">Submit Your Track</h2>
            <p className="text-gray-500 text-sm md:text-base">Fill out the form and I will get back to you within 24 hours.</p>
          </div>

          <div
            className={`bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 transition-all duration-1000 ${visibleSections['submit'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {submitted ? (
              <div className="text-center py-8 md:py-12">
                <span className="text-5xl md:text-6xl block mb-3 md:mb-4 animate-bounce-in">✅</span>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Request Submitted!</h3>
                <p className="text-gray-500 mb-4 text-sm md:text-base">I will review your project and get back to you within 24 hours.</p>
                <div className="bg-white/5 rounded-xl p-3 md:p-4 inline-block">
                  <p className="text-xs md:text-sm text-gray-400">Send your audio files to:</p>
                  <p className="text-[#8B5CF6] font-medium text-sm md:text-base">mix@trproductions.de</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 text-red-400 text-xs md:text-sm">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Track Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.trackName}
                      onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Song title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Genre *</label>
                    <select
                      required
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
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
                  <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Reference Track (optional)</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                    placeholder="Link to a song with a similar vibe"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
                    placeholder="Any specific requests or vision for the track..."
                  />
                </div>

                {/* Rush Delivery Toggle */}
                <div
                  onClick={() => setFormData({ ...formData, rushDelivery: !formData.rushDelivery })}
                  className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.rushDelivery
                      ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-lg md:text-xl">⚡</span>
                      <div>
                        <p className="font-medium text-sm md:text-base">Rush Delivery</p>
                        <p className="text-gray-500 text-xs md:text-sm">Get your mix in 24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-[#8B5CF6] font-semibold text-sm md:text-base">+€{RUSH_FEE}</span>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition ${
                        formData.rushDelivery ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/30'
                      }`}>
                        {formData.rushDelivery && <span className="text-[10px] md:text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-white/5 rounded-xl p-3 md:p-4 flex items-center justify-between">
                  <span className="text-gray-400 text-sm md:text-base">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-[#8B5CF6]">€{calculateTotal()}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 md:py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    isSubmitting
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>

                <p className="text-center text-gray-600 text-[10px] md:text-xs">
                  After submitting, send your files to mix@trproductions.de or via WeTransfer
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 ${visibleSections['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Questions?</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 ${visibleSections['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <span className="font-medium pr-4 text-sm md:text-base">{faq.question}</span>
                  <span className={`text-[#8B5CF6] transition-transform text-lg md:text-xl ${activeFaq === index ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="px-4 md:px-6 pb-4 md:pb-5 text-gray-400 text-xs md:text-sm leading-relaxed">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">Ready to Sound Pro?</h2>
            <p className="text-gray-400 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">
              Submit your track today. Professional mix and master for just €{MIX_MASTER_PRICE}.
            </p>
            <a href="#submit" className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105 text-sm md:text-base">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes equalizer {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .animate-equalizer {
          animation: equalizer 0.5s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </main>
  )
}