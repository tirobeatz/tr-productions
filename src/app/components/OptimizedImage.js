'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * OptimizedImage - A wrapper around Next.js Image component
 * with fallback handling and loading states
 */
export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  fallback = '🎵',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // If no src or error occurred, show fallback
  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-4xl opacity-30">{fallback}</span>
      </div>
    )
  }

  // Check if it's an external URL (Supabase) or local
  const isExternal = src.startsWith('http')

  return (
    <div className={`relative ${className}`} style={!fill ? { width, height } : undefined}>
      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-inherit" />
      )}

      <Image
        src={src}
        alt={alt || 'Image'}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${props.objectFit === 'cover' ? 'object-cover' : ''}`}
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
        // For external images, use unoptimized if not from allowed domains
        unoptimized={isExternal && !src.includes('supabase')}
        {...props}
      />
    </div>
  )
}

/**
 * BeatCover - Specialized image component for beat artwork
 */
export function BeatCover({ src, alt, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-full aspect-square',
    lg: 'w-24 h-24',
  }

  return (
    <div className={`relative overflow-hidden ${sizeClasses[size]} ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={size === 'sm' ? '48px' : size === 'lg' ? '96px' : '(max-width: 768px) 50vw, 25vw'}
      />
    </div>
  )
}

/**
 * ProfileImage - Specialized image component for profile pictures
 */
export function ProfileImage({ src, alt, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
    xl: 200,
  }

  const dimension = sizeMap[size] || size

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className="object-cover rounded-full"
        fallback="👤"
      />
    </div>
  )
}
