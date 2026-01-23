'use client'

import { motion, AnimatePresence } from 'framer-motion'

// Modal Component
export function Modal({ show, onClose, title, children }) {
  if (!show) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 pt-16 md:pt-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-[#0a0a0a] flex items-center justify-between p-4 md:p-6 border-b border-white/10 z-10">
            <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 text-lg">✕</button>
          </div>
          <div className="p-4 md:p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Input Component
export function Input({ label, required, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}{required && ' *'}</label>}
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
      />
    </div>
  )
}

// Textarea Component
export function Textarea({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>}
      <textarea
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
      />
    </div>
  )
}

// Select Component
export function Select({ label, options, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>}
      <select
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

// File Upload Component
export function FileUpload({ label, type, uploading, preview, onUpload }) {
  const accept = type === 'audio' ? 'audio/*' : 'image/*'
  const icon = type === 'audio' ? '🔊' : '🖼️'

  return (
    <div>
      {label && <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>}
      <div className="border-2 border-dashed border-white/10 rounded-xl p-4 md:p-6 text-center hover:border-[#8B5CF6]/30 transition cursor-pointer relative">
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-xs md:text-sm">Uploading...</span>
          </div>
        ) : preview ? (
          <div className="flex items-center justify-center gap-2 text-green-400 text-xs md:text-sm">
            <span>✓</span>
            <span>{type === 'audio' ? 'Audio uploaded' : 'Image uploaded'}</span>
          </div>
        ) : (
          <>
            <span className="text-2xl md:text-3xl block mb-2">{icon}</span>
            <span className="text-gray-500 text-xs md:text-sm">Click to upload</span>
          </>
        )}
        <input
          type="file"
          accept={accept}
          onChange={e => onUpload(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

// Empty State Component
export function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-12 md:py-16">
      <span className="text-4xl md:text-5xl block mb-3 md:mb-4">{icon}</span>
      <p className="text-gray-500 text-sm md:text-base">{text}</p>
    </div>
  )
}

// Status Badge Component
export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <span className={`px-2 md:px-3 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status?.replace('_', ' ').charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || 'Unknown'}
    </span>
  )
}

// Card Component
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 ${className}`}>
      {children}
    </div>
  )
}

// Button Component
export function Button({ children, variant = 'primary', size = 'md', disabled, className = '', ...props }) {
  const variants = {
    primary: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
    ghost: 'hover:bg-white/10 text-gray-400 hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm rounded-lg md:rounded-xl',
    lg: 'px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-xl',
  }

  return (
    <button
      {...props}
      disabled={disabled}
      className={`font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
