'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

// Pre-defined particle positions (reduced count)
const particles = [
  { left: '10%', top: '15%', opacity: 0.3, delay: '0s', duration: '20s' },
  { left: '25%', top: '75%', opacity: 0.35, delay: '3s', duration: '24s' },
  { left: '45%', top: '25%', opacity: 0.25, delay: '6s', duration: '22s' },
  { left: '65%', top: '65%', opacity: 0.3, delay: '2s', duration: '26s' },
  { left: '85%', top: '35%', opacity: 0.35, delay: '5s', duration: '18s' },
  { left: '15%', top: '55%', opacity: 0.25, delay: '8s', duration: '21s' },
]

export default function Background() {
  const [isMobile, setIsMobile] = useState(true)
  const glowRef = useRef(null)
  const rafRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cursor glow effect - only on desktop, optimized with RAF
  useEffect(() => {
    if (isMobile) return

    const glow = glowRef.current
    if (!glow) return

    let isMoving = false

    const updateGlow = () => {
      if (!glow) return
      glow.style.transform = `translate(${mousePos.current.x - 250}px, ${mousePos.current.y - 250}px)`

      if (isMoving) {
        rafRef.current = requestAnimationFrame(updateGlow)
      }
    }

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY

      if (!isMoving) {
        isMoving = true
        glow.style.opacity = '1'
        rafRef.current = requestAnimationFrame(updateGlow)
      }
    }

    const handleMouseLeave = () => {
      isMoving = false
      glow.style.opacity = '0'
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile])

  // Memoize particles to prevent re-renders
  const particleElements = useMemo(() => (
    particles.slice(0, isMobile ? 4 : 6).map((p, i) => (
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
    ))
  ), [isMobile])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Cursor glow - follows mouse */}
      {!isMobile && (
        <div
          ref={glowRef}
          className="fixed w-[500px] h-[500px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 30%, transparent 70%)',
            filter: 'blur(40px)',
            willChange: 'transform',
          }}
        />
      )}

      {/* Main gradient glow - uses CSS animation */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[800px] h-[250px] sm:h-[350px] md:h-[500px] bg-[#8B5CF6] opacity-[0.08] sm:opacity-[0.1] rounded-full animate-glow-pulse"
        style={{ filter: isMobile ? 'blur(60px)' : 'blur(150px)' }}
      />

      {/* Single floating orb - desktop only */}
      {!isMobile && (
        <div
          className="absolute w-[350px] h-[350px] bg-[#8B5CF6] rounded-full opacity-[0.06] animate-orb-1"
          style={{ filter: 'blur(80px)' }}
        />
      )}

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particleElements}
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />

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
