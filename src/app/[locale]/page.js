'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT, useLocale } from '@/i18n/I18nProvider'
import {
  SplitText,
  GlitchText,
  RevealWords,
  FadeUp,
  StaggerChildren,
  Parallax,
  CountUp,
  MagneticButton,
  MagneticLink,
  BeatTiltCard,
  ServiceTiltCard,
} from '@/app/components/animations'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const t = useT()
  const locale = useLocale()
  const [isMobile, setIsMobile] = useState(true)
  const [featuredBeat, setFeaturedBeat] = useState(null)
  const [latestBeats, setLatestBeats] = useState([])
  const [featuredReleases, setFeaturedReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [siteImages, setSiteImages] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [aboutStats, setAboutStats] = useState(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  // Hero animation refs
  const heroRef = useRef(null)
  const heroTextRef = useRef(null)
  const heroPlayerRef = useRef(null)
  const heroImageRef = useRef(null)

  // Get image by location - memoized to avoid re-calculating on every render
  const getImage = useCallback((loc) => {
    const img = siteImages.find(img => img.location === loc)
    return img ? { url: img.image_url, focalX: img.focal_x ?? 50, focalY: img.focal_y ?? 50 } : null
  }, [siteImages])

  // Pre-compute hero image for render optimization
  const heroImage = getImage('homepage-hero')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    setMounted(true)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Hero parallax animation
  useEffect(() => {
    if (!mounted || isMobile) return

    const ctx = gsap.context(() => {
      // Hero text parallax on scroll
      gsap.to(heroTextRef.current, {
        y: 150,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Player card parallax (moves slower)
      gsap.to(heroPlayerRef.current, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Hero image - scale down and fade as you scroll
      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          scale: 1.15,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [mounted, isMobile, siteImages])

  useEffect(() => {
    fetchBeats()
    fetchSiteImages()
    fetchTestimonials()
    fetchAboutStats()
  }, [])

  const fetchAboutStats = async () => {
    const { data } = await supabase.from('about_content').select('stats').single()
    if (data?.stats) setAboutStats(data.stats)
  }

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .or('page.eq.all,page.eq.home')
      .order('display_order', { ascending: true })
    setTestimonials(data || [])
  }

  const fetchSiteImages = async () => {
    const { data } = await supabase.from('site_images').select('*').eq('is_active', true)
    setSiteImages(data || [])
  }

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

    // Fetch featured releases
    const { data: releases } = await supabase
      .from('releases')
      .select('*')
      .eq('is_visible', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(6)

    setFeaturedReleases(releases || [])
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

  const services = [
    { icon: '🎵', title: t('home.services.beatStore.title'), desc: t('home.services.beatStore.desc'), link: `/${locale}/beats`, cta: t('home.services.beatStore.cta') },
    { icon: '🎚️', title: t('home.services.mixMaster.title'), desc: t('home.services.mixMaster.desc'), link: `/${locale}/mixing`, cta: t('home.services.mixMaster.cta') },
    { icon: '🎤', title: t('home.services.studio.title'), desc: t('home.services.studio.desc'), link: `/${locale}/studio`, cta: t('home.services.studio.cta') },
  ]

  // Helper to get initials from name
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">

      {featuredBeat?.audio_url && (
        <audio ref={audioRef} preload="metadata">
          <source src={featuredBeat.audio_url} type="audio/mpeg" />
        </audio>
      )}

      <Background />

      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex items-center justify-center min-h-[100svh] px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-0">

        {/* Hero Background Image - only shows if uploaded */}
        {heroImage && (
          <div
            ref={heroImageRef}
            className="absolute inset-0 z-0"
          >
            <Image
              src={heroImage.url}
              alt="Hero background"
              fill
              className="object-cover"
              style={{ objectPosition: `${heroImage.focalX}% ${heroImage.focalY}%` }}
              sizes="100vw"
              quality={75}
              priority
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />
            <div className="absolute inset-0 bg-[#050505]/40" />
          </div>
        )}

        {/* Floating particles - tablet and up */}
        <Parallax speed={-0.3} className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#8B5CF6] rounded-full opacity-40 animate-float"
              style={{
                left: `${5 + i * 8}%`,
                top: `${10 + (i % 5) * 18}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i % 3}s`,
              }}
            />
          ))}
        </Parallax>

        <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-16 items-center justify-center relative z-10">

          {/* Hero Text */}
          <div
            ref={heroTextRef}
            className="relative z-10 text-center lg:text-left lg:max-w-lg"
          >
            <p className="text-gray-500 font-medium mb-4 sm:mb-6 tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs animate-slide-up">
              {t('home.hero.label')}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
              <span className="inline-block animate-slide-up">TR</span>{' '}
              <span className="text-[#8B5CF6] inline-block animate-slide-up animation-delay-100">Productions</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto lg:mx-0 leading-relaxed animate-slide-up animation-delay-200">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-slide-up animation-delay-300">
              <a
                href={`/${locale}/beats`}
                className="group bg-[#8B5CF6] hover:bg-[#7C3AED] active:bg-[#6D28D9] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-[#8B5CF6]/25 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {t('home.hero.ctaBeats')}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href={`/${locale}/studio`}
                className="border border-white/20 hover:border-white/40 active:border-white/60 hover:bg-white/5 active:bg-white/10 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {t('home.hero.ctaStudio')}
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 mt-8 sm:mt-12 text-xs sm:text-sm text-gray-500 animate-slide-up animation-delay-400">
              {aboutStats ? (
                <>
                  {aboutStats.find(s => s.label === 'Beats Made') && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-white font-semibold">{aboutStats.find(s => s.label === 'Beats Made').value}+</span> {t('home.hero.statBeats')}
                    </div>
                  )}
                  {aboutStats.find(s => s.label === 'Artists Worked With') && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-white font-semibold">{aboutStats.find(s => s.label === 'Artists Worked With').value}+</span> {t('home.hero.statArtists')}
                    </div>
                  )}
                  {aboutStats.find(s => s.label === 'Years Experience') && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-white font-semibold">{aboutStats.find(s => s.label === 'Years Experience').value}+</span> {t('home.hero.statYears')}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-white font-semibold">500+</span> {t('home.hero.statBeats')}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-white font-semibold">200+</span> {t('home.hero.statArtists')}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-white font-semibold">5+</span> {t('home.hero.statYears')}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Beat Player */}
          <div
            ref={heroPlayerRef}
            className={`relative z-10 w-full max-w-[280px] sm:max-w-[300px] transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-3'}`}
          >
            <div
              className="absolute -inset-3 sm:-inset-4 bg-[#8B5CF6] opacity-[0.12] sm:opacity-[0.15] rounded-3xl pointer-events-none animate-glow-pulse"
              style={{ filter: isMobile ? 'blur(25px)' : 'blur(60px)' }}
            />

            <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 w-full backdrop-blur-sm hover:border-[#8B5CF6]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#8B5CF6]/10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-12">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-xs sm:text-sm">{t('common.loading')}</p>
                </div>
              ) : featuredBeat ? (
                <>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">{t('home.player.nowPlaying')}</span>
                      {isPlaying && (
                        <div className="flex items-center gap-0.5">
                          <div className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-[#8B5CF6] rounded-full animate-equalizer" />
                          <div className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-100" />
                          <div className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-[#8B5CF6] rounded-full animate-equalizer animation-delay-200" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#8B5CF6]">{t('home.player.featured')}</span>
                  </div>

                  <div
                    className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform"
                    onClick={togglePlay}
                    data-cursor-text={isPlaying ? t('home.player.pause') : t('home.player.play')}
                  >
                    {featuredBeat.image_url && (
                      <Image
                        src={featuredBeat.image_url}
                        alt={featuredBeat.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 280px, 300px"
                      />
                    )}

                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center gap-[2px] sm:gap-[3px] bg-black/50">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 sm:w-1 bg-[#8B5CF6] rounded-full opacity-70 animate-waveform"
                            style={{
                              height: `${16 + (i % 4) * 8}px`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      isPlaying
                        ? 'bg-white text-black scale-100'
                        : 'border-2 border-white/20 bg-black/30 group-hover:border-white/50 group-hover:scale-110 group-active:scale-95'
                    }`}>
                      {isPlaying ? <span className="text-base sm:text-lg">❚❚</span> : <span className="text-base sm:text-lg ml-0.5 sm:ml-1">▶</span>}
                    </div>
                  </div>

                  <div className="mb-2 sm:mb-3">
                    <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{featuredBeat.title}</h3>
                    <p className="text-gray-500 text-[10px] sm:text-xs">{featuredBeat.genre} • {featuredBeat.bpm} BPM</p>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <div className="h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-base sm:text-lg font-bold">{formatPrice(featuredBeat.price_mp3)}</span>
                      <span className="text-gray-500 text-[10px] sm:text-xs ml-1">{t('home.player.lease')}</span>
                    </div>
                    <MagneticButton
                      as="a"
                      href={`/${locale}/beats`}
                      className="bg-white text-black px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[44px] flex items-center justify-center"
                      strength={0.2}
                    >
                      {t('home.player.buyNow')}
                    </MagneticButton>
                  </div>

                </>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <span className="text-3xl sm:text-4xl block mb-3 sm:mb-4">🎵</span>
                  <p className="text-gray-500 text-xs sm:text-sm">{t('home.player.noBeats')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator - tablet and up */}
        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-gray-600 hidden md:flex animate-bounce-slow">
          <span className="text-xs uppercase tracking-widest">{t('home.hero.scroll')}</span>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-10 sm:mb-12 md:mb-20">
            <p className="text-gray-500 font-medium mb-3 sm:mb-4 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] sm:text-xs">{t('home.services.label')}</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
              <GlitchText>{t('home.services.title')}</GlitchText>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base px-4">{t('home.services.subtitle')}</p>
          </FadeUp>

          <StaggerChildren className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6" stagger={0.15}>
            {services.map((service) => (
              <ServiceTiltCard key={service.title}>
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:bg-[#8B5CF6]/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <span className="text-xl sm:text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-[#8B5CF6] transition-colors">{service.title}</h3>
                <p className="text-gray-500 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm">{service.desc}</p>
                <MagneticLink
                  href={service.link}
                  className="text-white hover:text-[#8B5CF6] active:text-[#A78BFA] transition-colors flex items-center gap-2 text-xs sm:text-sm"
                  strength={0.2}
                >
                  {service.cta}
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </MagneticLink>
              </ServiceTiltCard>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Latest Beats Section */}
      <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 md:mb-16">
            <div>
              <p className="text-gray-500 font-medium mb-3 sm:mb-4 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] sm:text-xs">{t('home.latest.label')}</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                <GlitchText>{t('home.latest.title')}</GlitchText>
              </h2>
            </div>
            <MagneticLink
              href={`/${locale}/beats`}
              className="text-gray-500 hover:text-white active:text-[#8B5CF6] transition mt-3 sm:mt-0 flex items-center gap-2 text-xs sm:text-sm"
            >
              {t('home.latest.viewAll')}
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </MagneticLink>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6" stagger={0.1}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-white/5 animate-pulse" />
                  <div className="p-3 sm:p-4">
                    <div className="h-3 sm:h-4 bg-white/5 rounded mb-2 w-3/4 animate-pulse" />
                    <div className="h-2 sm:h-3 bg-white/5 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))
            ) : latestBeats.length > 0 ? (
              latestBeats.map((beat) => (
                <BeatTiltCard key={beat.id}>
                  <a href={`/${locale}/beats`} className="block" data-cursor-text={t('home.latest.view')}>
                    <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                      {beat.image_url ? (
                        <Image
                          src={beat.image_url}
                          alt={beat.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl sm:text-4xl opacity-30">🎵</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-lg shadow-[#8B5CF6]/50">
                          <span className="text-white ml-0.5 sm:ml-1 text-sm sm:text-base md:text-lg">▶</span>
                        </div>
                      </div>
                      {beat.is_featured && (
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#8B5CF6] text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{t('home.player.featured')}</div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h4 className="font-semibold text-xs sm:text-sm truncate group-hover:text-[#8B5CF6] transition-colors">{beat.title}</h4>
                      <p className="text-gray-600 text-[10px] sm:text-xs mb-1.5 sm:mb-2">{beat.genre} • {beat.bpm} BPM</p>
                      <span className="font-semibold text-xs sm:text-sm">{formatPrice(beat.price_mp3)}</span>
                    </div>
                  </a>
                </BeatTiltCard>
              ))
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center py-10 sm:py-12">
                <span className="text-4xl sm:text-5xl block mb-3 sm:mb-4">🎵</span>
                <p className="text-gray-500 text-sm">{t('home.latest.empty')}</p>
              </div>
            )}
          </StaggerChildren>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-10 sm:mb-12 md:mb-20">
              <p className="text-gray-500 font-medium mb-3 sm:mb-4 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] sm:text-xs">{t('home.testimonials.label')}</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
                <GlitchText>{t('home.testimonials.title')}</GlitchText>
              </h2>
            </FadeUp>

            <StaggerChildren className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6" stagger={0.12}>
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 hover:border-[#8B5CF6]/20 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <span key={i} className="text-[#8B5CF6] text-sm sm:text-base">★</span>
                    ))}
                  </div>
                  <p className="text-gray-400 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#8B5CF6]/10 flex items-center justify-center text-xs sm:text-sm font-medium">{getInitials(testimonial.name)}</div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{testimonial.name}</p>
                      <p className="text-gray-600 text-[10px] sm:text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6">
        {/* CTA background glow */}
        <Parallax speed={0.2} className="absolute inset-0 pointer-events-none">
          <div
            className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] lg:w-[800px] h-[300px] lg:h-[400px] bg-[#8B5CF6] rounded-full opacity-[0.12]"
            style={{ filter: 'blur(120px)' }}
          />
          <div
            className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] h-[200px] sm:h-[250px] bg-[#8B5CF6] rounded-full opacity-[0.08]"
            style={{ filter: 'blur(60px)' }}
          />
        </Parallax>

        <FadeUp className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
            <GlitchText>{t('home.cta.title')}</GlitchText>
          </h2>
          <p className="text-gray-500 mb-8 sm:mb-10 text-sm sm:text-base md:text-lg max-w-xl mx-auto px-4">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <MagneticLink
              href={`/${locale}/beats`}
              className="group bg-[#8B5CF6] hover:bg-[#7C3AED] active:bg-[#6D28D9] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-[#8B5CF6]/30 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {t('home.cta.browseBeats')}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </MagneticLink>
            <MagneticLink
              href={`/${locale}/contact`}
              className="border border-white/20 hover:border-[#8B5CF6]/50 active:border-[#8B5CF6]/70 hover:bg-[#8B5CF6]/10 active:bg-[#8B5CF6]/20 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold transition-all text-sm sm:text-base"
            >
              {t('home.cta.contact')}
            </MagneticLink>
          </div>
        </FadeUp>
      </section>

      {/* Featured Releases Section */}
      {featuredReleases.length > 0 && (
        <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-10 md:mb-16">
              <p className="text-[#1DB954] font-medium mb-3 sm:mb-4 tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] sm:text-xs">{t('home.releases.label')}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{t('home.releases.title')}</h2>
              <p className="text-gray-500 text-sm md:text-base mt-3 max-w-lg mx-auto">{t('home.releases.subtitle')}</p>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-5" stagger={0.08}>
              {featuredReleases.map((release) => (
                <a
                  key={release.id}
                  href={release.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  {/* Cover */}
                  <div className="aspect-square relative rounded-xl overflow-hidden mb-3 bg-[#1DB954]/10 border border-white/5 group-hover:border-[#1DB954]/50 transition-all">
                    {release.cover_image ? (
                      <img
                        src={release.cover_image}
                        alt={release.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">🎵</div>
                    )}

                    {/* Spotify overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-sm truncate group-hover:text-[#1DB954] transition-colors">{release.title}</h3>
                  <p className="text-gray-500 text-xs truncate">{release.artist}</p>
                </a>
              ))}
            </StaggerChildren>

            <FadeUp className="text-center mt-10">
              <a
                href={`/${locale}/mixing`}
                className="inline-flex items-center gap-2 text-[#1DB954] hover:text-[#1ed760] transition text-sm font-medium"
              >
                {t('home.releases.viewAll')} →
              </a>
            </FadeUp>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
