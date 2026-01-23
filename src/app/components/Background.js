'use client'

import { useState, useEffect } from 'react'

export default function Background() {
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main gradient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] md:w-[800px] lg:w-[1000px] h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] bg-[#8B5CF6] opacity-[0.06] sm:opacity-[0.08] rounded-full animate-glow-pulse"
        style={{ filter: isMobile ? 'blur(60px)' : 'blur(180px)' }}
      />

      {/* Secondary glow - tablet and up */}
      <div
        className="hidden md:block absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.05] rounded-full"
        style={{ filter: 'blur(150px)' }}
      />

      {/* Accent glow - tablet and up */}
      <div
        className="hidden md:block absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#6D28D9] opacity-[0.04] rounded-full"
        style={{ filter: 'blur(120px)' }}
      />

      {/* Grid pattern - tablet and up */}
      <div
        className="hidden md:block absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Sound waves SVG - tablet and up */}
      <svg className="hidden md:block absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none" className="animate-wave"/>
            <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none" className="animate-wave-delayed"/>
            <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="0.5" fill="none" className="animate-wave"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#soundWaves)" />
      </svg>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />

      {/* Noise texture - tablet and up */}
      <div
        className="hidden md:block absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
