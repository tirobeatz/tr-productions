'use client'

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Check if mobile/touch device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
  }, [])

  useEffect(() => {
    // Skip Lenis on mobile for better native scroll performance
    if (isMobile) {
      // Just make sure ScrollTrigger works without Lenis
      ScrollTrigger.defaults({
        scroller: undefined
      })
      return
    }

    // Initialize Lenis smooth scroll for desktop
    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Store RAF callback reference for proper cleanup
    const rafCallback = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    // Store on window for access
    window.lenis = lenis

    // Cleanup
    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafCallback)
      window.lenis = null
    }
  }, [isMobile])

  return children
}

// Custom hook to access Lenis instance
export function useLenis() {
  return typeof window !== 'undefined' ? window.lenis : null
}
