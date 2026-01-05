'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = window.innerWidth < 768 || 'ontouchstart' in window
    setIsMobile(checkMobile)
    
    if (checkMobile) return

    setIsVisible(true)

    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, .cursor-hover').forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })
    }

    addHoverListeners()

    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    const handleMouseLeaveWindow = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
    }
    const handleMouseEnterWindow = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '1'
    }

    document.addEventListener('mouseleave', handleMouseLeaveWindow)
    document.addEventListener('mouseenter', handleMouseEnterWindow)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeaveWindow)
      document.removeEventListener('mouseenter', handleMouseEnterWindow)
      observer.disconnect()
    }
  }, [])

  if (isMobile || !isVisible) return null

  return (
    <>
      <style jsx global>{`
        * { cursor: none !important; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          .custom-cursor { display: none !important; }
        }
      `}</style>

      <div
        ref={cursorRef}
        className="custom-cursor fixed pointer-events-none z-[9999] rounded-full"
        style={{
          width: isHovering ? '10px' : '6px',
          height: isHovering ? '10px' : '6px',
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.5 : 1})`,
          background: isHovering 
            ? 'rgba(139, 92, 246, 1)' 
            : 'rgba(255, 255, 255, 0.9)',
          boxShadow: isHovering 
            ? '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)' 
            : '0 0 10px rgba(255, 255, 255, 0.3)',
          transition: 'width 0.15s ease, height 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease, opacity 0.2s ease',
        }}
      />
    </>
  )
}