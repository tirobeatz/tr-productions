'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Split text into characters for animation
export function SplitText({ children, className = '', delay = 0 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const chars = containerRef.current?.querySelectorAll('.char')
    if (!chars?.length) return

    gsap.fromTo(chars,
      {
        opacity: 0,
        y: 50,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: 'power4.out',
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [delay])

  const text = typeof children === 'string' ? children : ''

  return (
    <span ref={containerRef} className={`inline-block ${className}`} style={{ perspective: '1000px' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char inline-block"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

// Line-by-line reveal animation
export function RevealLines({ children, className = '', stagger = 0.1 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const lines = containerRef.current?.querySelectorAll('.reveal-line')
    if (!lines?.length) return

    gsap.fromTo(lines,
      {
        opacity: 0,
        y: 40,
        clipPath: 'inset(100% 0 0 0)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0% 0 0 0)',
        duration: 1,
        stagger,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [stagger])

  return (
    <div ref={containerRef} className={className}>
      {Array.isArray(children) ? children.map((child, i) => (
        <div key={i} className="reveal-line overflow-hidden">
          {child}
        </div>
      )) : (
        <div className="reveal-line overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )
}

// Glitch text effect on hover
export function GlitchText({ children, className = '' }) {
  const textRef = useRef(null)

  const handleMouseEnter = () => {
    const element = textRef.current
    if (!element) return

    const originalText = element.getAttribute('data-text') || element.innerText
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let iterations = 0

    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index]
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join('')

      if (iterations >= originalText.length) {
        clearInterval(interval)
        element.innerText = originalText
      }

      iterations += 1 / 2
    }, 30)
  }

  return (
    <span
      ref={textRef}
      className={`${className} cursor-default`}
      data-text={children}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </span>
  )
}

// Word-by-word reveal
export function RevealWords({ children, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const words = containerRef.current?.querySelectorAll('.word')
    if (!words?.length) return

    gsap.fromTo(words,
      {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [])

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
