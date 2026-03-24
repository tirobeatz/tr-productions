'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { compressImage } from '../../lib/imageUtils'
import {
  getUser, isAdmin, getAdminProfile, signIn, signOut,
  getAllAdmins, createAdmin, deactivateAdmin,
  reactivateAdmin, linkUserToAdmin, onAuthStateChange
} from '../../lib/auth'
import AboutContentManager from './AboutContentManager'
import ReleasesManager from './components/ReleasesManager'

export default function AdminPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [authState, setAuthState] = useState('loading') // Start with loading to check session
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('beats')
  const [loading, setLoading] = useState(false)

  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [beats, setBeats] = useState([])
  const [bookings, setBookings] = useState([])
  const [mixRequests, setMixRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [availability, setAvailability] = useState([])
  const [mixDemos, setMixDemos] = useState([])
  const [recentMixes, setRecentMixes] = useState([])
  const [siteImages, setSiteImages] = useState([])
  const [admins, setAdmins] = useState([])
  const [releases, setReleases] = useState([])
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)

    // Check session immediately on mount
    checkAuth()

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      // Auth state change detected
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only check auth if we don't already have a valid session
        if (authState !== 'authenticated') {
          await checkAuth()
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState('login')
        setCurrentAdmin(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [authState])

  const checkAuth = async () => {
    try {
      // Quick timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )

      const authPromise = (async () => {
        const user = await getUser()
        if (!user) return { status: 'login' }

        // Try to get admin profile directly (simpler check)
        const { data: profile, error } = await supabase
          .from('admins').select('*').eq('user_id', user.id).eq('is_active', true).single()

        if (error || !profile) {
          // Maybe user_id not linked yet, try to link by email
          const { data: linkedProfile } = await supabase
            .from('admins').update({ user_id: user.id }).eq('email', user.email).is('user_id', null).select().single()

          if (linkedProfile) {
            return { status: 'authenticated', profile: linkedProfile }
          }

          // No admin access
          await signOut()
          return { status: 'login', error: 'You do not have admin access.' }
        }

        // Update last login (fire and forget)
        supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', profile.id)

        return { status: 'authenticated', profile }
      })()

      const result = await Promise.race([authPromise, timeoutPromise])

      if (result.error) setAuthError(result.error)
      if (result.profile) setCurrentAdmin(result.profile)
      setAuthState(result.status)

    } catch (err) {
      console.error('Auth check error:', err)
      // On timeout or error, show login form (don't get stuck)
      setAuthState('login')
    }
  }

  useEffect(() => { if (authState === 'authenticated') fetchAllData() }, [authState])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const { error, user } = await signIn(authForm.email, authForm.password)
      if (error) { setAuthError(error); setAuthLoading(false); return }

      // After successful sign in, check admin status
      // The onAuthStateChange will fire, but we also do an immediate check
      await checkAuth()
    } catch (err) {
      setAuthError('Login failed. Please try again.')
      setAuthLoading(false)
    }
    setAuthLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: { data: { name: authForm.name } }
    })
    
    if (error) { setAuthError(error.message); setAuthLoading(false); return }
    
    if (data.user) {
      const { admin } = await linkUserToAdmin(data.user.id, authForm.email)
      if (!admin) {
        setAuthError('No admin record found for this email. Ask an owner to add you first.')
        await signOut()
        setAuthLoading(false)
        return
      }
    }
    
    setAuthLoading(false)
  }

  const handleLogout = async () => { await signOut(); setAuthState('login'); setCurrentAdmin(null) }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [b, bk, mx, msg, av, md, rm, si, ad, rel, test] = await Promise.all([
        supabase.from('beats').select('*').order('created_at', { ascending: false }),
        supabase.from('studio_bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('mix_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('studio_availability').select('*').order('date', { ascending: true }),
        supabase.from('mix_demos').select('*').order('created_at', { ascending: false }),
        supabase.from('recent_mixes').select('*').order('created_at', { ascending: false }),
        supabase.from('site_images').select('*').order('created_at', { ascending: false }),
        getAllAdmins(),
        supabase.from('releases').select('*').order('display_order', { ascending: true }),
        supabase.from('testimonials').select('*').order('display_order', { ascending: true })
      ])
      setBeats(b.data || []); setBookings(bk.data || []); setMixRequests(mx.data || [])
      setMessages(msg.data || []); setAvailability(av.data || []); setMixDemos(md.data || [])
      setRecentMixes(rm.data || []); setSiteImages(si.data || []); setAdmins(ad.admins || [])
      setReleases(rel.data || []); setTestimonials(test.data || [])
    } catch (err) {
      console.error('Fetch data error:', err)
    }
    setLoading(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (p) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p || 0)

  // Check for password reset token in URL - MUST be before any returns
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    if (type === 'recovery') {
      setAuthState('reset-password')
    }
  }, [])

  // Keep session alive by refreshing periodically when authenticated
  useEffect(() => {
    if (authState !== 'authenticated') return

    const refreshSession = async () => {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error)
        // If refresh fails, user needs to re-login
        setAuthState('login')
        setCurrentAdmin(null)
      }
    }

    // Refresh session every 10 minutes to keep it alive
    const interval = setInterval(refreshSession, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [authState])

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!authForm.email) { setAuthError('Enter your email address'); return }
    setAuthLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.resetPasswordForEmail(authForm.email, {
      redirectTo: `${window.location.origin}/admin`
    })
    
    if (error) { setAuthError(error.message); setAuthLoading(false); return }
    
    setAuthSuccess('Password reset email sent! Check your inbox.')
    setAuthLoading(false)
  }

  // Handle password update (when user clicks reset link)
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (authForm.password.length < 6) { setAuthError('Password must be at least 6 characters'); return }
    setAuthLoading(true)
    setAuthError('')
    
    const { error } = await supabase.auth.updateUser({ password: authForm.password })
    
    if (error) { setAuthError(error.message); setAuthLoading(false); return }
    
    setAuthSuccess('Password updated successfully!')
    setTimeout(() => { setAuthState('login'); setAuthSuccess('') }, 2000)
    setAuthLoading(false)
  }

  // Loading state - checking session
  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Checking session...</p>
        </div>
      </main>
    )
  }

  // Login/Signup/Forgot Password
  if (authState === 'login' || authState === 'signup' || authState === 'forgot' || authState === 'reset-password') {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#8B5CF6] opacity-[0.08] rounded-full" style={{ filter: isMobile ? 'blur(80px)' : 'blur(180px)' }} />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-3xl md:text-4xl block mb-3">
              {authState === 'forgot' ? '📧' : authState === 'reset-password' ? '🔑' : '🔐'}
            </span>
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              {authState === 'login' ? 'Admin Login' : 
               authState === 'signup' ? 'Create Account' : 
               authState === 'forgot' ? 'Reset Password' :
               'Set New Password'}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              {authState === 'login' ? 'Sign in to access the dashboard' : 
               authState === 'signup' ? 'Sign up with your admin email' :
               authState === 'forgot' ? 'Enter your email to receive a reset link' :
               'Enter your new password'}
            </p>
          </div>

          {authError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">{authError}</div>}
          {authSuccess && <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-green-400 text-sm">{authSuccess}</div>}

          {/* Forgot Password Form */}
          {authState === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="admin@example.com" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {authLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Reset Password Form (after clicking email link) */}
          {authState === 'reset-password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" required minLength={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {authLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          )}

          {/* Login Form */}
          {authState === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="admin@example.com" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" required minLength={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {authLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</> : 'Sign In'}
              </button>
              <button type="button" onClick={() => { setAuthState('forgot'); setAuthError(''); setAuthSuccess('') }} className="w-full text-gray-500 hover:text-white text-sm transition py-2">
                Forgot password?
              </button>
            </form>
          )}

          {/* Signup Form */}
          {authState === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Name</label>
                <input type="text" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Your name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="admin@example.com" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Password</label>
                <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" required minLength={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {authLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</> : 'Create Account'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            {(authState === 'forgot' || authState === 'reset-password') ? (
              <button onClick={() => { setAuthState('login'); setAuthError(''); setAuthSuccess('') }} className="text-gray-400 hover:text-white text-sm transition">
                ← Back to login
              </button>
            ) : (
              <button onClick={() => { setAuthState(authState === 'login' ? 'signup' : 'login'); setAuthError(''); setAuthSuccess('') }} className="text-gray-400 hover:text-white text-sm transition">
                {authState === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
          </div>
          <p className="text-center text-gray-600 text-xs mt-6"><a href="/" className="hover:text-white transition">← Back to site</a></p>
        </motion.div>
      </main>
    )
  }

  // Dashboard
  const tabs = [
    { id: 'beats', label: 'Beats', icon: '🎵', count: beats.length },
    { id: 'releases', label: 'Releases', icon: '💽', count: releases.length },
    { id: 'availability', label: 'Calendar', icon: '📅', count: null },
    { id: 'bookings', label: 'Bookings', icon: '🎤', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'mixing', label: 'Mix', icon: '🎚️', count: mixRequests.filter(m => m.status === 'pending').length },
    { id: 'mixdemo', label: 'Demo', icon: '🔊', count: null },
    { id: 'recentmixes', label: 'Portfolio', icon: '💿', count: null },
    { id: 'testimonials', label: 'Reviews', icon: '⭐', count: testimonials.length },
    { id: 'images', label: 'Images', icon: '🖼️', count: null },
    { id: 'about', label: 'About', icon: '📝', count: null },
    { id: 'messages', label: 'Messages', icon: '💬', count: messages.filter(m => !m.is_read).length },
    ...(currentAdmin?.role === 'owner' ? [{ id: 'admins', label: 'Admins', icon: '👥', count: admins.filter(a => a.is_active).length }] : [])
  ]

  const stats = [
    { label: 'Total Beats', value: beats.length, color: 'text-white' },
    { label: 'Available', value: beats.filter(b => !b.is_sold).length, color: 'text-green-500' },
    { label: 'Bookings', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-500' },
    { label: 'Mix Req.', value: mixRequests.filter(m => m.status === 'pending').length, color: 'text-blue-500' },
    { label: 'Messages', value: messages.filter(m => !m.is_read).length, color: 'text-purple-500' },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[400px] md:h-[600px] bg-[#8B5CF6] opacity-[0.06] rounded-full" style={{ filter: isMobile ? 'blur(80px)' : 'blur(180px)' }} />
      </div>

      {/* Header */}
      <header className="bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <a href="/" className="text-lg md:text-xl font-bold">TR <span className="text-[#8B5CF6]">Admin</span></a>
            {currentAdmin && <span className="hidden md:inline text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full capitalize">{currentAdmin.role}</span>}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {currentAdmin && <div className="hidden md:flex items-center gap-2 text-sm text-gray-400"><span className="w-2 h-2 bg-green-500 rounded-full" />{currentAdmin.name}</div>}
            <button onClick={fetchAllData} className="text-gray-400 hover:text-white transition text-xs md:text-sm flex items-center gap-1">🔄 <span className="hidden sm:inline">Refresh</span></button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition text-xs md:text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 relative">
        {/* Stats - Horizontal scroll on mobile */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {stats.map(s => (
            <div key={s.label} className="flex-shrink-0 bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 min-w-[100px] md:min-w-0 md:flex-1">
              <p className="text-gray-500 text-[10px] md:text-sm mb-0.5 md:mb-1">{s.label}</p>
              <p className={`text-xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition whitespace-nowrap text-xs md:text-sm ${activeTab === tab.id ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <>
            {activeTab === 'beats' && <BeatsManager beats={beats} onRefresh={fetchAllData} formatPrice={formatPrice} isMobile={isMobile} />}
            {activeTab === 'releases' && <ReleasesManager releases={releases} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'availability' && <AvailabilityManager availability={availability} bookings={bookings} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'bookings' && <BookingsManager bookings={bookings} onRefresh={fetchAllData} formatPrice={formatPrice} formatDate={formatDate} />}
            {activeTab === 'mixing' && <MixRequestsManager requests={mixRequests} onRefresh={fetchAllData} formatPrice={formatPrice} formatDate={formatDate} />}
            {activeTab === 'mixdemo' && <MixDemoManager demos={mixDemos} onRefresh={fetchAllData} />}
            {activeTab === 'recentmixes' && <RecentMixesManager mixes={recentMixes} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'testimonials' && <TestimonialsManager testimonials={testimonials} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'images' && <SiteImagesManager images={siteImages} onRefresh={fetchAllData} />}
            {activeTab === 'about' && <AboutContentManager onRefresh={fetchAllData} />}
            {activeTab === 'messages' && <MessagesManager messages={messages} onRefresh={fetchAllData} formatDate={formatDate} />}
            {activeTab === 'admins' && currentAdmin?.role === 'owner' && <AdminsManager admins={admins} currentAdmin={currentAdmin} onRefresh={fetchAllData} formatDate={formatDate} />}
          </>
        )}
      </div>
    </main>
  )
}

// ============ SHARED COMPONENTS ============
const Modal = ({ show, onClose, title, children }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{title}</h2>
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label} {required && '*'}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
  </div>
)

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>
    <select {...props} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm">
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
)

const FileUpload = ({ label, onUpload, onDelete, uploading, preview, type = 'image' }) => {
  const ref = useRef(null)
  const accept = type === 'image' ? 'image/*' : type === 'file' ? '.zip,.rar,.7z' : '.mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*'
  const icon = type === 'image' ? '🖼️' : type === 'file' ? '📁' : '🎵'

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete && confirm('Delete this file?')) {
      onDelete()
    }
  }

  return (
    <div>
      {label && <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>}
      <input ref={ref} type="file" accept={accept} onChange={e => onUpload(e.target.files?.[0])} className="hidden" />
      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${preview ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
        {uploading ? <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          : preview ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => ref.current?.click()}>
                {type === 'image' && <img src={preview} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                {type !== 'image' && <span className="text-xl">🎵</span>}
                <div className="text-left">
                  <p className="text-green-400 text-sm">✓ Uploaded</p>
                  <p className="text-gray-500 text-xs">Click to replace</p>
                </div>
              </div>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition flex-shrink-0"
                  title="Delete file"
                >
                  🗑️
                </button>
              )}
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => ref.current?.click()}>
              <span className="text-xl md:text-2xl block mb-1">{icon}</span>
              <p className="text-gray-400 text-xs md:text-sm">Upload {type}</p>
            </div>
          )}
      </div>
    </div>
  )
}

const StatusBadge = ({ status, type = 'booking' }) => {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-blue-500/20 text-blue-400'
  }
  return <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${colors[status] || 'bg-white/10'}`}>{status}</span>
}

const EmptyState = ({ icon, text }) => (
  <div className="text-center py-12 md:py-16 text-gray-500">
    <span className="text-4xl md:text-5xl block mb-3 md:mb-4">{icon}</span>
    <p className="text-sm md:text-base">{text}</p>
  </div>
)

// ============ BEATS MANAGER ============
function BeatsManager({ beats, onRefresh, formatPrice, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingBeat, setEditingBeat] = useState(null)
  const [formData, setFormData] = useState({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: null, price_wav: null, price_stems: null, price_exclusive: null, is_featured: false, is_sold: false, audio_url: '', image_url: '', mp3_url: '', wav_url: '', stems_url: '' })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingTaggedAudio, setUploadingTaggedAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMp3, setUploadingMp3] = useState(false)
  const [uploadingWav, setUploadingWav] = useState(false)
  const [uploadingStems, setUploadingStems] = useState(false)

  const genres = ['Trap', 'Drill', 'R&B', 'Jersey', 'Rap', 'Pop', 'Afrobeat']
  const keys = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm', 'Bb', 'Eb', 'Ab']

  const openAdd = () => { setEditingBeat(null); setFormData({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: null, price_wav: null, price_stems: null, price_exclusive: null, is_featured: false, is_sold: false, audio_url: '', image_url: '', mp3_url: '', wav_url: '', stems_url: '' }); setShowModal(true) }
  const openEdit = (b) => { setEditingBeat(b); setFormData({ title: b.title || '', genre: b.genre || 'Trap', bpm: b.bpm || 140, key: b.key || 'Cm', tags: b.tags || [], price_mp3: b.price_mp3 ?? null, price_wav: b.price_wav ?? null, price_stems: b.price_stems ?? null, price_exclusive: b.price_exclusive ?? null, is_featured: b.is_featured || false, is_sold: b.is_sold || false, audio_url: b.audio_url || '', image_url: b.image_url || '', mp3_url: b.mp3_url || '', wav_url: b.wav_url || '', stems_url: b.stems_url || '' }); setShowModal(true) }

  const addTag = () => { if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) { setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] }); setTagInput('') } }
  const removeTag = (t) => setFormData({ ...formData, tags: formData.tags.filter(x => x !== t) })

  const hasFile = (url) => url && url.trim() !== ''

  const uploadFile = async (file, bucket, setUploading, field) => {
    if (!file) return
    setUploading(true)
    try {
      // Compress images before upload, keep audio files as-is
      let fileToUpload = file
      let ext = file.name.split('.').pop()
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, 1920, 0.85)
        ext = 'jpg'
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(fileName, fileToUpload)
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      setFormData(f => ({ ...f, [field]: data.publicUrl }))
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(false)
  }

  const deleteFile = (field) => {
    setFormData(f => ({ ...f, [field]: '' }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { alert('Enter title'); return }
    setSaving(true)
    const { error } = editingBeat
      ? await supabase.from('beats').update(formData).eq('id', editingBeat.id)
      : await supabase.from('beats').insert([formData])
    if (error) alert('Error: ' + error.message)
    else { setShowModal(false); onRefresh() }
    setSaving(false)
  }

  const handleDelete = async (b) => { if (!confirm(`Delete "${b.title}"?`)) return; await supabase.from('beats').delete().eq('id', b.id); onRefresh() }
  const toggle = async (b, field) => { await supabase.from('beats').update({ [field]: !b[field] }).eq('id', b.id); onRefresh() }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold">Manage Beats</h2>
        <button onClick={openAdd} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition text-xs md:text-sm flex items-center gap-2">+ Add</button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {beats.map(b => (
            <div key={b.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {b.image_url ? <img src={b.image_url} alt="" className="w-full h-full object-cover" /> : <span>🎵</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.genre} • {b.bpm} BPM • {b.key}</p>
                </div>
                <p className="font-bold text-sm">{b.price_mp3 != null ? formatPrice(b.price_mp3) : <span className="text-gray-500">—</span>}</p>
              </div>
              {/* File status indicators */}
              <div className="flex gap-1 mb-3 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.audio_url) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {hasFile(b.audio_url) ? '✓' : '✗'} Preview
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.mp3_url) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {hasFile(b.mp3_url) ? '✓' : '✗'} MP3
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.wav_url) ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {hasFile(b.wav_url) ? '✓' : '○'} WAV
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.stems_url) ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {hasFile(b.stems_url) ? '✓' : '○'} Stems
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => toggle(b, 'is_featured')} className={`text-xs px-2 py-1 rounded-full ${b.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500'}`}>{b.is_featured ? '★' : '☆'}</button>
                  <button onClick={() => toggle(b, 'is_sold')} className={`text-xs px-2 py-1 rounded-full ${b.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{b.is_sold ? 'Sold' : 'Available'}</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="p-2 text-gray-400">✏️</button>
                  <button onClick={() => handleDelete(b)} className="p-2 text-gray-400">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  {['Beat', 'Genre', 'BPM', 'Key', 'Price', 'Files', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-sm font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {beats.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden">
                          {b.image_url ? <img src={b.image_url} alt="" className="w-full h-full object-cover" /> : <span>🎵</span>}
                        </div>
                        <div>
                          <p className="font-medium">{b.title}</p>
                          <p className="text-xs text-gray-500">{b.tags?.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{b.genre}</td>
                    <td className="px-6 py-4 text-sm">{b.bpm}</td>
                    <td className="px-6 py-4 text-sm">{b.key}</td>
                    <td className="px-6 py-4 text-sm">{b.price_mp3 != null ? formatPrice(b.price_mp3) : <span className="text-gray-500">—</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.audio_url) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`} title="Tagged Preview">🔊</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.mp3_url) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`} title="Untagged MP3">MP3</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.wav_url) ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`} title="WAV">WAV</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasFile(b.stems_url) ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`} title="Stems">STM</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(b, 'is_featured')} className={`text-xs px-2 py-1 rounded-full transition ${b.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{b.is_featured ? '★ Featured' : '☆'}</button>
                        <button onClick={() => toggle(b, 'is_sold')} className={`text-xs px-2 py-1 rounded-full transition ${b.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{b.is_sold ? 'Sold' : 'Available'}</button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-white p-2">✏️</button>
                        <button onClick={() => handleDelete(b)} className="text-gray-400 hover:text-red-400 p-2">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {beats.length === 0 && <EmptyState icon="🎵" text="No beats yet. Click Add to create one." />}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingBeat ? 'Edit Beat' : 'Add New Beat'}>
        <div className="space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Beat title" />
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Select label="Genre" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} options={genres} />
            <Input label="BPM" type="number" value={formData.bpm} onChange={e => setFormData({ ...formData, bpm: parseInt(e.target.value) || 0 })} />
            <Select label="Key" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} options={keys} />
          </div>

          {/* Cover Image */}
          <FileUpload label="Cover Image" type="image" uploading={uploadingImage} preview={formData.image_url} onUpload={f => uploadFile(f, 'images', setUploadingImage, 'image_url')} onDelete={() => deleteFile('image_url')} />

          {/* Audio Files Section */}
          <div className="border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">🎵 Audio Files</h3>
            <div className="space-y-4">
              {/* Tagged Preview */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Tagged Preview <span className="text-gray-600">(plays on website with voice tag)</span></label>
                <FileUpload type="audio" uploading={uploadingTaggedAudio} preview={formData.audio_url} onUpload={f => uploadFile(f, 'beats-tagged', setUploadingTaggedAudio, 'audio_url')} onDelete={() => deleteFile('audio_url')} />
              </div>
              {/* Untagged MP3 */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Untagged MP3 <span className="text-gray-600">(customer downloads this)</span></label>
                <FileUpload type="audio" uploading={uploadingMp3} preview={formData.mp3_url} onUpload={f => uploadFile(f, 'beats-mp3', setUploadingMp3, 'mp3_url')} onDelete={() => deleteFile('mp3_url')} />
              </div>
              {/* WAV */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">WAV File <span className="text-gray-600">(for WAV/Unlimited/Exclusive)</span></label>
                <FileUpload type="audio" uploading={uploadingWav} preview={formData.wav_url} onUpload={f => uploadFile(f, 'beats-wav', setUploadingWav, 'wav_url')} onDelete={() => deleteFile('wav_url')} />
              </div>
              {/* Stems */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Stems ZIP <span className="text-gray-600">(for Unlimited/Exclusive only)</span></label>
                <FileUpload type="file" uploading={uploadingStems} preview={formData.stems_url} onUpload={f => uploadFile(f, 'beats-stems', setUploadingStems, 'stems_url')} onDelete={() => deleteFile('stems_url')} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">{formData.tags.map(t => <span key={t} className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 md:px-3 py-1 rounded-full text-xs flex items-center gap-1 md:gap-2">#{t}<button onClick={() => removeTag(t)}>×</button></span>)}</div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm" placeholder="Add tag..." />
              <button onClick={addTag} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">License Prices (EUR) <span className="text-gray-600">- leave empty to disable license</span></label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {[['MP3', 'price_mp3'], ['WAV', 'price_wav'], ['Stems', 'price_stems'], ['Exclusive', 'price_exclusive']].map(([l, k]) => (
                <div key={k} className={`p-2 rounded-lg ${formData[k] != null && formData[k] !== '' ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/10'}`}>
                  <p className={`text-[10px] md:text-xs mb-1 ${formData[k] != null && formData[k] !== '' ? 'text-green-400' : 'text-gray-500'}`}>{l} {formData[k] != null && formData[k] !== '' ? '✓' : '(disabled)'}</p>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="—"
                    value={formData[k] ?? ''}
                    onChange={e => {
                      const val = e.target.value
                      setFormData({ ...formData, [k]: val === '' ? null : parseFloat(val) })
                    }}
                    className="w-full bg-transparent border-0 px-0 py-1 text-sm focus:outline-none focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded" />Featured</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={formData.is_sold} onChange={e => setFormData({ ...formData, is_sold: e.target.checked })} className="w-4 h-4 rounded" />Sold</label>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 md:py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 md:py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50 text-sm">{saving ? 'Saving...' : (editingBeat ? 'Update' : 'Add Beat')}</button>
        </div>
      </Modal>
    </div>
  )
}

// ============ AVAILABILITY MANAGER ============
function AvailabilityManager({ availability, bookings, onRefresh, isMobile }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHours, setSelectedHours] = useState([])
  const [isFullyBlocked, setIsFullyBlocked] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [scheduleTab, setScheduleTab] = useState('weekly') // 'weekly' or 'overrides'

  // Weekly schedule state
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i) // 0-23
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 10) // 10-22 for override blocking
  const [weeklySchedule, setWeeklySchedule] = useState(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_open: i >= 1 && i <= 6,
      open_hour: 10,
      close_hour: 22,
      break_start: null,
      break_end: null,
    }))
  )
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleLoaded, setScheduleLoaded] = useState(false)

  // Load weekly schedule on mount
  useEffect(() => {
    fetch('/api/studio-schedule').then(r => r.json()).then(data => {
      if (data.schedule) setWeeklySchedule(data.schedule)
      setScheduleLoaded(true)
    }).catch(() => setScheduleLoaded(true))
  }, [])

  const updateDay = (dayIndex, field, value) => {
    setWeeklySchedule(prev => prev.map(d =>
      d.day_of_week === dayIndex ? { ...d, [field]: value } : d
    ))
  }

  const saveWeeklySchedule = async () => {
    setScheduleSaving(true)
    try {
      const res = await fetch('/api/studio-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: weeklySchedule })
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch (e) { alert('Failed to save schedule') }
    setScheduleSaving(false)
  }

  // Date override logic (existing)
  const getDays = (date) => {
    const y = date.getFullYear(), m = date.getMonth()
    const first = new Date(y, m, 1), last = new Date(y, m + 1, 0)
    const days = []
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let i = 1; i <= last.getDate(); i++) days.push(new Date(y, m, i))
    return days
  }

  const dateKey = (d) => d.toISOString().split('T')[0]
  const getAvail = (d) => availability.find(a => a.date === dateKey(d))
  const getBookings = (d) => bookings.filter(b => b.date === dateKey(d) && b.status !== 'cancelled')

  const handleDateClick = (d) => {
    if (!d || d < new Date().setHours(0, 0, 0, 0)) return
    setSelectedDate(d)
    const a = getAvail(d)
    if (a) { setSelectedHours(a.blocked_hours || []); setIsFullyBlocked(a.is_fully_blocked || false); setNote(a.note || '') }
    else { setSelectedHours([]); setIsFullyBlocked(false); setNote('') }
  }

  const toggleHour = (h) => setSelectedHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h])

  const handleSave = async () => {
    if (!selectedDate) return
    setSaving(true)
    const dk = dateKey(selectedDate), a = getAvail(selectedDate)
    if (a) await supabase.from('studio_availability').update({ blocked_hours: selectedHours, is_fully_blocked: isFullyBlocked, note }).eq('id', a.id)
    else await supabase.from('studio_availability').insert([{ date: dk, blocked_hours: selectedHours, is_fully_blocked: isFullyBlocked, note }])
    setSaving(false); onRefresh()
  }

  const handleClear = async () => {
    if (!selectedDate) return
    const a = getAvail(selectedDate)
    if (!a || !confirm('Clear override for this date?')) return
    await supabase.from('studio_availability').delete().eq('id', a.id)
    setSelectedHours([]); setIsFullyBlocked(false); setNote(''); onRefresh()
  }

  const days = getDays(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Studio Availability</h2>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setScheduleTab('weekly')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${scheduleTab === 'weekly' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          Weekly Schedule
        </button>
        <button onClick={() => setScheduleTab('overrides')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${scheduleTab === 'overrides' ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          Date Overrides
        </button>
      </div>

      {/* Weekly Schedule Tab */}
      {scheduleTab === 'weekly' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
          <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">Set your default weekly hours. These apply every week unless you add a date override.</p>
          <div className="space-y-3">
            {weeklySchedule.map(day => (
              <div key={day.day_of_week} className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-3 md:p-4 rounded-xl border transition ${day.is_open ? 'bg-white/[0.03] border-white/10' : 'bg-white/[0.01] border-white/5 opacity-60'}`}>
                {/* Day name + toggle */}
                <div className="flex items-center gap-3 md:w-40">
                  <button onClick={() => updateDay(day.day_of_week, 'is_open', !day.is_open)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${day.is_open ? 'bg-[#8B5CF6]' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${day.is_open ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <span className={`font-medium text-sm ${day.is_open ? 'text-white' : 'text-gray-500'}`}>
                    {isMobile ? DAY_SHORT[day.day_of_week] : DAY_NAMES[day.day_of_week]}
                  </span>
                </div>

                {day.is_open && (
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {/* Open/Close */}
                    <div className="flex items-center gap-1.5">
                      <select value={day.open_hour} onChange={e => updateDay(day.day_of_week, 'open_hour', parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50">
                        {ALL_HOURS.filter(h => h < (day.close_hour || 24)).map(h => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                      <span className="text-gray-500 text-sm">to</span>
                      <select value={day.close_hour} onChange={e => updateDay(day.day_of_week, 'close_hour', parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50">
                        {ALL_HOURS.filter(h => h > (day.open_hour || 0)).map(h => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>

                    {/* Break */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 text-xs">Break:</span>
                      <select value={day.break_start ?? ''} onChange={e => {
                        const v = e.target.value === '' ? null : parseInt(e.target.value)
                        updateDay(day.day_of_week, 'break_start', v)
                        if (v === null) updateDay(day.day_of_week, 'break_end', null)
                        else if (!day.break_end || day.break_end <= v) updateDay(day.day_of_week, 'break_end', v + 1)
                      }}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50">
                        <option value="">None</option>
                        {ALL_HOURS.filter(h => h >= day.open_hour && h < day.close_hour).map(h => (
                          <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                      {day.break_start != null && (
                        <>
                          <span className="text-gray-500 text-xs">to</span>
                          <select value={day.break_end ?? ''} onChange={e => updateDay(day.day_of_week, 'break_end', e.target.value === '' ? null : parseInt(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50">
                            {ALL_HOURS.filter(h => h > day.break_start && h <= day.close_hour).map(h => (
                              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!day.is_open && <span className="text-gray-600 text-xs md:text-sm">Closed</span>}
              </div>
            ))}
          </div>
          <button onClick={saveWeeklySchedule} disabled={scheduleSaving}
            className="mt-6 w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
            {scheduleSaving ? 'Saving...' : 'Save Weekly Schedule'}
          </button>
        </div>
      )}

      {/* Date Overrides Tab */}
      {scheduleTab === 'overrides' && (
        <>
          <p className="text-gray-400 text-xs md:text-sm mb-4">Override specific dates (holidays, special events). These take priority over your weekly schedule.</p>
          <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
            {/* Calendar */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-white/10 rounded-lg">←</button>
                <h3 className="font-semibold text-sm md:text-lg">{monthName}</h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-white/10 rounded-lg">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-[10px] md:text-xs text-gray-500 py-1 md:py-2">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  if (!d) return <div key={i} className="aspect-square" />
                  const isPast = d < new Date().setHours(0, 0, 0, 0)
                  const isSel = selectedDate && dateKey(d) === dateKey(selectedDate)
                  const a = getAvail(d), hasBook = getBookings(d).length > 0
                  const blocked = a?.is_fully_blocked, partial = a?.blocked_hours?.length > 0
                  return (
                    <button key={i} onClick={() => handleDateClick(d)} disabled={isPast} className={`aspect-square rounded-lg text-xs md:text-sm font-medium transition relative ${isPast ? 'text-gray-700 cursor-not-allowed' : isSel ? 'bg-[#8B5CF6] text-white' : blocked ? 'bg-red-500/20 text-red-400' : partial ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}>
                      {d.getDate()}
                      {hasBook && <span className="absolute bottom-0.5 md:bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full" />}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-3 md:gap-4 mt-4 md:mt-6 text-[10px] md:text-xs text-gray-500">
                <div className="flex items-center gap-1.5 md:gap-2"><span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500/20 rounded" /> Blocked</div>
                <div className="flex items-center gap-1.5 md:gap-2"><span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500/20 rounded" /> Partial</div>
                <div className="flex items-center gap-1.5 md:gap-2"><span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full" /> Booked</div>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
              {selectedDate ? (
                <>
                  <h3 className="font-semibold text-sm md:text-lg mb-3 md:mb-4">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                  {getBookings(selectedDate).length > 0 && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <p className="text-green-400 text-xs md:text-sm font-medium mb-1 md:mb-2">Existing Bookings:</p>
                      {getBookings(selectedDate).map(b => <p key={b.id} className="text-xs md:text-sm text-gray-400">{b.name} - {b.hours?.map(h => `${h}:00`).join(', ')}</p>)}
                    </div>
                  )}
                  <label className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 cursor-pointer">
                    <input type="checkbox" checked={isFullyBlocked} onChange={e => setIsFullyBlocked(e.target.checked)} className="w-4 h-4 md:w-5 md:h-5 rounded" />
                    <span className="font-medium text-sm md:text-base">Block entire day</span>
                  </label>
                  {!isFullyBlocked && (
                    <div className="mb-4 md:mb-6">
                      <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">Block specific hours:</p>
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-2">
                        {HOURS.map(h => {
                          const booked = getBookings(selectedDate).some(b => b.hours?.includes(h))
                          return <button key={h} onClick={() => !booked && toggleHour(h)} disabled={booked} className={`py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${booked ? 'bg-green-500/20 text-green-400 cursor-not-allowed' : selectedHours.includes(h) ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10'}`}>{h}:00</button>
                        })}
                      </div>
                    </div>
                  )}
                  <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g., Holiday, Special event" />
                  <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] py-2.5 md:py-3 rounded-xl font-semibold text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save Override'}</button>
                    <button onClick={handleClear} className="px-4 md:px-6 py-2.5 md:py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">Clear</button>
                  </div>
                </>
              ) : (
                <EmptyState icon="📅" text="Select a date to add an override" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============ BOOKINGS MANAGER ============
function BookingsManager({ bookings, onRefresh, formatPrice, formatDate }) {
  const update = async (b, status) => { await supabase.from('studio_bookings').update({ status }).eq('id', b.id); onRefresh() }
  const del = async (b) => { if (!confirm('Delete?')) return; await supabase.from('studio_bookings').delete().eq('id', b.id); onRefresh() }
  const [expandedFiles, setExpandedFiles] = useState(null)
  const [fileCache, setFileCache] = useState({})
  const [sendingInvoice, setSendingInvoice] = useState(null)

  const PAYMENT_COLORS = { pending: 'bg-gray-500/20 text-gray-400', deposit_paid: 'bg-blue-500/20 text-blue-400', invoice_sent: 'bg-yellow-500/20 text-yellow-400', fully_paid: 'bg-green-500/20 text-green-400' }
  const PAYMENT_LABELS = { pending: 'Awaiting Deposit', deposit_paid: 'Deposit Paid', invoice_sent: 'Invoice Sent', fully_paid: 'Fully Paid' }

  const toggleFiles = async (id) => {
    if (expandedFiles === id) { setExpandedFiles(null); return }
    setExpandedFiles(id)
    if (!fileCache[id]) {
      try {
        const res = await fetch(`/api/upload-files?bookingId=${id}&type=studio`)
        const data = await res.json()
        setFileCache(prev => ({ ...prev, [id]: data.files || [] }))
      } catch { setFileCache(prev => ({ ...prev, [id]: [] })) }
    }
  }

  const deleteFile = async (bookingId, fileName) => {
    if (!confirm(`Delete ${fileName}?`)) return
    try {
      const res = await fetch('/api/upload-files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, serviceType: 'studio', fileName }) })
      const data = await res.json()
      if (data.success) setFileCache(prev => ({ ...prev, [bookingId]: prev[bookingId].filter(f => f.name !== fileName) }))
    } catch { alert('Failed to delete file') }
  }

  const sendInvoice = async (bookingId) => {
    setSendingInvoice(bookingId)
    try {
      const res = await fetch('/api/send-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceType: 'studio', bookingId }) })
      const data = await res.json()
      if (data.error) alert(`Error: ${data.error}`)
      else { alert(`Invoice sent! Amount: €${data.amount.toFixed(2)}`); onRefresh() }
    } catch { alert('Failed to send invoice') }
    setSendingInvoice(null)
  }

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Studio Bookings</h2>
      <div className="space-y-3 md:space-y-4">
        {bookings.map(b => {
          const ps = b.payment_status || 'pending'
          const depositAmt = b.deposit_amount || Math.round((b.total_price || 0) / 2)
          return (
          <div key={b.id} className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div>
                <h3 className="font-semibold text-sm md:text-lg">{b.name}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{b.email}</p>
                {b.phone && <p className="text-gray-500 text-xs md:text-sm">{b.phone}</p>}
              </div>
              <div className="flex items-center gap-2">
                {ps !== 'pending' && <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${PAYMENT_COLORS[ps]}`}>{PAYMENT_LABELS[ps]}</span>}
                <StatusBadge status={b.status} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
              <div><p className="text-gray-500 text-[10px] md:text-xs">Date</p><p className="font-medium text-xs md:text-base">{new Date(b.date).toLocaleDateString('de-DE')}</p></div>
              <div><p className="text-gray-500 text-[10px] md:text-xs">Hours</p><p className="font-medium text-xs md:text-base">{b.hours?.map(h => `${h}:00`).join(', ')}</p></div>
              <div><p className="text-gray-500 text-[10px] md:text-xs">Total</p><p className="font-medium text-[#8B5CF6] text-xs md:text-base">{formatPrice(b.total_price)}</p></div>
            </div>
            {ps !== 'pending' && ps !== 'fully_paid' && (
              <div className="text-xs text-gray-500 mb-3">Paid: €{depositAmt.toFixed(2)} · Due: €{((b.total_price || 0) - depositAmt).toFixed(2)}</div>
            )}
            {b.add_mix_master && <p className="text-xs md:text-sm text-purple-400 mb-3 md:mb-4">+ Mix & Master</p>}
            {b.message && <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 bg-white/5 p-2 md:p-3 rounded-xl">{b.message}</p>}
            <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-white/10">
              <p className="text-[10px] md:text-xs text-gray-500 flex-1">{formatDate(b.created_at)}</p>
              {ps === 'deposit_paid' && (
                <button onClick={() => sendInvoice(b.id)} disabled={sendingInvoice === b.id} className="px-3 py-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                  {sendingInvoice === b.id ? 'Sending...' : 'Send Invoice'}
                </button>
              )}
              <select value={b.status} onChange={e => update(b, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm">
                {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => del(b)} className="text-gray-400 hover:text-red-400 p-1.5 md:p-2 text-sm">🗑️</button>
            </div>
            {/* Files section */}
            {ps !== 'pending' && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleFiles(b.id)} className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
                    {expandedFiles === b.id ? 'Hide Files' : 'View Files'}
                  </button>
                  <a href={`/upload?type=studio&id=${b.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Upload Link</a>
                </div>
                {expandedFiles === b.id && (
                  <div className="mt-2">
                    {!fileCache[b.id] ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Loading...</div>
                    ) : fileCache[b.id].length === 0 ? (
                      <p className="text-xs text-gray-600">No files uploaded yet</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 mb-1">{fileCache[b.id].length} file(s)</p>
                        {fileCache[b.id].map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-[#8B5CF6]">&#9679;</span>
                            <span className="text-gray-300 truncate flex-1">{f.name}</span>
                            {f.size > 0 && <span className="text-gray-600 text-[10px]">{(f.size / 1024 / 1024).toFixed(1)}MB</span>}
                            <a href={`/api/upload-files?type=studio&bookingId=${b.id}&download=${encodeURIComponent(f.name)}`} className="text-[10px] text-[#8B5CF6] hover:text-[#A78BFA]">Download</a>
                            <button onClick={() => deleteFile(b.id, f.name)} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )
        })}
        {bookings.length === 0 && <EmptyState icon="🎤" text="No bookings yet." />}
      </div>
    </div>
  )
}

// ============ MIX REQUESTS MANAGER ============
function MixRequestsManager({ requests, onRefresh, formatPrice, formatDate }) {
  const update = async (r, status) => { await supabase.from('mix_requests').update({ status }).eq('id', r.id); onRefresh() }
  const del = async (r) => { if (!confirm('Delete?')) return; await supabase.from('mix_requests').delete().eq('id', r.id); onRefresh() }
  const [expandedFiles, setExpandedFiles] = useState(null)
  const [fileCache, setFileCache] = useState({})
  const [sendingInvoice, setSendingInvoice] = useState(null)

  const PAYMENT_COLORS = { pending: 'bg-gray-500/20 text-gray-400', deposit_paid: 'bg-blue-500/20 text-blue-400', invoice_sent: 'bg-yellow-500/20 text-yellow-400', fully_paid: 'bg-green-500/20 text-green-400' }
  const PAYMENT_LABELS = { pending: 'Awaiting Deposit', deposit_paid: 'Deposit Paid', invoice_sent: 'Invoice Sent', fully_paid: 'Fully Paid' }

  const toggleFiles = async (id) => {
    if (expandedFiles === id) { setExpandedFiles(null); return }
    setExpandedFiles(id)
    if (!fileCache[id]) {
      try {
        const res = await fetch(`/api/upload-files?bookingId=${id}&type=mix`)
        const data = await res.json()
        setFileCache(prev => ({ ...prev, [id]: data.files || [] }))
      } catch { setFileCache(prev => ({ ...prev, [id]: [] })) }
    }
  }

  const deleteFile = async (bookingId, fileName) => {
    if (!confirm(`Delete ${fileName}?`)) return
    try {
      const res = await fetch('/api/upload-files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, serviceType: 'mix', fileName }) })
      const data = await res.json()
      if (data.success) setFileCache(prev => ({ ...prev, [bookingId]: prev[bookingId].filter(f => f.name !== fileName) }))
    } catch { alert('Failed to delete file') }
  }

  const sendInvoice = async (bookingId) => {
    setSendingInvoice(bookingId)
    try {
      const res = await fetch('/api/send-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceType: 'mix', bookingId }) })
      const data = await res.json()
      if (data.error) alert(`Error: ${data.error}`)
      else { alert(`Invoice sent! Amount: €${data.amount.toFixed(2)}`); onRefresh() }
    } catch { alert('Failed to send invoice') }
    setSendingInvoice(null)
  }

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Mix & Master Requests</h2>
      <div className="space-y-3 md:space-y-4">
        {requests.map(r => {
          const ps = r.payment_status || 'pending'
          const depositAmt = r.deposit_amount || Math.round((r.total_price || 0) / 2)
          return (
          <div key={r.id} className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div>
                <h3 className="font-semibold text-sm md:text-lg">{r.track_name}</h3>
                <p className="text-gray-500 text-xs md:text-sm">by {r.name} ({r.email})</p>
              </div>
              <div className="flex items-center gap-2">
                {ps !== 'pending' && <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${PAYMENT_COLORS[ps]}`}>{PAYMENT_LABELS[ps]}</span>}
                <StatusBadge status={r.status} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
              <div><p className="text-gray-500 text-[10px] md:text-xs">Genre</p><p className="font-medium text-xs md:text-base">{r.genre}</p></div>
              <div><p className="text-gray-500 text-[10px] md:text-xs">Delivery</p><p className="font-medium text-xs md:text-base">{r.rush_delivery ? '⚡ Rush' : 'Standard'}</p></div>
              <div><p className="text-gray-500 text-[10px] md:text-xs">Total</p><p className="font-medium text-[#8B5CF6] text-xs md:text-base">{formatPrice(r.total_price)}</p></div>
            </div>
            {ps !== 'pending' && ps !== 'fully_paid' && (
              <div className="text-xs text-gray-500 mb-3">Paid: €{depositAmt.toFixed(2)} · Due: €{((r.total_price || 0) - depositAmt).toFixed(2)}</div>
            )}
            {r.reference_url && <p className="text-xs md:text-sm mb-2 truncate"><span className="text-gray-500">Ref:</span> <a href={r.reference_url} target="_blank" className="text-[#8B5CF6]">{r.reference_url}</a></p>}
            {r.notes && <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 bg-white/5 p-2 md:p-3 rounded-xl">{r.notes}</p>}
            <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-white/10">
              <p className="text-[10px] md:text-xs text-gray-500 flex-1">{formatDate(r.created_at)}</p>
              {ps === 'deposit_paid' && (
                <button onClick={() => sendInvoice(r.id)} disabled={sendingInvoice === r.id} className="px-3 py-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                  {sendingInvoice === r.id ? 'Sending...' : 'Send Invoice'}
                </button>
              )}
              <select value={r.status} onChange={e => update(r, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm">
                {['pending', 'in_progress', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => del(r)} className="text-gray-400 hover:text-red-400 p-1.5 md:p-2 text-sm">🗑️</button>
            </div>
            {/* Files section */}
            {ps !== 'pending' && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleFiles(r.id)} className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
                    {expandedFiles === r.id ? 'Hide Files' : 'View Files'}
                  </button>
                  <a href={`/upload?type=mix&id=${r.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Upload Link</a>
                </div>
                {expandedFiles === r.id && (
                  <div className="mt-2">
                    {!fileCache[r.id] ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Loading...</div>
                    ) : fileCache[r.id].length === 0 ? (
                      <p className="text-xs text-gray-600">No files uploaded yet</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 mb-1">{fileCache[r.id].length} file(s)</p>
                        {fileCache[r.id].map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-[#8B5CF6]">&#9679;</span>
                            <span className="text-gray-300 truncate flex-1">{f.name}</span>
                            {f.size > 0 && <span className="text-gray-600 text-[10px]">{(f.size / 1024 / 1024).toFixed(1)}MB</span>}
                            <a href={`/api/upload-files?type=mix&bookingId=${r.id}&download=${encodeURIComponent(f.name)}`} className="text-[10px] text-[#8B5CF6] hover:text-[#A78BFA]">Download</a>
                            <button onClick={() => deleteFile(r.id, f.name)} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )
        })}
        {requests.length === 0 && <EmptyState icon="🎚️" text="No mix requests yet." />}
      </div>
    </div>
  )
}

// ============ MIX DEMO MANAGER ============
function MixDemoManager({ demos, onRefresh }) {
  const [uploading, setUploading] = useState({ raw: false, mixed: false })
  const [playing, setPlaying] = useState(null)
  const audioRef = useRef(null)
  const rawRef = useRef(null)
  const mixedRef = useRef(null)

  const demo = demos.find(d => d.is_active) || demos[0]

  const upload = async (type, file) => {
    if (!file) return
    if (!file.type.includes('audio')) { alert('Select audio file'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Max 50MB'); return }
    setUploading(u => ({ ...u, [type]: true }))
    try {
      const fileName = `mix-demo-${type}-${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('beats').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('beats').getPublicUrl(fileName)

      // If no demo exists, create one first
      let demoId = demo?.id
      if (!demoId) {
        const { data: newDemo, error: createError } = await supabase.from('mix_demos').insert([{ is_active: true }]).select().single()
        if (createError) throw createError
        demoId = newDemo.id
      }

      await supabase.from('mix_demos').update({ [type === 'raw' ? 'raw_audio_url' : 'mixed_audio_url']: data.publicUrl }).eq('id', demoId)
      onRefresh()
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(u => ({ ...u, [type]: false }))
  }

  const play = (url, type) => {
    if (audioRef.current) {
      if (playing === type) { audioRef.current.pause(); setPlaying(null) }
      else { audioRef.current.src = url; audioRef.current.play(); setPlaying(type) }
    }
  }

  const del = async (type) => {
    if (!demo || !confirm(`Delete ${type}?`)) return
    await supabase.from('mix_demos').update({ [type === 'raw' ? 'raw_audio_url' : 'mixed_audio_url']: null }).eq('id', demo.id)
    onRefresh()
  }

  const AudioCard = ({ type, url, label, accent }) => (
    <div className={`bg-white/[0.02] border ${accent ? 'border-[#8B5CF6]/20' : 'border-white/10'} rounded-xl md:rounded-2xl p-4 md:p-6`}>
      <h3 className="font-semibold mb-1 text-sm md:text-base">{type === 'raw' ? '🔇' : '🔊'} {label}</h3>
      <p className="text-gray-500 text-xs md:text-sm mb-3 md:mb-4">{type === 'raw' ? 'Unprocessed' : 'Professional mix'}</p>
      {url ? (
        <div className="space-y-3 md:space-y-4">
          <div className={`${accent ? 'bg-[#8B5CF6]/10' : 'bg-white/5'} rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4`}>
            <button onClick={() => play(url, type)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${playing === type ? 'bg-[#8B5CF6]' : accent ? 'bg-[#8B5CF6]/30 hover:bg-[#8B5CF6]/50' : 'bg-white/10 hover:bg-white/20'}`}>
              {playing === type ? '❚❚' : '▶'}
            </button>
            <div><p className="text-xs md:text-sm text-green-400">✓ Uploaded</p></div>
          </div>
          <div className="flex gap-2">
            <input ref={type === 'raw' ? rawRef : mixedRef} type="file" accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*" onChange={e => upload(type, e.target.files?.[0])} className="hidden" />
            <button onClick={() => (type === 'raw' ? rawRef : mixedRef).current?.click()} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs md:text-sm">{uploading[type] ? 'Uploading...' : 'Replace'}</button>
            <button onClick={() => del(type)} className="px-3 md:px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-xs md:text-sm">Delete</button>
          </div>
        </div>
      ) : (
        <div>
          <input ref={type === 'raw' ? rawRef : mixedRef} type="file" accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*" onChange={e => upload(type, e.target.files?.[0])} className="hidden" />
          <div onClick={() => (type === 'raw' ? rawRef : mixedRef).current?.click()} className={`border-2 border-dashed ${accent ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5' : 'border-white/10 hover:border-[#8B5CF6]/30'} rounded-xl p-6 md:p-8 text-center cursor-pointer`}>
            {uploading[type] ? <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" /> : <><span className="text-3xl md:text-4xl block mb-2">📤</span><p className="text-gray-400 text-xs md:text-sm">Upload {type}</p></>}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-2">Mix Demo Audio</h2>
      <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-8">Before/after for Mix & Master page.</p>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <AudioCard type="raw" url={demo?.raw_audio_url} label="Raw Recording" />
        <AudioCard type="mixed" url={demo?.mixed_audio_url} label="Mixed & Mastered" accent />
      </div>
      <div className="mt-4 md:mt-8 p-3 md:p-4 bg-white/[0.02] border border-white/10 rounded-xl">
        <h4 className="font-medium mb-2 text-sm">Status</h4>
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
          <span className={demo?.raw_audio_url ? 'text-green-400' : 'text-gray-500'}>{demo?.raw_audio_url ? '✓' : '○'} Raw</span>
          <span className={demo?.mixed_audio_url ? 'text-green-400' : 'text-gray-500'}>{demo?.mixed_audio_url ? '✓' : '○'} Mixed</span>
          <span className={demo?.raw_audio_url && demo?.mixed_audio_url ? 'text-green-400' : 'text-yellow-400'}>{demo?.raw_audio_url && demo?.mixed_audio_url ? '✓ Ready' : '⚠ Upload both'}</span>
        </div>
      </div>
    </div>
  )
}

// ============ RECENT MIXES MANAGER ============
function RecentMixesManager({ mixes, onRefresh, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingMix, setEditingMix] = useState(null)
  const [formData, setFormData] = useState({ title: '', artist: '', genre: '', image_url: '', audio_url: '', color: 'from-purple-500/20', is_visible: true })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const colors = ['from-purple-500/20', 'from-pink-500/20', 'from-blue-500/20', 'from-red-500/20', 'from-green-500/20', 'from-yellow-500/20', 'from-orange-500/20', 'from-cyan-500/20']
  const genres = ['Hip-Hop', 'Trap', 'Drill', 'R&B', 'Pop', 'Afrobeat', 'Other']

  const openAdd = () => { setEditingMix(null); setFormData({ title: '', artist: '', genre: '', image_url: '', audio_url: '', color: 'from-purple-500/20', is_visible: true }); setShowModal(true) }
  const openEdit = (m) => { setEditingMix(m); setFormData({ title: m.title || '', artist: m.artist || '', genre: m.genre || '', image_url: m.image_url || '', audio_url: m.audio_url || '', color: m.color || 'from-purple-500/20', is_visible: m.is_visible !== false }); setShowModal(true) }

  const upload = async (file, bucket, setUploading, field) => {
    if (!file) return
    const maxSize = bucket === 'beats' ? 50 : 5
    if (file.size > maxSize * 1024 * 1024) { alert(`Max ${maxSize}MB`); return }
    setUploading(true)
    try {
      const fileName = `mix-${field}-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from(bucket).upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      setFormData(f => ({ ...f, [field]: data.publicUrl }))
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.artist || !formData.genre) { alert('Fill required fields'); return }
    setSaving(true)
    const { error } = editingMix
      ? await supabase.from('recent_mixes').update(formData).eq('id', editingMix.id)
      : await supabase.from('recent_mixes').insert([formData])
    if (error) alert('Error: ' + error.message)
    else { setShowModal(false); onRefresh() }
    setSaving(false)
  }

  const del = async (m) => { if (!confirm(`Delete "${m.title}"?`)) return; await supabase.from('recent_mixes').delete().eq('id', m.id); onRefresh() }
  const toggleVis = async (m) => { await supabase.from('recent_mixes').update({ is_visible: !m.is_visible }).eq('id', m.id); onRefresh() }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div><h2 className="text-lg md:text-2xl font-bold">Recent Mixes</h2><p className="text-gray-500 text-xs md:text-sm">Portfolio</p></div>
        <button onClick={openAdd} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2">+ Add</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {mixes.map(m => (
          <div key={m.id} className={`bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl overflow-hidden ${!m.is_visible ? 'opacity-50' : ''}`}>
            <div className={`aspect-square bg-gradient-to-br ${m.color} to-[#050505] flex items-center justify-center relative`}>
              {m.image_url ? <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" /> : <span className="text-4xl md:text-5xl opacity-30">🎵</span>}
              {m.audio_url && <div className="absolute bottom-2 right-2 bg-green-500/20 text-green-400 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">🔊</div>}
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-semibold text-sm truncate">{m.title}</h3>
              <p className="text-gray-500 text-xs truncate">{m.artist} - {m.genre}</p>
              <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3">
                <button onClick={() => openEdit(m)} className="flex-1 py-1.5 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] md:text-sm">Edit</button>
                <button onClick={() => toggleVis(m)} className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm ${m.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{m.is_visible ? '👁' : '👁‍🗨'}</button>
                <button onClick={() => del(m)} className="px-2 md:px-3 py-1.5 md:py-2 hover:bg-red-500/10 rounded-lg text-red-400 text-[10px] md:text-sm">🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {mixes.length === 0 && <div className="col-span-full"><EmptyState icon="💿" text="No mixes yet." /></div>}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingMix ? 'Edit Mix' : 'Add New Mix'}>
        <div className="space-y-4">
          <Input label="Track Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Midnight Run" />
          <Input label="Artist" required value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} placeholder="e.g. Jay Flex" />
          <Select label="Genre" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} options={[{ value: '', label: 'Select' }, ...genres.map(g => ({ value: g, label: g }))]} />
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">{colors.map(c => <button key={c} onClick={() => setFormData({ ...formData, color: c })} className={`h-8 md:h-10 rounded-lg bg-gradient-to-br ${c} to-[#050505] border-2 ${formData.color === c ? 'border-white' : 'border-transparent hover:border-white/30'}`} />)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FileUpload label="Cover" type="image" uploading={uploadingImage} preview={formData.image_url} onUpload={f => upload(f, 'images', setUploadingImage, 'image_url')} />
            <FileUpload label="Audio" type="audio" uploading={uploadingAudio} preview={formData.audio_url} onUpload={f => upload(f, 'beats', setUploadingAudio, 'audio_url')} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} className="w-4 h-4 rounded" />Show on website</label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50 text-sm">{saving ? 'Saving...' : (editingMix ? 'Update' : 'Add')}</button>
        </div>
      </Modal>
    </div>
  )
}

// ============ MESSAGES MANAGER ============
function MessagesManager({ messages, onRefresh, formatDate }) {
  const toggle = async (m) => { await supabase.from('contact_messages').update({ is_read: !m.is_read }).eq('id', m.id); onRefresh() }
  const del = async (m) => { if (!confirm('Delete?')) return; await supabase.from('contact_messages').delete().eq('id', m.id); onRefresh() }

  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Messages</h2>
      <div className="space-y-3 md:space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`bg-white/[0.02] border rounded-xl md:rounded-2xl p-4 md:p-6 ${m.is_read ? 'border-white/10' : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5'}`}>
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm md:text-base">{m.name}</h3>
                  {!m.is_read && <span className="bg-[#8B5CF6] text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full">New</span>}
                </div>
                <p className="text-gray-500 text-xs md:text-sm">{m.email}</p>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500">{formatDate(m.created_at)}</p>
            </div>
            <div className="mb-3 md:mb-4">
              <p className="text-xs md:text-sm text-[#8B5CF6] mb-1 md:mb-2">Subject: {m.subject}</p>
              <p className="text-gray-300 text-xs md:text-sm bg-white/5 p-3 md:p-4 rounded-xl">{m.message}</p>
            </div>
            <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-white/10">
              <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">Reply</a>
              <button onClick={() => toggle(m)} className="bg-white/5 hover:bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm">{m.is_read ? 'Unread' : 'Read'}</button>
              <button onClick={() => del(m)} className="text-gray-400 hover:text-red-400 p-1.5 md:p-2 ml-auto text-sm">🗑️</button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <EmptyState icon="💬" text="No messages yet." />}
      </div>
    </div>
  )
}

// ============ FOCAL POINT PICKER ============
function FocalPointPicker({ imageUrl, focalX, focalY, onChange }) {
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onChange(x, y)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-400">Focal Point <span className="text-gray-600">(click to set)</span></label>
      <div
        className="relative aspect-video bg-black rounded-xl overflow-hidden cursor-crosshair border border-white/10"
        onClick={handleClick}
      >
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        {/* Focal point indicator */}
        <div
          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        >
          <div className="absolute inset-0 border-2 border-white rounded-full shadow-lg" />
          <div className="absolute inset-[10px] bg-white rounded-full" />
        </div>
        {/* Crosshair lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-white/30 w-px h-full" style={{ left: `${focalX}%` }} />
          <div className="absolute bg-white/30 h-px w-full" style={{ top: `${focalY}%` }} />
        </div>
      </div>
      <p className="text-xs text-gray-500">Position: {focalX}% x {focalY}%</p>
    </div>
  )
}

// ============ SITE IMAGES MANAGER ============
function SiteImagesManager({ images, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [formData, setFormData] = useState({ name: '', location: '', image_url: '', is_active: true, focal_x: 50, focal_y: 50 })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const locations = [
    { value: 'homepage-hero', label: 'Home - Hero', desc: 'Hero background image (scales on scroll)' },
    { value: 'studio-main', label: 'Studio - Main', desc: 'Large hero photo on /studio' },
    { value: 'studio-setup', label: 'Studio - Setup', desc: 'Equipment/gear photo' },
    { value: 'studio-vibe', label: 'Studio - Vibe', desc: 'Atmosphere/vibe photo' },
    { value: 'studio-location', label: 'Studio - Location', desc: 'Location section photo' },
    { value: 'about-profile', label: 'About - Profile', desc: 'Your profile photo on /about' },
    { value: 'about-studio', label: 'About - Studio', desc: 'Working in studio photo' },
  ]

  const openAdd = (loc = '') => { setEditingImage(null); setFormData({ name: '', location: loc, image_url: '', is_active: true, focal_x: 50, focal_y: 50 }); setShowModal(true) }
  const openEdit = (i) => { setEditingImage(i); setFormData({ name: i.name || '', location: i.location || '', image_url: i.image_url || '', is_active: i.is_active !== false, focal_x: i.focal_x ?? 50, focal_y: i.focal_y ?? 50 }); setShowModal(true) }

  const upload = async (file) => {
    if (!file || !file.type.includes('image')) { alert('Select image'); return }
    setUploading(true)
    try {
      // Compress image before upload (max 1920px, 85% quality)
      const compressed = await compressImage(file, 1920, 0.85)
      const fileName = `site-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      const { error } = await supabase.storage.from('images').upload(fileName, compressed)
      if (error) throw error
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      setFormData(f => ({ ...f, image_url: data.publicUrl }))
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.image_url) { alert('Fill all fields'); return }
    setSaving(true)
    const { error } = editingImage
      ? await supabase.from('site_images').update(formData).eq('id', editingImage.id)
      : await supabase.from('site_images').insert([formData])
    if (error) alert('Error: ' + error.message)
    else { setShowModal(false); onRefresh() }
    setSaving(false)
  }

  const del = async (i) => { if (!confirm(`Delete "${i.name}"?`)) return; await supabase.from('site_images').delete().eq('id', i.id); onRefresh() }
  const toggleActive = async (i) => { await supabase.from('site_images').update({ is_active: !i.is_active }).eq('id', i.id); onRefresh() }
  const copy = (url, id) => { navigator.clipboard.writeText(url); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000) }

  const grouped = locations.map(l => ({ ...l, images: images.filter(i => i.location === l.value) }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div><h2 className="text-lg md:text-2xl font-bold">Site Images</h2><p className="text-gray-500 text-xs md:text-sm">Manage photos</p></div>
        <button onClick={() => openAdd()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2">+ Upload</button>
      </div>

      <div className="space-y-4 md:space-y-8">
        {grouped.map(g => (
          <div key={g.value} className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div><h3 className="font-semibold text-sm md:text-base">{g.label}</h3><p className="text-gray-500 text-[10px] md:text-xs">{g.desc}</p></div>
              {g.images.length === 0 && <button onClick={() => openAdd(g.value)} className="text-[#8B5CF6] hover:text-[#7C3AED] text-xs flex items-center gap-1">+ Add</button>}
            </div>
            {g.images.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {g.images.map(i => (
                  <div key={i.id} className={`relative rounded-lg md:rounded-xl overflow-hidden border ${i.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                    <div className="aspect-video bg-black"><img src={i.image_url} alt={i.name} className="w-full h-full object-cover" /></div>
                    <div className="p-2 md:p-3 bg-white/5">
                      <p className="font-medium text-xs md:text-sm truncate">{i.name}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => copy(i.image_url, i.id)} className={`flex-1 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs ${copiedId === i.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>{copiedId === i.id ? '✓ Copied' : '📋 URL'}</button>
                        <button onClick={() => openEdit(i)} className="p-1 md:p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] md:text-sm">✏️</button>
                        <button onClick={() => toggleActive(i)} className={`p-1 md:p-1.5 rounded-lg text-[10px] md:text-sm ${i.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{i.is_active ? '👁' : '👁‍🗨'}</button>
                        <button onClick={() => del(i)} className="p-1 md:p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 text-[10px] md:text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 md:p-8 text-center"><span className="text-2xl md:text-3xl block mb-2">📷</span><p className="text-gray-500 text-xs md:text-sm">No image</p></div>
            )}
          </div>
        ))}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingImage ? 'Edit Image' : 'Upload Image'}>
        <div className="space-y-4">
          <FileUpload label="Image" type="image" uploading={uploading} preview={formData.image_url} onUpload={upload} />
          {formData.image_url && (
            <FocalPointPicker
              imageUrl={formData.image_url}
              focalX={formData.focal_x}
              focalY={formData.focal_y}
              onChange={(x, y) => setFormData({ ...formData, focal_x: x, focal_y: y })}
            />
          )}
          <Input label="Image Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Studio Main" />
          <Select label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} options={[{ value: '', label: 'Select location' }, ...locations.map(l => ({ value: l.value, label: l.label }))]} />
          {formData.location && <p className="text-gray-500 text-xs">{locations.find(l => l.value === formData.location)?.desc}</p>}
          <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded" />Active</label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving || !formData.image_url} className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50 text-sm">{saving ? 'Saving...' : (editingImage ? 'Update' : 'Save')}</button>
        </div>
      </Modal>
    </div>
  )
}

// ============ ADMINS MANAGER ============
function AdminsManager({ admins, currentAdmin, onRefresh, formatDate }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', name: '', role: 'admin' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!formData.email || !formData.name) { setError('Fill all fields'); return }
    setSaving(true)
    setError('')
    
    const { error: createError, needsSignup } = await createAdmin(formData.email, formData.name, formData.role)
    if (createError) { setError(createError); setSaving(false); return }
    
    setShowModal(false)
    onRefresh()
    if (needsSignup) alert(`Admin "${formData.name}" added! They need to sign up with email: ${formData.email}`)
    setSaving(false)
  }

  const toggleActive = async (admin) => {
    if (admin.id === currentAdmin.id) { alert("You can't deactivate yourself!"); return }
    admin.is_active ? await deactivateAdmin(admin.id) : await reactivateAdmin(admin.id)
    onRefresh()
  }

  const handleDelete = async (admin) => {
    if (admin.id === currentAdmin.id) { alert("You can't delete yourself!"); return }
    if (!confirm(`Delete admin "${admin.name}"?`)) return
    await supabase.from('admins').delete().eq('id', admin.id)
    onRefresh()
  }

  const roleColors = { owner: 'bg-yellow-500/20 text-yellow-400', admin: 'bg-[#8B5CF6]/20 text-[#8B5CF6]', editor: 'bg-blue-500/20 text-blue-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div><h2 className="text-lg md:text-2xl font-bold">Manage Admins</h2><p className="text-gray-500 text-xs md:text-sm">Add or remove admin access</p></div>
        <button onClick={() => { setFormData({ email: '', name: '', role: 'admin' }); setError(''); setShowModal(true) }} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm">+ Add Admin</button>
      </div>

      <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-4 mb-6">
        <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">💡 How it works</h3>
        <ul className="text-xs md:text-sm text-gray-400 space-y-1">
          <li>1. Add an admin with their email and name</li>
          <li>2. They sign up with that exact email</li>
          <li>3. Their account is automatically linked</li>
        </ul>
      </div>

      <div className="space-y-3 md:space-y-4">
        {admins.map(admin => (
          <div key={admin.id} className={`bg-white/[0.02] border rounded-xl md:rounded-2xl p-4 md:p-6 ${admin.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-lg md:text-xl">{admin.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base">{admin.name}</h3>
                    {admin.id === currentAdmin.id && <span className="text-[10px] md:text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">You</span>}
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">{admin.email}</p>
                </div>
              </div>
              <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium capitalize ${roleColors[admin.role]}`}>{admin.role}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs md:text-sm">
              <div><p className="text-gray-500">Status</p><p className={admin.is_active ? 'text-green-400' : 'text-red-400'}>{admin.is_active ? '● Active' : '○ Inactive'}</p></div>
              <div><p className="text-gray-500">Last Login</p><p className="text-gray-300">{admin.last_login ? formatDate(admin.last_login) : 'Never'}</p></div>
            </div>
            {admin.id !== currentAdmin.id && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button onClick={() => toggleActive(admin)} className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition ${admin.is_active ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{admin.is_active ? 'Deactivate' : 'Reactivate'}</button>
                <button onClick={() => handleDelete(admin)} className="px-4 py-2 rounded-lg text-xs md:text-sm text-red-400 hover:bg-red-500/10">Delete</button>
              </div>
            )}
          </div>
        ))}
        {admins.length === 0 && <EmptyState icon="👥" text="No admins found" />}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add New Admin">
        <div className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
          <Input label="Email" required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="admin@example.com" />
          <Input label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
          <Select label="Role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} options={[{ value: 'admin', label: 'Admin - Full access' }, { value: 'editor', label: 'Editor - Limited' }, { value: 'owner', label: 'Owner - Can manage admins' }]} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#8B5CF6] rounded-xl font-semibold disabled:opacity-50 text-sm">{saving ? 'Adding...' : 'Add Admin'}</button>
        </div>
      </Modal>
    </div>
  )
}

// ============ TESTIMONIALS MANAGER ============
function TestimonialsManager({ testimonials, onRefresh, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [formData, setFormData] = useState({ name: '', role: '', text: '', rating: 5, page: 'all', is_active: true, display_order: 0 })
  const [saving, setSaving] = useState(false)

  const pages = [
    { value: 'all', label: 'All Pages' },
    { value: 'home', label: 'Home Page' },
    { value: 'mixing', label: 'Mix & Master Page' },
    { value: 'studio', label: 'Studio Page' }
  ]

  const openAdd = () => {
    setEditingTestimonial(null)
    setFormData({ name: '', role: '', text: '', rating: 5, page: 'all', is_active: true, display_order: testimonials.length })
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditingTestimonial(t)
    setFormData({
      name: t.name || '', role: t.role || '', text: t.text || '',
      rating: t.rating || 5, page: t.page || 'all', is_active: t.is_active ?? true,
      display_order: t.display_order || 0
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.text.trim()) { alert('Name and text are required'); return }
    setSaving(true)
    const { error } = editingTestimonial
      ? await supabase.from('testimonials').update(formData).eq('id', editingTestimonial.id)
      : await supabase.from('testimonials').insert([formData])
    if (error) alert('Error: ' + error.message)
    else { setShowModal(false); onRefresh() }
    setSaving(false)
  }

  const handleDelete = async (t) => {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return
    await supabase.from('testimonials').delete().eq('id', t.id)
    onRefresh()
  }

  const toggleActive = async (t) => {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id)
    onRefresh()
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold">Manage Testimonials</h2>
        <button onClick={openAdd} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition text-xs md:text-sm flex items-center gap-2">+ Add</button>
      </div>

      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <EmptyState icon="⭐" text="No testimonials yet. Add your first review!" />
        ) : (
          testimonials.map(t => (
            <div key={t.id} className={`bg-white/[0.02] border rounded-xl p-4 ${t.is_active ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(t.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{t.name}</p>
                    <span className="text-xs text-gray-500">{t.role}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {pages.find(p => p.value === t.page)?.label || 'All Pages'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{t.text}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className={star <= t.rating ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(t)} className={`text-xs px-2 py-1 rounded-full ${t.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => openEdit(t)} className="p-2 text-gray-400 hover:text-white">✏️</button>
                  <button onClick={() => handleDelete(t)} className="p-2 text-gray-400 hover:text-red-400">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
            <Input label="Role" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Rapper, Singer, etc." />
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">Review Text *</label>
            <textarea
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
              placeholder="What they said about your service..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm text-gray-400 mb-2">Show On</label>
              <select
                value={formData.page}
                onChange={e => setFormData({ ...formData, page: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50"
              >
                {pages.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded" />
            Active (visible on website)
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#8B5CF6] rounded-xl font-semibold disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : (editingTestimonial ? 'Update' : 'Add')}
          </button>
        </div>
      </Modal>
    </div>
  )
}