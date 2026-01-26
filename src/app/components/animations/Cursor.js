'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const rafRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Only on desktop with fine pointer (mouse)
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const dot = dotRef.current
    if (!dot) return

    // Use requestAnimationFrame for smooth cursor movement
    const updatePosition = () => {
      if (dot) {
        dot.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(updatePosition)
    }

    const onMouseMove = (e) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    // Use event delegation for hover detection (much more efficient)
    const onMouseOver = (e) => {
      const target = e.target
      if (target.matches('a, button, [data-hover], input, textarea, select')) {
        setIsHovering(true)
      }
    }

    const onMouseOut = (e) => {
      const target = e.target
      if (target.matches('a, button, [data-hover], input, textarea, select')) {
        setIsHovering(false)
      }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseout', onMouseOut, { passive: true })

    // Start the animation loop
    rafRef.current = requestAnimationFrame(updatePosition)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isMounted, isVisible])

  // Don't render on touch devices or SSR
  if (!isMounted) return null

  return (
    <div
      ref={dotRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ willChange: 'transform' }}
    >
      <div
        className={`rounded-full bg-[#8B5CF6] transition-all duration-100 ease-out ${
          isHovering
            ? 'w-8 h-8 opacity-30'
            : 'w-2 h-2 opacity-70'
        }`}
      />
    </div>
  )
}
