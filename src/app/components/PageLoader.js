'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const LoaderContext = createContext({ isLoaded: false, setLoaded: () => {} })

export const useLoader = () => useContext(LoaderContext)

export function PageLoaderProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Check if already visited in this session
    const hasVisited = sessionStorage.getItem('tr-visited')
    if (hasVisited) {
      setIsLoaded(true)
      setShowContent(true)
      return
    }

    // Preload critical resources
    const preloadResources = async () => {
      const startTime = Date.now()

      // Fetch hero image URL from Supabase
      let heroImageUrl = null
      try {
        const { data } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('location', 'homepage-hero')
          .eq('is_active', true)
          .single()

        if (data?.image_url) {
          heroImageUrl = data.image_url
        }
      } catch (e) {
        // No hero image, that's fine
      }

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 80)

      // Minimum load time for smooth animation (at least 800ms)
      const minLoadTime = 800

      // Preload hero image if exists
      if (heroImageUrl) {
        await new Promise((resolve) => {
          const img = new window.Image()
          img.onload = resolve
          img.onerror = resolve
          img.src = heroImageUrl
        })
      }

      // Wait for minimum time
      const elapsed = Date.now() - startTime
      if (elapsed < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed))
      }

      clearInterval(progressInterval)
      setProgress(100)

      // Mark as visited
      sessionStorage.setItem('tr-visited', 'true')

      // Finish loading with smooth transition
      setTimeout(() => {
        setIsLoaded(true)
        setTimeout(() => setShowContent(true), 300)
      }, 200)
    }

    // Start after a small delay to let React mount
    const timer = setTimeout(preloadResources, 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <LoaderContext.Provider value={{ isLoaded, setLoaded: setIsLoaded }}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, ease: 'easeInOut' }
            }}
            className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center"
          >
            {/* Animated logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mb-10"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white"
                >
                  TR
                </motion.span>
                {' '}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#8B5CF6]"
                >
                  Productions
                </motion.span>
              </h1>
            </motion.div>

            {/* Progress bar */}
            <div className="w-48 md:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-xs text-gray-600 tracking-widest uppercase"
            >
              Loading
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content - fades in after loader */}
      <div
        className="transition-opacity duration-300 ease-out"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {children}
      </div>
    </LoaderContext.Provider>
  )
}
