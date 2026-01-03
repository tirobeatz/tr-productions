'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const trailRefs = useRef([])
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  const trailLength = 40
  const positions = useRef(Array(trailLength).fill({ x: -100, y: -100 }))
  const moveTimeout = useRef(null)

  useEffect(() => {
    if (window.innerWidth < 768) return

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

      setIsMoving(true)
      
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current)
      }
      moveTimeout.current = setTimeout(() => {
        setIsMoving(false)
      }, 100)
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

        x += (nextX - x) * 0.3
        y += (nextY - y) * 0.3
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    document.addEventListener('mousemove', handleMouseMove)

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
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current)
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <style jsx global>{`
        @keyframes colorPulse {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.7);
            box-shadow: 0 0 0 rgba(167, 139, 250, 0);
          }
          50% {
            border-color: rgba(167, 139, 250, 1);
            box-shadow: 0 0 12px rgba(167, 139, 250, 0.8);
          }
        }
        body.is-dragging .custom-cursor {
          opacity: 0 !important;
          visibility: hidden !important;
        }
        body.is-dragging * {
          cursor: grabbing !important;
        }
      `}</style>

      {/* Trail segments */}
      {[...Array(trailLength)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="custom-cursor fixed pointer-events-none z-[9998] rounded-full"
          style={{
            width: `${18 - i * 0.4}px`,
            height: `${18 - i * 0.4}px`,
            transform: 'translate(-50%, -50%)',
            background: `rgba(88, 50, 168, ${0.25 - i * 0.006})`,
            filter: `blur(${2 + i * 0.2}px)`,
            opacity: isMoving && !isHovering ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      ))}

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor fixed w-3 h-3 border rounded-full pointer-events-none z-[9999]"
        style={{
          transform: 'translate(-50%, -50%)',
          borderColor: 'rgba(255, 255, 255, 0.7)',
          animation: isHovering ? 'colorPulse 0.8s ease-in-out infinite' : 'none',
        }}
      />
    </>
  )
}