'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer 
      className="border-t border-white/5 py-16 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xl font-bold tracking-tight">
              TR <span className="text-[#8B5CF6]">Productions</span>
            </p>
            <p className="text-gray-600 text-sm">Trier, Germany</p>
          </div>
          <div className="flex gap-8 text-gray-500 text-sm">
            <a href="/beats" className="hover:text-white transition">Beats</a>
            <a href="/mixing" className="hover:text-white transition">Mix & Master</a>
            <a href="/studio" className="hover:text-white transition">Studio</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 TR Productions</p>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/tr.productionz/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition text-sm">Instagram</a>
            <a href="https://www.youtube.com/@trproductionz" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition text-sm">YouTube</a>
            <a href="https://www.tiktok.com/@trproductions" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition text-sm">TikTok</a>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}