'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function TiltCard({
  children,
  className = '',
  tiltStrength = 15,
  glareEnabled = true,
  scale = 1.02,
}) {
  const cardRef = useRef(null)
  const glareRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
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
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out',
    })

    // Move glare effect
    if (glareRef.current && glareEnabled) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100

      gsap.to(glareRef.current, {
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        opacity: 1,
        duration: 0.3,
      })
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    gsap.to(cardRef.current, {
      scale,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.3,
      })
    }
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {glareEnabled && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] opacity-0"
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
      className={`group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden
        hover:border-[#8B5CF6]/30 transition-colors duration-500
        hover:shadow-xl hover:shadow-[#8B5CF6]/10 ${className}`}
      tiltStrength={10}
      scale={1.03}
    >
      {children}
    </TiltCard>
  )
}

// Service card with tilt
export function ServiceTiltCard({ children, className = '' }) {
  return (
    <TiltCard
      className={`bg-white/[0.02] border border-white/5 rounded-2xl p-8
        hover:border-[#8B5CF6]/30 hover:bg-white/[0.04] transition-colors duration-500
        hover:shadow-xl hover:shadow-[#8B5CF6]/5 ${className}`}
      tiltStrength={8}
      scale={1.02}
    >
      {children}
    </TiltCard>
  )
}
