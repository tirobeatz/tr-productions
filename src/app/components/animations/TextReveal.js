'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Split text into characters for animation
export function SplitText({ children, className = '', delay = 0 }) {
  const containerRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const chars = containerRef.current?.querySelectorAll('.char')
    if (!chars?.length || hasAnimated) return

    // Set initial state
    gsap.set(chars, {
      opacity: 0,
      y: 40,
    })

    // Animate in
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power3.out',
      delay,
      onComplete: () => setHasAnimated(true),
    })
  }, [delay, hasAnimated])

  const text = typeof children === 'string' ? children : ''

  return (
    <span ref={containerRef} className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

// Glitch text effect on hover
export function GlitchText({ children, className = '' }) {
  const textRef = useRef(null)

  const handleMouseEnter = () => {
    const element = textRef.current
    if (!element) return

    const originalText = element.getAttribute('data-text') || element.innerText
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let iterations = 0

    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '
          if (index < iterations) return originalText[index]
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join('')

      if (iterations >= originalText.length) {
        clearInterval(interval)
        element.innerText = originalText
      }

      iterations += 0.5
    }, 30)
  }

  return (
    <span
      ref={textRef}
      className={className}
      data-text={children}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </span>
  )
}

// Word-by-word reveal - simpler version
export function RevealWords({ children, className = '' }) {
  const containerRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const words = containerRef.current?.querySelectorAll('.word')
    if (!words?.length || hasAnimated) return

    gsap.set(words, {
      opacity: 0,
      y: 15,
    })

    gsap.to(words, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power2.out',
      delay: 0.3,
      onComplete: () => setHasAnimated(true),
    })
  }, [hasAnimated])

  const text = typeof children === 'string' ? children : ''

  return (
    <span ref={containerRef} className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="word inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </span>
  )
}

// Line-by-line reveal animation (for scroll-triggered content)
export function RevealLines({ children, className = '', stagger = 0.1 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const lines = containerRef.current?.querySelectorAll('.reveal-line')
    if (!lines?.length) return

    gsap.fromTo(lines,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, [stagger])

  return (
    <div ref={containerRef} className={className}>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="reveal-line">
          {child}
        </div>
      )) : (
        <div className="reveal-line">
          {children}
        </div>
      )}
    </div>
  )
}
