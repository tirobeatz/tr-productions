'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Home() {
  const [isMobile, setIsMobile] = useState(true)
  const [featuredBeat, setFeaturedBeat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    fetchBeats()
  }, [])

  const fetchBeats = async () => {
    setLoading(true)
    
    const { data: featured } = await supabase
      .from('beats')
      .select('*')
      .eq('is_sold', false)
      .eq('is_featured', true)
      .limit(1)
      .single()

    if (featured) {
      setFeaturedBeat(featured)
    } else {
      const { data: recent } = await supabase
        .from('beats')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setFeaturedBeat(recent)
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8B5CF6] opacity-[0.07] rounded-full"
          style={{ filter: isMobile ? 'blur(100px)' : 'blur(180px)' }}
        />
        
        {!isMobile && (
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
                <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#soundWaves)" />
          </svg>
        )}
      </div>

      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

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
          
          {/* Show loading state */}
          <p className="mt-8 text-gray-600 text-sm">
            {loading ? 'Loading beat...' : featuredBeat ? `Featured: ${featuredBeat.title}` : 'No beats'}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}