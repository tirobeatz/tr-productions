'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function MagneticButton({
  children,
  className = '',
  strength = 0.4,
  as: Component = 'button',
  ...props
}) {
  const buttonRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(button, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    })

    // Inner content moves more
    const inner = button.querySelector('.magnetic-inner')
    if (inner) {
      gsap.to(inner, {
        x: x * strength * 0.5,
        y: y * strength * 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const handleMouseLeave = () => {
    const button = buttonRef.current
    if (!button) return

    setIsHovered(false)

    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })

    const inner = button.querySelector('.magnetic-inner')
    if (inner) {
      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      })
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <Component
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <span className="magnetic-inner inline-flex items-center gap-2">
        {children}
      </span>
    </Component>
  )
}

// Magnetic link variant
export function MagneticLink({ children, href, className = '', strength = 0.3, ...props }) {
  return (
    <MagneticButton
      as="a"
      href={href}
      className={className}
      strength={strength}
      {...props}
    >
      {children}
    </MagneticButton>
  )
}
