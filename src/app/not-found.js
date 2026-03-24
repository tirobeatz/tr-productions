import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-[#8B5CF6] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/beats"
            className="bg-white/5 hover:bg-white/10 text-gray-300 font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            Browse Beats
          </Link>
        </div>
      </div>
    </div>
  )
}
