'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const [isMobile, setIsMobile] = useState(true)
  const [featuredBeat, setFeaturedBeat] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
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
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8B5CF6] opacity-[0.07] rounded-full"
          style={{ filter: isMobile ? 'blur(100px)' : 'blur(180px)' }}
        />
        
        {!isMobile && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#soundWaves)" />
          </svg>
        )}
      </div>

      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <Header />
      
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen px-6 pt-20">
        <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center">
          
          {/* Hero Text */}
          <div className="relative z-10 text-center lg:text-left lg:max-w-lg">
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
              <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition flex items-center justify-center gap-2">
                Browse Beats <span>→</span>
              </a>
              <a href="/studio" className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold transition">
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
          </div>

          {/* Beat Player */}
          <div className="relative z-10">
            <div 
              className="absolute -inset-4 bg-[#8B5CF6] opacity-[0.08] rounded-3xl pointer-events-none"
              style={{ filter: isMobile ? 'blur(30px)' : 'blur(60px)' }}
            />
            
            <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-[280px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading...</p>
                </div>
              ) : featuredBeat ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Now Playing</span>
                    <span className="text-xs text-[#8B5CF6]">Featured</span>
                  </div>

                  <div 
                    className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center mb-4 relative overflow-hidden cursor-pointer"
                    onClick={togglePlay}
                  >
                    {featuredBeat.image_url && (
                      <img src={featuredBeat.image_url} alt={featuredBeat.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 ${isPlaying ? 'bg-white text-black' : 'border-2 border-white/20 bg-black/30'}`}>
                      {isPlaying ? <span className="text-lg">❚❚</span> : <span className="text-lg ml-1">▶</span>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-semibold text-sm mb-1">{featuredBeat.title}</h3>
                    <p className="text-gray-500 text-xs">{featuredBeat.genre} • {featuredBeat.bpm} BPM</p>
                  </div>

                  <div className="mb-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" style={{ width: `${progress}%` }} />
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
                    <a href="/beats" className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-medium">Buy Now</a>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-4">🎵</span>
                  <p className="text-gray-500 text-sm">No beats available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}