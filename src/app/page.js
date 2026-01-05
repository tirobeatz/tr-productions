'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8B5CF6] opacity-[0.07] rounded-full"
          style={{ filter: isMobile ? 'blur(100px)' : 'blur(180px)' }}
        />
      </div>

      <Header />
      
      <section className="relative flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-6 tracking-[0.3em] uppercase text-xs">
            Music Producer
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            TR <span className="text-[#8B5CF6]">Productions</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Industry ready sound crafted to stand out.
          </p>
          <a href="/beats" className="bg-[#8B5CF6] px-8 py-4 rounded-full font-semibold">
            Browse Beats
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}