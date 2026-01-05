export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  )
}