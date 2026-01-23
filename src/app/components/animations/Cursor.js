'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorText, setCursorText] = useState('')

  useEffect(() => {
    // Only show on desktop
    if (window.matchMedia('(pointer: coarse)').matches) return

    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current

    const onMouseMove = (e) => {
      setIsVisible(true)

      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out',
      })

      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      })
    }

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    const onMouseEnter = () => {
      setIsVisible(true)
    }

    // Handle hover states on interactive elements
    const handleElementHover = () => {
      const hoverElements = document.querySelectorAll('a, button, [data-cursor]')

      hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setIsHovering(true)
          const text = el.getAttribute('data-cursor-text')
          if (text) setCursorText(text)
        })

        el.addEventListener('mouseleave', () => {
          setIsHovering(false)
          setCursorText('')
        })
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    // Set up hover detection after a short delay to ensure DOM is ready
    const timeout = setTimeout(handleElementHover, 100)

    // Re-run on navigation
    const observer = new MutationObserver(handleElementHover)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [])

  // Don't render on mobile
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className={`rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 ${
            isHovering
              ? 'w-20 h-20 bg-white/10'
              : 'w-10 h-10'
          }`}
        >
          {cursorText && (
            <span className="text-white text-xs font-medium">{cursorText}</span>
          )}
        </div>
      </div>

      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible && !isHovering ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      {/* Hide default cursor */}
      <style jsx global>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  )
}
