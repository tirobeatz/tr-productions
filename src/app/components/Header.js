'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useT, useLocale } from '@/i18n/I18nProvider'
import { locales } from '@/i18n/config'

// Swap the leading locale segment of the current path, preserving the rest.
function localizePath(pathname, target) {
  const segments = pathname.split('/')
  if (locales.includes(segments[1])) {
    segments[1] = target
    return segments.join('/') || '/'
  }
  return `/${target}${pathname === '/' ? '' : pathname}`
}

// Clean DE/EN toggle that swaps only the locale prefix of the current path.
function LanguageSwitcher({ className = '' }) {
  const pathname = usePathname()
  const locale = useLocale()

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-700">/</span>}
          <Link
            href={localizePath(pathname, l)}
            hrefLang={l}
            aria-current={l === locale ? 'true' : undefined}
            className={`uppercase tracking-wide transition-colors duration-300 ${
              l === locale
                ? 'text-white font-medium'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {l}
          </Link>
        </span>
      ))}
    </div>
  )
}

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
  const t = useT()
  const locale = useLocale()

  // Locale-aware nav targets.
  const navItems = [
    { href: `/${locale}/beats`, label: t('nav.beats') },
    { href: `/${locale}/mixing`, label: t('nav.mixing') },
    { href: `/${locale}/studio`, label: t('nav.studio') },
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ]

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
          <Link href={`/${locale}`} className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            TR <span className="text-[#8B5CF6]">Productions</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <MagneticNavLink key={item.href} href={item.href}>
                {item.label}
              </MagneticNavLink>
            ))}
            <LanguageSwitcher className="ml-2" />
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
          {navItems.map((item, i) => (
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

          {/* Language Switcher (mobile) */}
          <div
            className="mt-4"
            style={{
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.5s ease ${navItems.length * 0.1}s`,
            }}
            onClick={() => setMenuOpen(false)}
          >
            <LanguageSwitcher className="text-lg" />
          </div>
        </div>
      </div>
    </>
  )
}
