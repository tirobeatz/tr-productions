'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TransitionLink({ href, children, className, onClick, ...props }) {
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()

    // Call any additional onClick handler
    if (onClick) onClick(e)

    // Small delay for visual feedback, then navigate
    router.push(href)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
}
