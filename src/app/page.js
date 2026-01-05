'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const [featuredBeat, setFeaturedBeat] = useState(null)
  const [latestBeats, setLatestBeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchBeats()
  }, [])

  const fetchBeats = async () => {
    setLoading(true)
    
    const { data: featured } = await supabase
      .from('beats')
      .select('*')
      .eq('is_sold', false)
      .eq('is_featured', true)
      .limit(1)
      .single()

    if (featured) {
      setFeaturedBeat(featured)
    } else {
      const { data: recent } = await supabase
        .from('beats')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setFeaturedBeat(recent)
    }

    const { data: latest } = await supabase
      .from('beats')
      .select('*')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .limit(4)

    setLatestBeats(latest || [])
    setLoading(false)
  }

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

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [featuredBeat])

  const togglePlay = () => {
    if (!featuredBeat?.audio_url) return
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      audioRef.current?.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price || 29.99)
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    audioRef.current.currentTime = (percent / 100) * duration
    setProgress(percent)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">

      {featuredBeat?.audio_url && (
        <audio ref={audioRef} preload="metadata">
          <source src={featuredBeat.audio_url} type="audio/mpeg" />
        </audio>
      )}
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] md:w-[1000px] h-[400px] md:h-[600px] bg-[#8B5CF6] opacity-[0.07] rounded-full"
          style={{ filter: isMobile ? 'blur(100px)' : 'blur(180px)' }}
        />
        
        {!isMobile && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                <path d="M0 160 Q 100 120, 200 160 T 400 160 T 600 160 T 800 160 T 1000 160 T 1200 160 T 1400 160 T 1600 160 T 1800 160 T 2000 160 T 2200 160 T 2400 160" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#soundWaves)" />
          </svg>
        )}
      </div>

      <Header />
      
      {/* Hero Section - FRAMER MOTION HERE ONLY */}
      <section className="relative flex items-center justify-center min-h-screen px-6 pt-20 overflow-hidden">
        
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'url(/images/studio-mic.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'center right',
                backgroundRepeat: 'no-repeat',
                maskImage: 'linear-gradient(to right, transparent 0%, transparent 50%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 50%, black 100%)',
              }}
            />
          </div>
        )}

        <div 
          className="absolute inset-0 opacity-[0.02] md:opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full h-[40%] md:h-[60%] opacity-[0.04]" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path d="M0 300 Q 360 150, 720 300 T 1440 300 L 1440 600 L 0 600 Z" fill="url(#waveGradient)"/>
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          {!isMobile && (
            <svg className="absolute bottom-0 left-0 w-full h-[50%] opacity-[0.03]" viewBox="0 0 1440 500" preserveAspectRatio="none">
              <path d="M0 250 Q 480 100, 960 250 T 1920 250 L 1920 500 L 0 500 Z" fill="url(#waveGradient2)"/>
              <defs>
                <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#8B5CF6] opacity-[0.04] rounded-full pointer-events-none"
          style={{ filter: isMobile ? 'blur(80px)' : 'blur(150px)' }}
        />

        <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center">
          
          {/* Hero Text */}
          <motion.div 
            className="relative z-10 text-center lg:text-left lg:max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-500 font-medium mb-6 tracking-[0.3em] uppercase text-xs">
              Music Producer
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              TR <span className="text-[#8B5CF6]">Productions</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Industry ready sound crafted to stand out.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/beats" className="group bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition flex items-center justify-center gap-2">
                Browse Beats
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="/studio" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                Book Studio Session
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">500+</span> Beats
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">200+</span> Artists
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">5+</span> Years
              </div>
            </div>
          </motion.div>

          {/* Beat Player */}
          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div 
              className="absolute -inset-4 bg-[#8B5CF6] opacity-[0.08] rounded-3xl pointer-events-none"
              style={{ filter: isMobile ? 'blur(30px)' : 'blur(60px)' }}
            />
            
            <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-sm w-[280px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading...</p>
                </div>
              ) : featuredBeat ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Now Playing</span>
                      {isPlaying && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-pulse" />
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-[#8B5CF6]">Featured</span>
                  </div>

                  <div 
                    className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center mb-4 relative overflow-hidden cursor-pointer group"
                    onClick={togglePlay}
                  >
                    {featuredBeat.image_url && (
                      <img src={featuredBeat.image_url} alt={featuredBeat.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}

                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center gap-[3px] bg-black/50">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-[#8B5CF6] rounded-full opacity-60 animate-waveform"
                            style={{ height: `${Math.random() * 40 + 15}px`, animationDelay: `${i * 0.05}s` }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {!featuredBeat.audio_url && (
                      <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full z-10">No Audio</div>
                    )}

                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all z-10 ${isPlaying ? 'bg-white text-black' : 'border-2 border-white/20 bg-black/30 group-hover:border-white/40'}`}>
                      {isPlaying ? <span className="text-lg">❚❚</span> : <span className="text-lg ml-1">▶</span>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-semibold text-sm mb-1">{featuredBeat.title}</h3>
                    <p className="text-gray-500 text-xs">{featuredBeat.genre} • {featuredBeat.bpm} BPM</p>
                  </div>

                  <div className="mb-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={handleProgressClick}>
                      <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold">{formatPrice(featuredBeat.price_mp3)}</span>
                      <span className="text-gray-500 text-xs ml-1">Lease</span>
                    </div>
                    <a href="/beats" className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition">Buy Now</a>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-4">🎵</span>
                  <p className="text-gray-500 text-sm">No beats available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-600 hidden md:flex animate-fadeIn">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-600 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Services Section - CSS ONLY */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20 animate-fadeInUp">
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Services</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">What I Offer</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to bring your musical vision to life</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎵', title: 'Beat Store', desc: 'Browse exclusive beats crafted for your sound. Instant download with multiple license options.', link: '/beats', cta: 'Browse Beats' },
              { icon: '🎚️', title: 'Mix & Master', desc: 'Professional mixing and mastering to make your tracks radio-ready. Fast online delivery.', link: '/mixing', cta: 'Learn More' },
              { icon: '🎤', title: 'Studio Sessions', desc: 'Book time in my professional studio in Trier. Recording, production, and creative sessions.', link: '/studio', cta: 'Book Session' },
            ].map((service, i) => (
              <div 
                key={service.title}
                className="group bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed text-sm">{service.desc}</p>
                <a href={service.link} className="text-white hover:text-gray-300 transition flex items-center gap-2 text-sm">
                  {service.cta} <span>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Beats Section - CSS ONLY */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 animate-fadeInUp">
            <div>
              <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Latest Beats</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Fresh From The Lab</h2>
            </div>
            <a href="/beats" className="text-gray-500 hover:text-white transition mt-4 md:mt-0 flex items-center gap-2 text-sm">
              View All Beats <span>→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-white/5 animate-pulse" />
                  <div className="p-4 md:p-5">
                    <div className="h-4 bg-white/5 rounded mb-2 w-3/4 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded mb-3 w-1/2 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))
            ) : latestBeats.length > 0 ? (
              latestBeats.map((beat, index) => (
                <a
                  key={beat.id}
                  href="/beats"
                  className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 block animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative overflow-hidden">
                    {beat.image_url ? (
                      <img src={beat.image_url} alt={beat.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-4xl md:text-5xl opacity-30">🎵</span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-base md:text-lg ml-1">▶</span>
                      </div>
                    </div>
                    {beat.is_featured && (
                      <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#8B5CF6] text-white text-xs px-2 py-1 rounded-full">Featured</div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h4 className="font-semibold mb-1 text-sm md:text-base truncate">{beat.title}</h4>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">{beat.genre} • {beat.bpm} BPM</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm md:text-base">{formatPrice(beat.price_mp3)}</span>
                      <span className="text-xs text-gray-600 hidden sm:inline">MP3 Lease</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center py-12">
                <span className="text-5xl block mb-4">🎵</span>
                <p className="text-gray-500">No beats available yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - CSS ONLY */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20 animate-fadeInUp">
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Testimonials</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What Artists Say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { initials: 'MJ', name: 'Marcus J.', role: 'Hip-Hop Artist', text: 'The mix came out incredible. TR really understood the vibe I was going for and elevated the whole track.' },
              { initials: 'LM', name: 'Lisa M.', role: 'R&B Singer', text: 'Studio sessions with TR are always productive. Great energy, professional setup, and amazing results.' },
              { initials: 'DK', name: 'David K.', role: 'Rapper', text: 'Bought 3 beats so far and every one has been fire. The quality is unmatched for the price.' },
            ].map((testimonial, i) => (
              <div 
                key={testimonial.name}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4 md:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#8B5CF6]">★</span>
                  ))}
                </div>
                <p className="text-gray-400 mb-4 md:mb-6 leading-relaxed text-sm">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-sm font-medium">{testimonial.initials}</div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-gray-600 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - CSS ONLY */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center animate-fadeInUp">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Create?</h2>
          <p className="text-gray-500 mb-8 md:mb-10 text-base md:text-lg max-w-xl mx-auto">
            Let us work together to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">Browse Beats</a>
            <a href="/contact" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">Get in Touch</a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Global CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveform {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1.2); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-waveform {
          animation: waveform 0.5s ease-in-out infinite alternate;
        }
      `}</style>
    </main>
  )
}