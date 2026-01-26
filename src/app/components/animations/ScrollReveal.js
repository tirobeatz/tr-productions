'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Fade up reveal animation
export function FadeUp({ children, className = '', delay = 0, duration = 0.8 }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Scale up with fade
export function ScaleUp({ children, className = '', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Staggered children animation - optimized
export function StaggerChildren({ children, className = '', stagger = 0.08, from = 'bottom' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const items = containerRef.current?.children
    if (!items?.length) return

    const fromVars = {
      bottom: { opacity: 0, y: 30 },
      top: { opacity: 0, y: -30 },
      left: { opacity: 0, x: -30 },
      right: { opacity: 0, x: 30 },
      scale: { opacity: 0, scale: 0.95 },
    }

    const toVars = {
      bottom: { opacity: 1, y: 0 },
      top: { opacity: 1, y: 0 },
      left: { opacity: 1, x: 0 },
      right: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(items,
        fromVars[from] || fromVars.bottom,
        {
          ...toVars[from] || toVars.bottom,
          duration: 0.6,
          stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [stagger, from])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Parallax effect - optimized with will-change
export function Parallax({ children, className = '', speed = 0.3 }) {
  const ref = useRef(null)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Disable parallax on mobile for performance
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => speed * 80,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1, // Smoother scrubbing
        },
      })
    })
    return () => ctx.revert()
  }, [speed, isMobile])

  return (
    <div ref={ref} className={className} style={{ willChange: isMobile ? 'auto' : 'transform' }}>
      {children}
    </div>
  )
}

// Horizontal scroll reveal
export function SlideIn({ children, className = '', direction = 'left', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const x = direction === 'left' ? -40 : 40

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, x },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [direction, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Rotate in effect
export function RotateIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        {
          opacity: 0,
          rotateY: 45,
          transformPerspective: 800,
        },
        {
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

// Counter animation
export function CountUp({ end, duration = 1.5, className = '', suffix = '' }) {
  const ref = useRef(null)
  const countRef = useRef({ value: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(countRef.current, {
        value: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.innerText = Math.round(countRef.current.value) + suffix
          }
        },
      })
    })
    return () => ctx.revert()
  }, [end, duration, suffix])

  return <span ref={ref} className={className}>0{suffix}</span>
}
