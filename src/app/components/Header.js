'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          TR <span className="text-[#8B5CF6]">Productions</span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/beats" style={{ transition: 'all 0.3s' }} className="text-sm text-gray-400 hover:text-white"
             onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.5)'}
             onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
            Beats
          </a>
          <a href="/mixing" style={{ transition: 'all 0.3s' }} className="text-sm text-gray-400 hover:text-white"
             onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.5)'}
             onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
            Mix & Master
          </a>
          <a href="/studio" style={{ transition: 'all 0.3s' }} className="text-sm text-gray-400 hover:text-white"
             onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.5)'}
             onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
            Studio
          </a>
          <a href="/about" style={{ transition: 'all 0.3s' }} className="text-sm text-gray-400 hover:text-white"
             onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.5)'}
             onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
            About
          </a>
          <a href="/contact" style={{ transition: 'all 0.3s' }} className="text-sm text-gray-400 hover:text-white"
             onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.5)'}
             onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
            Contact
          </a>
        </div>

        {/* CTA Button */}
        <a 
          href="/contact" 
          className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]"
        >
          Book Now
        </a>

      </div>
    </nav>
  )
}