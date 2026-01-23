'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Fade up reveal animation
export function FadeUp({ children, className = '', delay = 0, duration = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
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
    gsap.fromTo(ref.current,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Staggered children animation
export function StaggerChildren({ children, className = '', stagger = 0.1, from = 'bottom' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const items = containerRef.current?.children
    if (!items?.length) return

    const fromVars = {
      bottom: { opacity: 0, y: 60 },
      top: { opacity: 0, y: -60 },
      left: { opacity: 0, x: -60 },
      right: { opacity: 0, x: 60 },
      scale: { opacity: 0, scale: 0.8 },
    }

    const toVars = {
      bottom: { opacity: 1, y: 0 },
      top: { opacity: 1, y: 0 },
      left: { opacity: 1, x: 0 },
      right: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
    }

    gsap.fromTo(items,
      fromVars[from] || fromVars.bottom,
      {
        ...toVars[from] || toVars.bottom,
        duration: 0.8,
        stagger,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [stagger, from])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Parallax effect
export function Parallax({ children, className = '', speed = 0.5 }) {
  const ref = useRef(null)

  useEffect(() => {
    gsap.to(ref.current, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [speed])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Horizontal scroll reveal
export function SlideIn({ children, className = '', direction = 'left', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const x = direction === 'left' ? -100 : 100

    gsap.fromTo(ref.current,
      {
        opacity: 0,
        x,
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
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
    gsap.fromTo(ref.current,
      {
        opacity: 0,
        rotateY: 90,
        transformPerspective: 1000,
      },
      {
        opacity: 1,
        rotateY: 0,
        duration: 1.2,
        delay,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [delay])

  return (
    <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}

// Counter animation
export function CountUp({ end, duration = 2, className = '', suffix = '' }) {
  const ref = useRef(null)
  const countRef = useRef({ value: 0 })

  useEffect(() => {
    gsap.to(countRef.current, {
      value: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.innerText = Math.round(countRef.current.value) + suffix
        }
      },
    })
  }, [end, duration, suffix])

  return <span ref={ref} className={className}>0{suffix}</span>
}
