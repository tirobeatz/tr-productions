'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LoaderContext = createContext({ isLoaded: false, setLoaded: () => {} })

export const useLoader = () => useContext(LoaderContext)

export function PageLoaderProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
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

    // Simple loading animation without Supabase dependency
    const loadSite = async () => {
      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + Math.random() * 15
        })
      }, 100)

      // Wait minimum time for nice animation
      await new Promise(resolve => setTimeout(resolve, 800))

      clearInterval(progressInterval)
      setProgress(100)

      // Mark as visited
      try {
        sessionStorage.setItem('tr-visited', 'true')
      } catch (e) {
        // Ignore sessionStorage errors
      }

      // Finish loading
      setTimeout(() => {
        setIsLoaded(true)
        setTimeout(() => setShowContent(true), 200)
      }, 150)
    }

    loadSite()
  }, [])

  return (
    <LoaderContext.Provider value={{ isLoaded, setLoaded: setIsLoaded }}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
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
