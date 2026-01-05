'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../../lib/supabase'

export default function AboutPage() {
  const [activeTimeline, setActiveTimeline] = useState(null)
  const [flippedCards, setFlippedCards] = useState([])
  const [easterEggFound, setEasterEggFound] = useState(false)
  const [siteImages, setSiteImages] = useState([])
  const [konamiProgress, setKonamiProgress] = useState(0)
  const heroRef = useRef(null)
  
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  // Konami code easter egg
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
  
  // Fetch site images
  useEffect(() => {
    const fetchSiteImages = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('*')
        .eq('is_active', true)
      setSiteImages(data || [])
    }
    fetchSiteImages()
  }, [])

  // Konami code easter egg
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === konamiCode[konamiProgress]) {
        if (konamiProgress + 1 === konamiCode.length) {
          setEasterEggFound(true)
          setKonamiProgress(0)
        } else {
          setKonamiProgress(prev => prev + 1)
        }
      } else {
        setKonamiProgress(0)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiProgress])

  const getImage = (location) => {
    return siteImages.find(img => img.location === location)?.image_url
  }

  const toggleFlip = (index) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  // Count up animation hook
  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
            let start = 0
            const increment = end / (duration / 16)
            const timer = setInterval(() => {
              start += increment
              if (start >= end) {
                setCount(end)
                clearInterval(timer)
              } else {
                setCount(Math.floor(start))
              }
            }, 16)
          }
        },
        { threshold: 0.5 }
      )

      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    }, [end, duration, hasStarted])

    return [count, ref]
  }

  const [beatsCount, beatsRef] = useCountUp(500)
  const [artistsCount, artistsRef] = useCountUp(120)
  const [yearsCount, yearsRef] = useCountUp(5)
  const [projectsCount, projectsRef] = useCountUp(200)

  const timeline = [
    { 
      year: '2019', 
      title: 'The Beginning', 
      description: 'Started making beats in my bedroom with just a laptop and FL Studio. Pure passion, zero experience.',
      icon: '🌱',
      milestone: 'First beat ever made'
    },
    { 
      year: '2020', 
      title: 'First Placement', 
      description: 'Landed my first placement with a local artist. The feeling of hearing someone rap over my beat was unreal.',
      icon: '🎯',
      milestone: '1st official release'
    },
    { 
      year: '2021', 
      title: 'Building the Studio', 
      description: 'Invested in proper equipment and acoustic treatment. Turned my room into a real home studio.',
      icon: '🏠',
      milestone: 'Home studio complete'
    },
    { 
      year: '2022', 
      title: 'Going Online', 
      description: 'Started selling beats online and offering mixing services. The grind went international.',
      icon: '🌍',
      milestone: '100+ beats sold'
    },
    { 
      year: '2023', 
      title: 'Full-Time Producer', 
      description: 'Took the leap and went full-time. No backup plan, just faith in the craft.',
      icon: '🚀',
      milestone: 'Full-time music'
    },
    { 
      year: '2024', 
      title: 'TR Productions', 
      description: 'Launched the official brand. Studio sessions, beat store, mixing services - the full package.',
      icon: '👑',
      milestone: 'Brand launch'
    }
  ]

  const skills = [
    { name: 'Beat Production', level: 95, icon: '🎹' },
    { name: 'Mixing', level: 88, icon: '🎚️' },
    { name: 'Mastering', level: 85, icon: '💎' },
    { name: 'Sound Design', level: 80, icon: '🔊' },
    { name: 'Vocal Recording', level: 82, icon: '🎤' },
    { name: 'Music Theory', level: 70, icon: '📚' }
  ]

  const tools = [
    { name: 'FL Studio', icon: '🍊', years: 5, primary: true },
    { name: 'Pro Tools', icon: '🎛️', years: 2, primary: false },
    { name: 'iZotope', icon: '🔮', years: 3, primary: false },
    { name: 'Waves', icon: '🌊', years: 4, primary: false },
    { name: 'Serum', icon: '💉', years: 4, primary: true },
    { name: 'Kontakt', icon: '🎻', years: 3, primary: false }
  ]

  const genres = [
    { name: 'Trap', influence: 95, color: '#8B5CF6' },
    { name: 'Drill', influence: 90, color: '#EF4444' },
    { name: 'Hip-Hop', influence: 88, color: '#F59E0B' },
    { name: 'R&B', influence: 75, color: '#EC4899' },
    { name: 'Afrobeat', influence: 60, color: '#10B981' },
    { name: 'Pop', influence: 50, color: '#3B82F6' }
  ]

  const funFacts = [
    { front: 'Favorite DAW?', back: 'FL Studio forever 🍊', icon: '💻' },
    { front: 'Coffee or Tea?', back: 'Coffee. Black. Always. ☕', icon: '🍵' },
    { front: 'Night or Day?', back: 'Night owl - best beats after midnight 🦉', icon: '🌙' },
    { front: 'First instrument?', back: 'Piano at age 8 🎹', icon: '🎸' },
    { front: 'Dream collab?', back: 'Metro Boomin or Southside 🔥', icon: '🤝' },
    { front: 'Guilty pleasure?', back: 'Lo-fi beats while cooking 🍳', icon: '🎧' },
    { front: 'Studio snack?', back: 'Gummy bears. No debate. 🐻', icon: '🍕' },
    { front: 'Beats made at 3AM?', back: 'Too many to count... 😅', icon: '⏰' }
  ]

  const socialLinks = [
    { name: 'Instagram', icon: '📸', url: '#', color: 'from-purple-500 to-pink-500', handle: '@trproductions' },
    { name: 'YouTube', icon: '🎬', url: '#', color: 'from-red-500 to-red-600', handle: 'TR Productions' },
    { name: 'TikTok', icon: '🎵', url: '#', color: 'from-black to-gray-800', handle: '@trproductions' },
    { name: 'Twitter', icon: '🐦', url: '#', color: 'from-blue-400 to-blue-500', handle: '@tr_beats' },
    { name: 'Spotify', icon: '🎧', url: '#', color: 'from-green-500 to-green-600', handle: 'TR Productions' },
    { name: 'SoundCloud', icon: '☁️', url: '#', color: 'from-orange-500 to-orange-600', handle: 'trproductions' }
  ]

  const dayInLife = [
    { time: '09:00', activity: 'Wake up, coffee, check emails', icon: '☕', type: 'morning' },
    { time: '10:00', activity: 'Sound design & sample hunting', icon: '🔍', type: 'morning' },
    { time: '12:00', activity: 'Beat making session', icon: '🎹', type: 'work' },
    { time: '14:00', activity: 'Lunch break & social media', icon: '🍜', type: 'break' },
    { time: '15:00', activity: 'Client mixing projects', icon: '🎚️', type: 'work' },
    { time: '18:00', activity: 'Studio sessions (if booked)', icon: '🎤', type: 'work' },
    { time: '20:00', activity: 'Dinner & chill', icon: '🍕', type: 'break' },
    { time: '22:00', activity: 'Late night creative session', icon: '🌙', type: 'creative' },
    { time: '01:00', activity: 'Sleep (sometimes...)', icon: '😴', type: 'end' }
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      
      {/* Background Effects */}
<div className="fixed inset-0 pointer-events-none overflow-hidden">
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
  
  {/* Grid pattern - desktop only */}
  <div 
    className="absolute inset-0 opacity-[0.03] hidden md:block"
    style={{
      backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
    }}
  />
  
  {/* Sound waves SVG - desktop only */}
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] hidden md:block" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="soundWavesStudio" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
        <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
        <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
        <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="0.5" fill="none"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#soundWavesStudio)" />
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

<Header />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <Header />

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {easterEggFound && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEasterEggFound(false)}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <span className="text-9xl block mb-6">🎉</span>
              <h2 className="text-4xl font-bold mb-4">You Found It!</h2>
              <p className="text-gray-400 mb-2">Secret Konami Code Unlocked</p>
              <p className="text-[#8B5CF6]">You are a real one. 10% off your next beat!</p>
              <p className="text-gray-500 text-sm mt-4">Code: KONAMI10</p>
              <p className="text-gray-600 text-xs mt-8">Click anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-[#8B5CF6] font-medium mb-6 tracking-[0.3em] uppercase text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              The Story Behind The Sound
            </motion.p>
            
            {/* Glitch Text Effect */}
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="relative inline-block">
                <span className="relative z-10">TR</span>
                <motion.span
                  className="absolute inset-0 text-[#8B5CF6] z-0"
                  animate={{ x: [0, -2, 2, 0], opacity: [1, 0.8, 0.8, 1] }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                >
                  TR
                </motion.span>
              </span>
              {' '}
              <span className="text-[#8B5CF6]">Productions</span>
            </motion.h1>

            {/* Typewriter Effect */}
            <motion.div
              className="text-xl md:text-2xl text-gray-400 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <TypewriterText texts={[
                'Producer. Engineer. Artist.',
                'Making beats that hit different.',
                'From Trier to the world.',
                'Your vision, my sound.'
              ]} />
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <a href="#journey" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
                My Journey
              </a>
              <a href="#connect" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                Let&apos;s Connect
              </a>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 bg-[#8B5CF6] rounded-full mt-2"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-[10%] text-6xl opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🎹
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-[10%] text-6xl opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        >
          🎧
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-[15%] text-4xl opacity-10"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        >
          🎵
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              ref={beatsRef}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-5xl md:text-6xl font-bold text-[#8B5CF6] mb-2">{beatsCount}+</p>
              <p className="text-gray-500">Beats Made</p>
            </motion.div>
            <motion.div
              ref={artistsRef}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-5xl md:text-6xl font-bold text-[#8B5CF6] mb-2">{artistsCount}+</p>
              <p className="text-gray-500">Artists Worked With</p>
            </motion.div>
            <motion.div
              ref={yearsRef}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-5xl md:text-6xl font-bold text-[#8B5CF6] mb-2">{yearsCount}+</p>
              <p className="text-gray-500">Years Experience</p>
            </motion.div>
            <motion.div
              ref={projectsRef}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-5xl md:text-6xl font-bold text-[#8B5CF6] mb-2">{projectsCount}+</p>
              <p className="text-gray-500">Projects Completed</p>
            </motion.div>
          </div>
        </div>
      </section>

{/* About Photos */}
<section className="relative py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <div className="grid md:grid-cols-2 gap-8">
      {/* Profile Photo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden"
      >
        {getImage('about-profile') ? (
          <img src={getImage('about-profile')} alt="TR" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-8xl block mb-4">👨‍🎤</span>
            <p className="text-gray-500">Profile Photo</p>
          </div>
        )}
      </motion.div>

      {/* Studio Shot */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden"
      >
        {getImage('about-studio') ? (
          <img src={getImage('about-studio')} alt="In the studio" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-8xl block mb-4">🎧</span>
            <p className="text-gray-500">Working in Studio</p>
          </div>
        )}
      </motion.div>
    </div>
  </div>
</section>

      {/* Interactive Timeline */}
      <section id="journey" className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">The Journey</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">How It Started</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8B5CF6] via-[#8B5CF6]/50 to-transparent" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 bg-[#8B5CF6] rounded-full z-10 ring-4 ring-[#050505]" />

                {/* Content Card */}
                <div 
                  className={`ml-16 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                  onClick={() => setActiveTimeline(activeTimeline === index ? null : index)}
                >
                  <motion.div
                    className={`bg-white/[0.02] border rounded-2xl p-6 cursor-pointer transition-all ${
                      activeTimeline === index 
                        ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[#8B5CF6] font-bold">{item.year}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    
                    <AnimatePresence>
                      {activeTimeline === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          <p className="text-[#8B5CF6] text-sm font-medium">
                            🏆 Milestone: {item.milestone}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills & Tools */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Expertise</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Skills & Tools</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Skills with Progress Bars */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Skills</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{skill.icon}</span>
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <span className="text-[#8B5CF6] font-semibold">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Tools I Use</h3>
              <div className="grid grid-cols-2 gap-4">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-white/[0.02] border rounded-xl p-4 text-center cursor-pointer transition ${
                      tool.primary ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{tool.icon}</span>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-gray-500 text-xs">{tool.years} years</p>
                    {tool.primary && (
                      <span className="text-[#8B5CF6] text-xs">Primary</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Music DNA / Genres */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Influences</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">My Music DNA</h2>
          </motion.div>

          {/* Spinning Vinyl */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="relative w-64 h-64 flex-shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              {/* Vinyl Record */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-full border-4 border-gray-800">
                {/* Grooves */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gray-700/30"
                    style={{ margin: `${i * 12 + 20}px` }}
                  />
                ))}
                {/* Center Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#8B5CF6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TR</span>
                </div>
              </div>
            </motion.div>

            {/* Genre Bars */}
            <div className="flex-1 space-y-4">
              {genres.map((genre, index) => (
                <motion.div
                  key={genre.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{genre.name}</span>
                    <span className="text-gray-500 text-sm">{genre.influence}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: genre.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${genre.influence}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day in My Life */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Behind The Scenes</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">A Day in My Life</h2>
          </motion.div>

          <div className="relative">
            {/* Time Line */}
            <div className="absolute left-[70px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8B5CF6] via-white/20 to-[#8B5CF6]" />

            {dayInLife.map((item, index) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-6 mb-6"
              >
                <div className="w-16 text-right">
                  <span className={`font-mono text-sm ${
                    item.type === 'work' ? 'text-[#8B5CF6]' : 
                    item.type === 'creative' ? 'text-purple-400' : 'text-gray-500'
                  }`}>{item.time}</span>
                </div>
                <div className={`w-4 h-4 rounded-full z-10 ${
                  item.type === 'work' ? 'bg-[#8B5CF6]' : 
                  item.type === 'creative' ? 'bg-purple-400' :
                  item.type === 'morning' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`} />
                <motion.div
                  className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-white/20 transition"
                  whileHover={{ x: 10 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-300">{item.activity}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts Flip Cards */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Get to Know Me</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Quick Fire</h2>
            <p className="text-gray-500 mt-4">Click to reveal</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funFacts.map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleFlip(index)}
                className="h-40 cursor-pointer perspective-1000"
              >
                <motion.div
                  className="relative w-full h-full"
                  animate={{ rotateY: flippedCards.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col items-center justify-center backface-hidden">
                    <span className="text-3xl mb-2">{fact.icon}</span>
                    <p className="font-medium text-center px-4">{fact.front}</p>
                  </div>
                  {/* Back */}
                  <div 
                    className="absolute inset-0 bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-2xl flex items-center justify-center backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <p className="font-medium text-center px-4">{fact.back}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section id="connect" className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Stay Connected</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Find Me Online</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative overflow-hidden bg-gradient-to-br ${social.color} rounded-2xl p-6 group`}
              >
                <div className="relative z-10">
                  <span className="text-4xl block mb-3">{social.icon}</span>
                  <p className="font-semibold text-lg">{social.name}</p>
                  <p className="text-white/70 text-sm">{social.handle}</p>
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Let&apos;s Create Together</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Got a project in mind? Need a beat? Want to book a session? I am always open to new collaborations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
                Browse Beats
              </a>
              <a href="/studio" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                Book Studio
              </a>
            </div>

            {/* Easter Egg Hint */}
            <p className="text-gray-600 text-xs mt-8">
              Psst... there is a secret code hidden on this page 🎮
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

// Typewriter Component
function TypewriterText({ texts }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const text = texts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts])

  return (
    <span>
      {currentText}
      <span className="animate-pulse text-[#8B5CF6]">|</span>
    </span>
  )
}