'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'
import { supabase } from '../../lib/supabase'

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [activeTimeline, setActiveTimeline] = useState(null)
  const [flippedCards, setFlippedCards] = useState([])
  const [easterEggFound, setEasterEggFound] = useState(false)
  const [siteImages, setSiteImages] = useState([])
  const [konamiProgress, setKonamiProgress] = useState(0)

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    supabase.from('site_images').select('*').eq('is_active', true).then(({ data }) => setSiteImages(data || []))
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === konamiCode[konamiProgress]) {
        if (konamiProgress + 1 === konamiCode.length) { setEasterEggFound(true); setKonamiProgress(0) }
        else setKonamiProgress(p => p + 1)
      } else setKonamiProgress(0)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [konamiProgress])

  const getImage = (loc) => siteImages.find(img => img.location === loc)?.image_url
  const toggleFlip = (i) => setFlippedCards(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  // Count up hook
  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(false)
    const ref = useRef(null)
    useEffect(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !started) {
          setStarted(true)
          let n = 0
          const inc = end / (duration / 16)
          const t = setInterval(() => { n += inc; if (n >= end) { setCount(end); clearInterval(t) } else setCount(Math.floor(n)) }, 16)
        }
      }, { threshold: 0.5 })
      if (ref.current) obs.observe(ref.current)
      return () => obs.disconnect()
    }, [end, duration, started])
    return [count, ref]
  }

  const [beatsCount, beatsRef] = useCountUp(500)
  const [artistsCount, artistsRef] = useCountUp(120)
  const [yearsCount, yearsRef] = useCountUp(5)
  const [projectsCount, projectsRef] = useCountUp(200)

  const timeline = [
    { year: '2019', title: 'The Beginning', desc: 'Started making beats in my bedroom with just a laptop and FL Studio.', icon: '🌱', milestone: 'First beat ever made' },
    { year: '2020', title: 'First Placement', desc: 'Landed my first placement with a local artist.', icon: '🎯', milestone: '1st official release' },
    { year: '2021', title: 'Building the Studio', desc: 'Invested in proper equipment and acoustic treatment.', icon: '🏠', milestone: 'Home studio complete' },
    { year: '2022', title: 'Going Online', desc: 'Started selling beats online and offering mixing services.', icon: '🌍', milestone: '100+ beats sold' },
    { year: '2023', title: 'Full-Time Producer', desc: 'Took the leap and went full-time. No backup plan.', icon: '🚀', milestone: 'Full-time music' },
    { year: '2024', title: 'TR Productions', desc: 'Launched the official brand. The full package.', icon: '👑', milestone: 'Brand launch' }
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
    { name: 'Pro Tools', icon: '🎛️', years: 2 },
    { name: 'iZotope', icon: '🔮', years: 3 },
    { name: 'Waves', icon: '🌊', years: 4 },
    { name: 'Serum', icon: '💉', years: 4, primary: true },
    { name: 'Kontakt', icon: '🎻', years: 3 }
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

  const socials = [
    { name: 'Instagram', icon: '📸', url: '#', color: 'from-purple-500 to-pink-500', handle: '@trproductions' },
    { name: 'YouTube', icon: '🎬', url: '#', color: 'from-red-500 to-red-600', handle: 'TR Productions' },
    { name: 'TikTok', icon: '🎵', url: '#', color: 'from-gray-800 to-black', handle: '@trproductions' },
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

  const stats = [
    { count: beatsCount, ref: beatsRef, label: 'Beats Made' },
    { count: artistsCount, ref: artistsRef, label: 'Artists Worked With' },
    { count: yearsCount, ref: yearsRef, label: 'Years Experience' },
    { count: projectsCount, ref: projectsRef, label: 'Projects Completed' }
  ]

  // Simplified animation variants
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      
<Background />

      <Header />

      {/* Easter Egg */}
      <AnimatePresence>
        {easterEggFound && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEasterEggFound(false)}>
            <motion.div className="text-center px-6" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }}>
              <span className="text-7xl md:text-9xl block mb-6">🎉</span>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">You Found It!</h2>
              <p className="text-gray-400 mb-2">Secret Konami Code Unlocked</p>
              <p className="text-[#8B5CF6]">10% off your next beat!</p>
              <p className="text-gray-500 text-sm mt-4">Code: KONAMI10</p>
              <p className="text-gray-600 text-xs mt-8">Tap anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 pt-20">
        <div className="text-center max-w-5xl mx-auto">
          <motion.div initial="hidden" animate={mounted ? "visible" : "hidden"} variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
            <motion.p variants={fadeUp} className="text-[#8B5CF6] font-medium mb-4 md:mb-6 tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm">
              The Story Behind The Sound
            </motion.p>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight mb-6 md:mb-8">
              <span className="relative inline-block">TR</span>{' '}
              <span className="text-[#8B5CF6]">Productions</span>
            </motion.h1>

            <motion.div variants={fadeUp} className="text-lg md:text-2xl text-gray-400 mb-8 md:mb-12 h-8">
              <TypewriterText texts={['Producer. Engineer. Artist.', 'Making beats that hit different.', 'From Trier to the world.', 'Your vision, my sound.']} />
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <a href="#journey" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105">My Journey</a>
              <a href="#connect" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition">Let's Connect</a>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator - Desktop only */}
          <motion.div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 hidden md:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
            <motion.div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <motion.div className="w-1.5 h-3 bg-[#8B5CF6] rounded-full mt-2" animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements - Desktop only */}
        {!isMobile && (
          <>
            <motion.div className="absolute top-1/4 left-[10%] text-4xl md:text-6xl opacity-20" animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>🎹</motion.div>
            <motion.div className="absolute bottom-1/4 right-[10%] text-4xl md:text-6xl opacity-20" animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>🎧</motion.div>
          </>
        )}
      </section>

      {/* Stats */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} ref={s.ref} className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <p className="text-4xl md:text-6xl font-bold text-[#8B5CF6] mb-2">{s.count}+</p>
                <p className="text-gray-500 text-xs md:text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            {[{ loc: 'about-profile', icon: '👨‍🎤', label: 'Profile Photo' }, { loc: 'about-studio', icon: '🎧', label: 'Working in Studio' }].map((item, i) => (
              <motion.div key={item.loc} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden">
                {getImage(item.loc) ? <img src={getImage(item.loc)} alt={item.label} className="w-full h-full object-cover" loading="lazy" /> : (
                  <div className="text-center"><span className="text-6xl md:text-8xl block mb-4">{item.icon}</span><p className="text-gray-500 text-sm">{item.label}</p></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="journey" className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">The Journey</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Started</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8B5CF6] via-[#8B5CF6]/50 to-transparent" />

            {timeline.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative flex items-center mb-8 md:mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="absolute left-6 md:left-1/2 w-3 h-3 md:w-4 md:h-4 -translate-x-1/2 bg-[#8B5CF6] rounded-full z-10 ring-4 ring-[#050505]" />
                <div className={`ml-12 md:ml-0 md:w-[45%] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`} onClick={() => setActiveTimeline(activeTimeline === i ? null : i)}>
                  <div className={`bg-white/[0.02] border rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer transition-all ${activeTimeline === i ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`flex items-center gap-2 md:gap-3 mb-2 md:mb-3 ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
                      <span className="text-xl md:text-2xl">{item.icon}</span>
                      <span className="text-[#8B5CF6] font-bold text-sm md:text-base">{item.year}</span>
                    </div>
                    <h3 className="text-base md:text-xl font-semibold mb-1 md:mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.desc}</p>
                    <AnimatePresence>
                      {activeTimeline === i && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                          <p className="text-[#8B5CF6] text-xs md:text-sm font-medium">🏆 {item.milestone}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills & Tools */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Expertise</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Skills & Tools</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Skills</h3>
              <div className="space-y-4 md:space-y-6">
                {skills.map((s, i) => (
                  <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-sm md:text-base">{s.icon}</span><span className="font-medium text-sm md:text-base">{s.name}</span></div>
                      <span className="text-[#8B5CF6] font-semibold text-sm">{s.level}%</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" initial={{ width: 0 }} whileInView={{ width: `${s.level}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Tools I Use</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {tools.map((t, i) => (
                  <motion.div key={t.name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`bg-white/[0.02] border rounded-xl p-3 md:p-4 text-center transition ${t.primary ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5' : 'border-white/5 hover:border-white/20'}`}>
                    <span className="text-2xl md:text-3xl block mb-1 md:mb-2">{t.icon}</span>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.years} years</p>
                    {t.primary && <span className="text-[#8B5CF6] text-xs">Primary</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Music DNA */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Influences</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">My Music DNA</h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Vinyl - smaller on mobile */}
            <motion.div className="relative w-40 h-40 md:w-64 md:h-64 flex-shrink-0" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-full border-4 border-gray-800">
                {[...Array(6)].map((_, i) => <div key={i} className="absolute inset-0 rounded-full border border-gray-700/30" style={{ margin: `${i * 10 + 15}px` }} />)}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 bg-[#8B5CF6] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TR</span>
                </div>
              </div>
            </motion.div>

            <div className="flex-1 w-full space-y-3 md:space-y-4">
              {genres.map((g, i) => (
                <motion.div key={g.name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm md:text-base">{g.name}</span>
                    <span className="text-gray-500 text-xs md:text-sm">{g.influence}%</span>
                  </div>
                  <div className="h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: g.color }} initial={{ width: 0 }} whileInView={{ width: `${g.influence}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day in Life */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Behind The Scenes</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">A Day in My Life</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[52px] md:left-[70px] top-0 bottom-0 w-px bg-gradient-to-b from-[#8B5CF6] via-white/20 to-[#8B5CF6]" />
            {dayInLife.map((item, i) => (
              <motion.div key={item.time} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="w-12 md:w-16 text-right">
                  <span className={`font-mono text-xs md:text-sm ${item.type === 'work' ? 'text-[#8B5CF6]' : item.type === 'creative' ? 'text-purple-400' : 'text-gray-500'}`}>{item.time}</span>
                </div>
                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full z-10 flex-shrink-0 ${item.type === 'work' ? 'bg-[#8B5CF6]' : item.type === 'creative' ? 'bg-purple-400' : item.type === 'morning' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 hover:border-white/20 transition">
                  <span className="text-lg md:text-xl">{item.icon}</span>
                  <span className="text-gray-300 text-xs md:text-sm">{item.activity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Get to Know Me</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Quick Fire</h2>
            <p className="text-gray-500 mt-3 md:mt-4 text-sm">Tap to reveal</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {funFacts.map((fact, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                onClick={() => toggleFlip(i)} className="h-32 md:h-40 cursor-pointer" style={{ perspective: '1000px' }}>
                <motion.div className="relative w-full h-full" animate={{ rotateY: flippedCards.includes(i) ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                  <div className="absolute inset-0 bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center backface-hidden p-3">
                    <span className="text-2xl md:text-3xl mb-1 md:mb-2">{fact.icon}</span>
                    <p className="font-medium text-center text-xs md:text-sm">{fact.front}</p>
                  </div>
                  <div className="absolute inset-0 bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-xl md:rounded-2xl flex items-center justify-center backface-hidden p-3" style={{ transform: 'rotateY(180deg)' }}>
                    <p className="font-medium text-center text-xs md:text-sm">{fact.back}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect */}
      <section id="connect" className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">Stay Connected</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Find Me Online</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {socials.map((s, i) => (
              <motion.a key={s.name} href={s.url} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden bg-gradient-to-br ${s.color} rounded-xl md:rounded-2xl p-4 md:p-6 group`}>
                <div className="relative z-10">
                  <span className="text-2xl md:text-4xl block mb-2 md:mb-3">{s.icon}</span>
                  <p className="font-semibold text-sm md:text-lg">{s.name}</p>
                  <p className="text-white/70 text-xs md:text-sm">{s.handle}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">Let's Create Together</h2>
            <p className="text-gray-400 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">Got a project in mind? Need a beat? Want to book a session?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105">Browse Beats</a>
              <a href="/studio" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition">Book Studio</a>
            </div>
            <p className="text-gray-600 text-xs mt-6 md:mt-8">Psst... there's a secret code hidden on this page 🎮</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function TypewriterText({ texts }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = texts[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < t.length) setText(t.slice(0, text.length + 1))
        else setTimeout(() => setDeleting(true), 2000)
      } else {
        if (text.length > 0) setText(t.slice(0, text.length - 1))
        else { setDeleting(false); setIndex((index + 1) % texts.length) }
      }
    }, deleting ? 50 : 100)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, texts])

  return <span>{text}<span className="animate-pulse text-[#8B5CF6]">|</span></span>
}