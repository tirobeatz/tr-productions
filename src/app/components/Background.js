'use client'

import { useState, useEffect, useRef } from 'react'

// Pre-defined particle positions to avoid hydration mismatch
const particles = [
  { left: '5%', top: '10%', opacity: 0.3, delay: '0s', duration: '18s' },
  { left: '15%', top: '85%', opacity: 0.4, delay: '2s', duration: '22s' },
  { left: '25%', top: '30%', opacity: 0.25, delay: '5s', duration: '25s' },
  { left: '35%', top: '60%', opacity: 0.35, delay: '1s', duration: '20s' },
  { left: '45%', top: '15%', opacity: 0.3, delay: '7s', duration: '28s' },
  { left: '55%', top: '75%', opacity: 0.4, delay: '3s', duration: '19s' },
  { left: '65%', top: '40%', opacity: 0.25, delay: '8s', duration: '24s' },
  { left: '75%', top: '90%', opacity: 0.35, delay: '4s', duration: '21s' },
  { left: '85%', top: '25%', opacity: 0.3, delay: '6s', duration: '26s' },
  { left: '95%', top: '55%', opacity: 0.4, delay: '9s', duration: '17s' },
  { left: '10%', top: '45%', opacity: 0.25, delay: '2s', duration: '23s' },
  { left: '20%', top: '70%', opacity: 0.35, delay: '5s', duration: '27s' },
]

export default function Background() {
  const [isMobile, setIsMobile] = useState(true)
  const glowRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cursor glow effect - only on desktop
  useEffect(() => {
    if (isMobile) return

    const glow = glowRef.current
    if (!glow) return

    const handleMouseMove = (e) => {
      glow.style.left = e.clientX + 'px'
      glow.style.top = e.clientY + 'px'
      glow.style.opacity = '1'
    }

    const handleMouseLeave = () => {
      glow.style.opacity = '0'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isMobile])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">


      {/* Cursor glow - follows mouse */}
      <div
        ref={glowRef}
        className="hidden md:block fixed w-[500px] h-[500px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 30%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-animate opacity-30" />

      {/* Main gradient glow - pulses */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[800px] lg:w-[1000px] h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] bg-[#8B5CF6] opacity-[0.08] sm:opacity-[0.1] rounded-full animate-glow-pulse"
        style={{ filter: isMobile ? 'blur(60px)' : 'blur(180px)' }}
      />


      {/* Floating orbs - slow drifting glows */}
      <div className="hidden md:block">
        <div
          className="absolute w-[400px] h-[400px] bg-[#8B5CF6] rounded-full opacity-[0.07] animate-orb-1"
          style={{ filter: 'blur(100px)' }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-[#6D28D9] rounded-full opacity-[0.05] animate-orb-2"
          style={{ filter: 'blur(80px)' }}
        />
        <div
          className="absolute w-[250px] h-[250px] bg-[#A78BFA] rounded-full opacity-[0.04] animate-orb-3"
          style={{ filter: 'blur(90px)' }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.slice(0, isMobile ? 8 : 12).map((p, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-[#8B5CF6] rounded-full animate-particle"
            style={{
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>


      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(5,5,5,0.4) 100%)',
        }}
      />
    </div>
  )
}
