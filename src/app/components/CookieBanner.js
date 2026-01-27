'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      preferences: true,
      timestamp: Date.now()
    }))
    setShowBanner(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      preferences: false,
      timestamp: Date.now()
    }))
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              {/* Icon and Text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🍪</span>
                  <h3 className="font-semibold text-white">Cookie Settings</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We use cookies to ensure the website functions properly and to improve your experience.
                  Necessary cookies are required for basic functionality like the shopping cart.
                  {' '}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-[#8B5CF6] hover:underline inline"
                  >
                    {showDetails ? 'Hide details' : 'Learn more'}
                  </button>
                </p>

                {/* Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white text-sm">Necessary Cookies</span>
                            <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">Always active</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            Required for basic website functionality, including the shopping cart,
                            user authentication, and payment processing. These cannot be disabled.
                          </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white text-sm">Preference Cookies</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            Remember your settings and preferences (like cookie consent choices)
                            to improve your experience on future visits.
                          </p>
                        </div>

                        <p className="text-gray-500 text-xs pt-2">
                          For more information, see our{' '}
                          <a href="/privacy" className="text-[#8B5CF6] hover:underline">Privacy Policy</a>.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={acceptNecessary}
                  className="px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 hover:border-white/50 transition-colors order-2 sm:order-1"
                >
                  Necessary Only
                </button>
                <button
                  onClick={acceptAll}
                  className="px-5 py-2.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium transition-colors order-1 sm:order-2"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
