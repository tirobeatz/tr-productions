'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const trailRefs = useRef([])
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(true) // Default to true to prevent flash
  
  const trailLength = 12 // Reduced from 40 to 12
  const positions = useRef(Array(trailLength).fill({ x: -100, y: -100 }))

  useEffect(() => {
    // Check if mobile - don't render cursor at all
    const checkMobile = window.innerWidth < 768 || 'ontouchstart' in window
    setIsMobile(checkMobile)
    
    if (checkMobile) return

    setIsVisible(true)

    let mouseX = -100
    let mouseY = -100

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (cursorRef.current) {
        cursorRef.current.style.left = mouseX + 'px'
        cursorRef.current.style.top = mouseY + 'px'
      }
    }

    let animationId
    const animate = () => {
      let x = mouseX
      let y = mouseY

      positions.current.forEach((_, i) => {
        const nextX = positions.current[i].x
        const nextY = positions.current[i].y

        positions.current[i] = { x, y }

        if (trailRefs.current[i]) {
          trailRefs.current[i].style.left = x + 'px'
          trailRefs.current[i].style.top = y + 'px'
        }

        x += (nextX - x) * 0.35
        y += (nextY - y) * 0.35
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    document.addEventListener('mousemove', handleMouseMove, { passive: true })

    const addHoverListeners = () => {
      document.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })
    }

    addHoverListeners()

    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [])

  // Don't render anything on mobile
  if (isMobile || !isVisible) return null

  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          .custom-cursor { display: none !important; }
        }
      `}</style>

      {/* Trail segments - simplified, no blur */}
      {[...Array(trailLength)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="custom-cursor fixed pointer-events-none z-[9998] rounded-full"
          style={{
            width: `${14 - i * 0.8}px`,
            height: `${14 - i * 0.8}px`,
            transform: 'translate(-50%, -50%)',
            background: `rgba(139, 92, 246, ${0.3 - i * 0.02})`,
            // No blur - much better performance
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor fixed w-3 h-3 rounded-full pointer-events-none z-[9999] border border-white/70"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: isHovering ? '0 0 12px rgba(139, 92, 246, 0.8)' : 'none',
          borderColor: isHovering ? 'rgba(139, 92, 246, 1)' : 'rgba(255, 255, 255, 0.7)',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
      />
    </>
  )
}