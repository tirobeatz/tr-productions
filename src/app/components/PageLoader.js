'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const LoaderContext = createContext({ isLoaded: false, setLoaded: () => {} })

export const useLoader = () => useContext(LoaderContext)

export function PageLoaderProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Skip loading screen for admin pages
    if (pathname?.startsWith('/admin')) {
      setIsLoaded(true)
      setShowContent(true)
      return
    }

    // Check if already visited in this session
    try {
      const hasVisited = sessionStorage.getItem('tr-visited')
      if (hasVisited) {
        setIsLoaded(true)
        setShowContent(true)
        return
      }
    } catch (e) {
      // sessionStorage not available, skip loading screen
      setIsLoaded(true)
      setShowContent(true)
      return
    }

    // Simple timed loading - no Supabase dependency.
    // Kept short on purpose (only shown once per session via tr-visited).
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 30)

    // Complete after ~600ms (full intro stays under ~1s incl. fade-out)
    const timer = setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)

      try {
        sessionStorage.setItem('tr-visited', 'true')
      } catch (e) {}

      setIsLoaded(true)
      setTimeout(() => setShowContent(true), 150)
    }, 600)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [pathname])

  return (
    <LoaderContext.Provider value={{ isLoaded, setLoaded: setIsLoaded }}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-white">TR</span>{' '}
                <span className="text-[#8B5CF6]">Productions</span>
              </h1>
            </motion.div>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className="transition-opacity duration-200"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {children}
      </div>
    </LoaderContext.Provider>
  )
}
