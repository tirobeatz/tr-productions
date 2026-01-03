'use client'

import { motion } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
     {/* Background Gradient + Sound Waves */}
<div className="fixed inset-0 pointer-events-none">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.07] blur-[180px] rounded-full" />
  
  {/* Subtle sound wave lines */}
  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
        <path 
          d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" 
          stroke="#8B5CF6" 
          strokeWidth="1" 
          fill="none"
        />
        <path 
          d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" 
          stroke="#8B5CF6" 
          strokeWidth="1" 
          fill="none"
        />
        <path 
          d="M0 160 Q 100 120, 200 160 T 400 160 T 600 160 T 800 160 T 1000 160 T 1200 160 T 1400 160 T 1600 160 T 1800 160 T 2000 160 T 2200 160 T 2400 160" 
          stroke="#8B5CF6" 
          strokeWidth="1" 
          fill="none"
        />
        <path 
          d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" 
          stroke="#8B5CF6" 
          strokeWidth="1" 
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#soundWaves)" />
  </svg>
</div>

      <Header />
      
{/* Hero Section */}
<section className="relative flex items-center justify-center min-h-screen px-6 pt-20 overflow-hidden">
  
{/* Background studio image with fade */}
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

  {/* Noise texture overlay */}
  <div 
    className="absolute inset-0 opacity-[0.03] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />

  {/* Abstract wave shape */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <svg 
      className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.04]" 
      viewBox="0 0 1440 600" 
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M0 300 Q 360 150, 720 300 T 1440 300 L 1440 600 L 0 600 Z" 
        fill="url(#waveGradient)"
      />
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
    <svg 
      className="absolute bottom-0 left-0 w-full h-[50%] opacity-[0.03]" 
      viewBox="0 0 1440 500" 
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M0 250 Q 480 100, 960 250 T 1920 250 L 1920 500 L 0 500 Z" 
        fill="url(#waveGradient2)"
      />
      <defs>
        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  </div>

  {/* Subtle center glow */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

  <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center">
    
    {/* Left Side - Text */}
    <motion.div 
      className="relative z-10 text-center lg:text-left lg:max-w-lg"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Rotating Text */}
      <motion.div
        variants={staggerItem}
        className="text-gray-500 font-medium mb-6 tracking-[0.3em] uppercase text-xs h-5 overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -20, -40, -60, -80, 0] }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: 'easeInOut',
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          }}
          className="flex flex-col gap-0"
        >
          <span className="h-5 flex items-center lg:justify-start justify-center">Music Producer</span>
          <span className="h-5 flex items-center lg:justify-start justify-center">Beat Maker</span>
          <span className="h-5 flex items-center lg:justify-start justify-center">Mix & Master Engineer</span>
          <span className="h-5 flex items-center lg:justify-start justify-center">Sound Designer</span>
          <span className="h-5 flex items-center lg:justify-start justify-center">Recording Engineer</span>
          <span className="h-5 flex items-center lg:justify-start justify-center">Music Producer</span>
        </motion.div>
      </motion.div>

      <motion.h1 
        variants={staggerItem}
        className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight"
      >
        TR <span className="text-[#8B5CF6]">Productions</span>
      </motion.h1>

      <motion.p 
        variants={staggerItem}
        className="text-lg md:text-xl text-gray-500 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed"
      >
        Industry ready sound crafted to stand out.
      </motion.p>

      <motion.div 
        variants={staggerItem}
        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
      >
        <a href="/beats" className="group bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition flex items-center justify-center gap-2">
          Browse Beats
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
        <a href="/studio" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
          Book Studio Session
        </a>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={staggerItem}
        className="flex flex-wrap justify-center lg:justify-start gap-6 mt-12 text-sm text-gray-500"
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">500+</span> Beats
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">200+</span> Artists
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">5+</span> Years
        </div>
      </motion.div>
    </motion.div>

    {/* Right Side - Featured Beat Player */}
    <motion.div 
      className="relative z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Glow behind player */}
      <div className="absolute -inset-4 bg-[#8B5CF6] opacity-[0.08] blur-[60px] rounded-3xl pointer-events-none" />
      
      <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-sm w-[280px]">
        {/* Now Playing Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Now Playing</span>
          <span className="text-xs text-[#8B5CF6]">Featured</span>
        </div>

        {/* Album Art Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg ml-0.5">▶</span>
          </motion.div>
        </div>

        {/* Track Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-sm mb-1">Midnight Dreams</h3>
          <p className="text-gray-500 text-xs">Dark Trap • 140 BPM</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#8B5CF6] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '35%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-500">
            <span>1:12</span>
            <span>3:24</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold">$29.99</span>
            <span className="text-gray-500 text-xs ml-1">Lease</span>
          </div>
          <button className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition">
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>

  </div>
  
  {/* Scroll indicator */}
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.5, duration: 1 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600"
  >
    <span className="text-xs uppercase tracking-widest">Scroll</span>
    <motion.div 
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      className="w-px h-10 bg-gradient-to-b from-gray-600 to-transparent" 
    />
  </motion.div>
</section>

      {/* Services Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Services</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">What I Offer</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to bring your musical vision to life
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
          >
            {/* Beat Store */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-150"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                <span className="text-xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Beat Store</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                Browse exclusive beats crafted for your sound. Instant download with multiple license options.
              </p>
              <a href="/beats" className="text-white hover:text-gray-300 transition flex items-center gap-2 text-sm">
                Browse Beats <span>→</span>
              </a>
            </motion.div>

            {/* Mix & Master */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-150"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                <span className="text-xl">🎚️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Mix & Master</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                Professional mixing and mastering to make your tracks radio-ready. Fast online delivery.
              </p>
              <a href="/mixing" className="text-white hover:text-gray-300 transition flex items-center gap-2 text-sm">
                Learn More <span>→</span>
              </a>
            </motion.div>

            {/* Studio Sessions */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-150"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                <span className="text-xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Studio Sessions</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                Book time in my professional studio in Trier. Recording, production, and creative sessions.
              </p>
              <a href="/studio" className="text-white hover:text-gray-300 transition flex items-center gap-2 text-sm">
                Book Session <span>→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Beats Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div>
              <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Latest Beats</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Fresh From The Lab</h2>
            </div>
            <a href="/beats" className="text-gray-500 hover:text-white transition mt-4 md:mt-0 flex items-center gap-2 text-sm">
              View All Beats <span>→</span>
            </a>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
          >
            {/* Beat Card 1 */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-150"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                <span className="text-5xl opacity-30">🎹</span>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-lg ml-1">▶</span>
                  </div>
                </button>
              </div>
              <div className="p-5">
                <h4 className="font-semibold mb-1">Midnight Dreams</h4>
                <p className="text-gray-600 text-sm mb-3">Dark Trap • 140 BPM</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">$29.99</span>
                  <span className="text-xs text-gray-600">MP3 Lease</span>
                </div>
              </div>
            </motion.div>

            {/* Beat Card 2 */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-150"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                <span className="text-5xl opacity-30">🎧</span>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-lg ml-1">▶</span>
                  </div>
                </button>
              </div>
              <div className="p-5">
                <h4 className="font-semibold mb-1">City Lights</h4>
                <p className="text-gray-600 text-sm mb-3">R&B Soul • 85 BPM</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">$34.99</span>
                  <span className="text-xs text-gray-600">MP3 Lease</span>
                </div>
              </div>
            </motion.div>

            {/* Beat Card 3 */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-150"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                <span className="text-5xl opacity-30">🔥</span>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-lg ml-1">▶</span>
                  </div>
                </button>
              </div>
              <div className="p-5">
                <h4 className="font-semibold mb-1">No Mercy</h4>
                <p className="text-gray-600 text-sm mb-3">Hard Trap • 150 BPM</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">$29.99</span>
                  <span className="text-xs text-gray-600">MP3 Lease</span>
                </div>
              </div>
            </motion.div>

            {/* Beat Card 4 */}
            <motion.div 
              whileHover={{ y: -8, transition: { duration: 0.15 } }}
              className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-150"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative">
                <span className="text-5xl opacity-30">💎</span>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-black text-lg ml-1">▶</span>
                  </div>
                </button>
              </div>
              <div className="p-5">
                <h4 className="font-semibold mb-1">Diamonds</h4>
                <p className="text-gray-600 text-sm mb-3">Melodic Rap • 130 BPM</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">$39.99</span>
                  <span className="text-xs text-gray-600">MP3 Lease</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">What Artists Say</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
          >
            {/* Testimonial 1 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-white/40">★</span>
                ))}
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                "The mix came out incredible. TR really understood the vibe I was going for and elevated the whole track."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm">
                  MJ
                </div>
                <div>
                  <p className="font-medium text-sm">Marcus J.</p>
                  <p className="text-gray-600 text-xs">Hip-Hop Artist</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-white/40">★</span>
                ))}
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                "Studio sessions with TR are always productive. Great energy, professional setup, and amazing results."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm">
                  LM
                </div>
                <div>
                  <p className="font-medium text-sm">Lisa M.</p>
                  <p className="text-gray-600 text-xs">R&B Singer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-white/40">★</span>
                ))}
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                "Bought 3 beats so far and every one has been fire. The quality is unmatched for the price."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm">
                  DK
                </div>
                <div>
                  <p className="font-medium text-sm">David K.</p>
                  <p className="text-gray-600 text-xs">Rapper</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="relative py-32 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeUp}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Create?</h2>
          <p className="text-gray-500 mb-10 text-lg max-w-xl mx-auto">
            Let's work together to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
              Browse Beats
            </a>
            <a href="/contact" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
              Get in Touch
            </a>
          </div>
        </div>
      </motion.section>

      <Footer />
    </main>
  )
}