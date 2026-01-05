'use client'

import { useEffect, useRef, useState } from 'react'

// Lightweight scroll reveal hook - replaces Framer Motion whileInView
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element) // Only trigger once
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

// Component version for easier use
export function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0,
  threshold = 0.1 
}) {
  const [ref, isVisible] = useScrollReveal(threshold)

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-600 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}