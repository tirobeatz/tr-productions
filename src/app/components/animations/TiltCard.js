'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'

export default function TiltCard({
  children,
  className = '',
  tiltStrength = 12,
  glareEnabled = true,
  scale = 1.02,
}) {
  const cardRef = useRef(null)
  const glareRef = useRef(null)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Disable tilt on mobile/touch devices for performance
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return

    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -tiltStrength
    const rotateY = ((x - centerX) / centerX) * tiltStrength

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 800,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    // Move glare effect
    if (glareRef.current && glareEnabled) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100

      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
      glareRef.current.style.opacity = '1'
    }
  }, [isMobile, tiltStrength, glareEnabled])

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return

    gsap.to(cardRef.current, {
      scale,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [isMobile, scale])

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    })

    if (glareRef.current) {
      glareRef.current.style.opacity = '0'
    }
  }, [isMobile])

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ transformStyle: isMobile ? 'flat' : 'preserve-3d', willChange: isMobile ? 'auto' : 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {glareEnabled && !isMobile && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0 transition-opacity duration-200"
          style={{ transform: 'translateZ(1px)' }}
        />
      )}
    </div>
  )
}

// Beat card with 3D tilt and hover effects
export function BeatTiltCard({ children, className = '' }) {
  return (
    <TiltCard
      className={`group bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden
        hover:border-[#8B5CF6]/30 transition-colors duration-300
        hover:shadow-lg hover:shadow-[#8B5CF6]/10 ${className}`}
      tiltStrength={8}
      scale={1.02}
    >
      {children}
    </TiltCard>
  )
}

// Service card with tilt
export function ServiceTiltCard({ children, className = '' }) {
  return (
    <TiltCard
      className={`group bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8
        hover:border-[#8B5CF6]/30 hover:bg-white/[0.04] transition-colors duration-300
        hover:shadow-lg hover:shadow-[#8B5CF6]/5 ${className}`}
      tiltStrength={6}
      scale={1.02}
    >
      {children}
    </TiltCard>
  )
}
