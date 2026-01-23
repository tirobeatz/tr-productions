'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

// Magnetic nav link component
function MagneticNavLink({ href, children, onClick }) {
  const linkRef = useRef(null)

  const handleMouseMove = (e) => {
    const link = linkRef.current
    if (!link) return

    const rect = link.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(link, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(linkRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })
  }

  return (
    <Link
      ref={linkRef}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative text-sm text-gray-400 hover:text-white transition-colors duration-300 py-2 px-1 group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#8B5CF6] group-hover:w-full transition-all duration-300" />
    </Link>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            TR <span className="text-[#8B5CF6]">Productions</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <MagneticNavLink href="/beats">Beats</MagneticNavLink>
            <MagneticNavLink href="/mixing">Mix & Master</MagneticNavLink>
            <MagneticNavLink href="/studio">Studio</MagneticNavLink>
            <MagneticNavLink href="/about">About</MagneticNavLink>
            <MagneticNavLink href="/contact">Contact</MagneticNavLink>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-[#050505] transition-all duration-500 ${
        menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
          {[
            { href: '/beats', label: 'Beats' },
            { href: '/mixing', label: 'Mix & Master' },
            { href: '/studio', label: 'Studio' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-3xl font-semibold text-white hover:text-[#8B5CF6] transition-all duration-300 hover:tracking-wider"
              onClick={() => setMenuOpen(false)}
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease ${i * 0.1}s`
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
