'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only on desktop with fine pointer (mouse)
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current
    if (!dot) return

    const onMouseMove = (e) => {
      // Instant position - no delay
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
      if (!isVisible) setIsVisible(true)
    }

    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    // Hover detection for interactive elements
    const onElementEnter = () => setIsHovering(true)
    const onElementLeave = () => setIsHovering(false)

    const addHoverListeners = () => {
      const elements = document.querySelectorAll('a, button, [data-hover]')
      elements.forEach(el => {
        el.addEventListener('mouseenter', onElementEnter)
        el.addEventListener('mouseleave', onElementLeave)
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    // Add hover listeners after small delay
    setTimeout(addHoverListeners, 100)

    // Re-add on DOM changes
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      observer.disconnect()
    }
  }, [isVisible])

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <div
      ref={dotRef}
      className={`fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ top: 0, left: 0 }}
    >
      <div
        className={`rounded-full bg-[#8B5CF6] transition-all duration-150 ease-out ${
          isHovering
            ? 'w-8 h-8 opacity-30'
            : 'w-2 h-2 opacity-70'
        }`}
      />
    </div>
  )
}
