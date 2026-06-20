'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-red-400 mb-4">Oops</h1>
        <h2 className="text-xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-6 py-2.5 rounded-full transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
