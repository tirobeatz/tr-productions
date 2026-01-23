'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransitionProvider({ children }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip transition on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Trigger transition
    setIsTransitioning(true)

    // Reset after animation
    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 400)

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
      {/* Page content with fade */}
      <div
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
        }}
      >
        {children}
      </div>

      {/* Subtle dark overlay that fades in/out */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none bg-[#050505]"
        style={{
          opacity: isTransitioning ? 0.6 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      />
    </>
  )
}
