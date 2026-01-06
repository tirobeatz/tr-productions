'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { 
  getUser, isAdmin, getAdminProfile, signIn, signOut, 
  getAllAdmins, createAdmin, updateAdmin, deactivateAdmin, 
  reactivateAdmin, linkUserToAdmin, onAuthStateChange 
} from '../../lib/auth'

export default function AdminPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [authState, setAuthState] = useState('loading') // loading, login, signup, authenticated
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('beats')
  const [loading, setLoading] = useState(false)
  
  // Auth form state
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Data state
  const [beats, setBeats] = useState([])
  const [bookings, setBookings] = useState([])
  const [mixRequests, setMixRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [availability, setAvailability] = useState([])
  const [mixDemos, setMixDemos] = useState([])
  const [recentMixes, setRecentMixes] = useState([])
  const [siteImages, setSiteImages] = useState([])
  const [admins, setAdmins] = useState([])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await checkAuth()
      } else if (event === 'SIGNED_OUT') {
        setAuthState('login')
        setCurrentAdmin(null)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    const user = await getUser()
    if (!user) {
      setAuthState('login')
      return
    }
    
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      // Try to link user to existing admin record
      const { admin } = await linkUserToAdmin(user.id, user.email)
      if (!admin) {
        setAuthError('You do not have admin access. Contact the owner.')
        await signOut()
        setAuthState('login')
        return
      }
    }
    
    const profile = await getAdminProfile()
    setCurrentAdmin(profile)
    setAuthState('authenticated')
    
    // Update last login
    if (profile) {
      await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', profile.id)
    }
  }

  useEffect(() => {
    if (authState === 'authenticated') fetchAllData()
  }, [authState])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    const { user, error } = await signIn(authForm.email, authForm.password)
    
    if (error) {
      setAuthError(error)
      setAuthLoading(false)
      return
    }
    
    await checkAuth()
    setAuthLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: {
        data: { name: authForm.name }
      }
    })
    
    if (error) {
      setAuthError(error.message)
      setAuthLoading(false)
      return
    }
    
    // Try to link to existing admin record
    if (data.user) {
      const { admin } = await linkUserToAdmin(data.user.id, authForm.email)
      if (!admin) {
        setAuthError('No admin record found for this email. Ask an owner to add you first.')
        await signOut()
        setAuthLoading(false)
        return
      }
    }
    
    setAuthError('')
    setAuthLoading(false)
    // Auth state change listener will handle the rest
  }

  const handleLogout = async () => {
    await signOut()
    setAuthState('login')
    setCurrentAdmin(null)
  }

  const fetchAllData = async () => {
    setLoading(true)
    const [b, bk, mx, msg, av, md, rm, si, ad] = await Promise.all([
      supabase.from('beats').select('*').order('created_at', { ascending: false }),
      supabase.from('studio_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('mix_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('studio_availability').select('*').order('date', { ascending: true }),
      supabase.from('mix_demos').select('*').order('created_at', { ascending: false }),
      supabase.from('recent_mixes').select('*').order('created_at', { ascending: false }),
      supabase.from('site_images').select('*').order('created_at', { ascending: false }),
      getAllAdmins()
    ])
    setBeats(b.data || []); setBookings(bk.data || []); setMixRequests(mx.data || [])
    setMessages(msg.data || []); setAvailability(av.data || []); setMixDemos(md.data || [])
    setRecentMixes(rm.data || []); setSiteImages(si.data || []); setAdmins(ad.admins || [])
    setLoading(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (p) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p || 0)

  // Loading Screen
  if (authState === 'loading') {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // Login/Signup Screen
  if (authState === 'login' || authState === 'signup') {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#8B5CF6] opacity-[0.08] rounded-full" style={{ filter: isMobile ? 'blur(80px)' : 'blur(180px)' }} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <span className="text-3xl md:text-4xl block mb-3">🔐</span>
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              {authState === 'login' ? 'Admin Login' : 'Create Account'}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              {authState === 'login' ? 'Sign in to access the dashboard' : 'Sign up with your admin email'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={authState === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authState === 'signup' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={authForm.name} 
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} 
                  placeholder="Your name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" 
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input 
                type="email" 
                value={authForm.email} 
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} 
                placeholder="admin@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" 
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <input 
                type="password" 
                value={authForm.password} 
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} 
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" 
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</>
              ) : (
                authState === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setAuthState(authState === 'login' ? 'signup' : 'login'); setAuthError('') }}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              {authState === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            <a href="/" className="hover:text-white transition">← Back to site</a>
          </p>
        </motion.div>
      </main>
    )
  }

  // Main Dashboard
  const tabs = [
    { id: 'beats', label: 'Beats', icon: '🎵', count: beats.length },
    { id: 'availability', label: 'Calendar', icon: '📅', count: null },
    { id: 'bookings', label: 'Bookings', icon: '🎤', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'mixing', label: 'Mix', icon: '🎚️', count: mixRequests.filter(m => m.status === 'pending').length },
    { id: 'mixdemo', label: 'Demo', icon: '🔊', count: null },
    { id: 'recentmixes', label: 'Portfolio', icon: '💿', count: null },
    { id: 'images', label: 'Images', icon: '🖼️', count: null },
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
            {currentAdmin && (
              <span className="hidden md:inline text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full capitalize">
                {currentAdmin.role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {currentAdmin && (
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {currentAdmin.name}
              </div>
            )}
            <button onClick={fetchAllData} className="text-gray-400 hover:text-white transition text-xs md:text-sm flex items-center gap-1">
              🔄 <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition text-xs md:text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 relative">
        {/* Stats */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {stats.map(s => (
            <div key={s.label} className="flex-shrink-0 bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 min-w-[100px] md:min-w-0 md:flex-1">
              <p className="text-gray-500 text-[10px] md:text-sm mb-0.5 md:mb-1">{s.label}</p>
              <p className={`text-xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition whitespace-nowrap text-xs md:text-sm ${activeTab === tab.id ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
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
            {activeTab === 'availability' && <AvailabilityManager availability={availability} bookings={bookings} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'bookings' && <BookingsManager bookings={bookings} onRefresh={fetchAllData} formatPrice={formatPrice} formatDate={formatDate} />}
            {activeTab === 'mixing' && <MixRequestsManager requests={mixRequests} onRefresh={fetchAllData} formatPrice={formatPrice} formatDate={formatDate} />}
            {activeTab === 'mixdemo' && <MixDemoManager demos={mixDemos} onRefresh={fetchAllData} />}
            {activeTab === 'recentmixes' && <RecentMixesManager mixes={recentMixes} onRefresh={fetchAllData} isMobile={isMobile} />}
            {activeTab === 'images' && <SiteImagesManager images={siteImages} onRefresh={fetchAllData} />}
            {activeTab === 'messages' && <MessagesManager messages={messages} onRefresh={fetchAllData} formatDate={formatDate} />}
            {activeTab === 'admins' && currentAdmin?.role === 'owner' && (
              <AdminsManager admins={admins} currentAdmin={currentAdmin} onRefresh={fetchAllData} formatDate={formatDate} />
            )}
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

const FileUpload = ({ label, onUpload, uploading, preview, type = 'image' }) => {
  const ref = useRef(null)
  const accept = type === 'image' ? 'image/*' : 'audio/*'
  const icon = type === 'image' ? '🖼️' : '🎵'
  return (
    <div>
      <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{label}</label>
      <input ref={ref} type="file" accept={accept} onChange={e => onUpload(e.target.files?.[0])} className="hidden" />
      <div onClick={() => ref.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${preview ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
        {uploading ? <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
          : preview ? (
            <div className="flex items-center justify-center gap-3">
              {type === 'image' && <img src={preview} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <div className="text-left">
                <p className="text-green-400 text-sm">✓ Uploaded</p>
                <p className="text-gray-500 text-xs">Click to replace</p>
              </div>
            </div>
          ) : (
            <><span className="text-xl md:text-2xl block mb-1">{icon}</span><p className="text-gray-400 text-xs md:text-sm">Upload {type}</p></>
          )}
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
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

// ============ ADMINS MANAGER (Owner only) ============
function AdminsManager({ admins, currentAdmin, onRefresh, formatDate }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ email: '', name: '', role: 'admin' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => { setFormData({ email: '', name: '', role: 'admin' }); setError(''); setShowModal(true) }

  const handleSave = async () => {
    if (!formData.email || !formData.name) { setError('Fill all fields'); return }
    setSaving(true)
    setError('')
    
    const { admin, error: createError, needsSignup } = await createAdmin(formData.email, formData.name, formData.role)
    
    if (createError) {
      setError(createError)
      setSaving(false)
      return
    }
    
    setShowModal(false)
    onRefresh()
    
    if (needsSignup) {
      alert(`Admin "${formData.name}" added! They need to sign up with email: ${formData.email}`)
    }
    
    setSaving(false)
  }

  const toggleActive = async (admin) => {
    if (admin.id === currentAdmin.id) {
      alert("You can't deactivate yourself!")
      return
    }
    
    if (admin.is_active) {
      await deactivateAdmin(admin.id)
    } else {
      await reactivateAdmin(admin.id)
    }
    onRefresh()
  }

  const handleDelete = async (admin) => {
    if (admin.id === currentAdmin.id) {
      alert("You can't delete yourself!")
      return
    }
    if (!confirm(`Delete admin "${admin.name}"? This cannot be undone.`)) return
    
    await supabase.from('admins').delete().eq('id', admin.id)
    onRefresh()
  }

  const roleColors = {
    owner: 'bg-yellow-500/20 text-yellow-400',
    admin: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
    editor: 'bg-blue-500/20 text-blue-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold">Manage Admins</h2>
          <p className="text-gray-500 text-xs md:text-sm">Add or remove people with admin access</p>
        </div>
        <button onClick={openAdd} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-2">
          + Add Admin
        </button>
      </div>

      <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-4 mb-6">
        <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">💡 How it works</h3>
        <ul className="text-xs md:text-sm text-gray-400 space-y-1">
          <li>1. Add an admin with their email and name</li>
          <li>2. They sign up with that exact email</li>
          <li>3. Their account is automatically linked to admin access</li>
        </ul>
      </div>

      <div className="space-y-3 md:space-y-4">
        {admins.map(admin => (
          <div 
            key={admin.id} 
            className={`bg-white/[0.02] border rounded-xl md:rounded-2xl p-4 md:p-6 ${admin.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-lg md:text-xl">
                  {admin.avatar_url ? (
                    <img src={admin.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    admin.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base">{admin.name}</h3>
                    {admin.id === currentAdmin.id && (
                      <span className="text-[10px] md:text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm">{admin.email}</p>
                </div>
              </div>
              <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium capitalize ${roleColors[admin.role]}`}>
                {admin.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs md:text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className={admin.is_active ? 'text-green-400' : 'text-red-400'}>
                  {admin.is_active ? '● Active' : '○ Inactive'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Login</p>
                <p className="text-gray-300">{admin.last_login ? formatDate(admin.last_login) : 'Never'}</p>
              </div>
            </div>

            {admin.id !== currentAdmin.id && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button 
                  onClick={() => toggleActive(admin)}
                  className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition ${admin.is_active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                >
                  {admin.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
                <button 
                  onClick={() => handleDelete(admin)}
                  className="px-4 py-2 rounded-lg text-xs md:text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {admins.length === 0 && <EmptyState icon="👥" text="No admins found" />}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add New Admin">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <Input 
            label="Email" 
            required 
            type="email"
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            placeholder="admin@example.com" 
          />
          
          <Input 
            label="Name" 
            required 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            placeholder="John Doe" 
          />
          
          <Select 
            label="Role" 
            value={formData.role} 
            onChange={e => setFormData({ ...formData, role: e.target.value })} 
            options={[
              { value: 'admin', label: 'Admin - Full access' },
              { value: 'editor', label: 'Editor - Limited access' },
              { value: 'owner', label: 'Owner - Can manage admins' }
            ]} 
          />

          <div className="bg-white/5 rounded-xl p-4 text-xs md:text-sm text-gray-400">
            <p className="font-medium text-white mb-2">Role Permissions:</p>
            <ul className="space-y-1">
              <li><span className="text-blue-400">Editor:</span> Can manage content</li>
              <li><span className="text-[#8B5CF6]">Admin:</span> Full content access</li>
              <li><span className="text-yellow-400">Owner:</span> Can add/remove admins</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50 text-sm"
          >
            {saving ? 'Adding...' : 'Add Admin'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ============ OTHER MANAGERS (same as before, abbreviated) ============
// BeatsManager, AvailabilityManager, BookingsManager, MixRequestsManager, 
// MixDemoManager, RecentMixesManager, MessagesManager, SiteImagesManager
// ... (these remain the same as in the previous optimized version)

function BeatsManager({ beats, onRefresh, formatPrice, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingBeat, setEditingBeat] = useState(null)
  const [formData, setFormData] = useState({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99, is_featured: false, is_sold: false, audio_url: '', image_url: '' })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const genres = ['Trap', 'Drill', 'R&B', 'Jersey', 'Rap', 'Pop', 'Afrobeat']
  const keys = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm', 'Bb', 'Eb', 'Ab']

  const openAdd = () => { setEditingBeat(null); setFormData({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99, is_featured: false, is_sold: false, audio_url: '', image_url: '' }); setShowModal(true) }
  const openEdit = (b) => { setEditingBeat(b); setFormData({ ...b, tags: b.tags || [] }); setShowModal(true) }

  const addTag = () => { if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) { setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] }); setTagInput('') } }
  const removeTag = (t) => setFormData({ ...formData, tags: formData.tags.filter(x => x !== t) })

  const uploadFile = async (file, bucket, setUploading, field) => {
    if (!file) return
    const maxSize = bucket === 'beats' ? 50 : 5
    if (file.size > maxSize * 1024 * 1024) { alert(`Max ${maxSize}MB`); return }
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from(bucket).upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      setFormData(f => ({ ...f, [field]: data.publicUrl }))
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { alert('Enter title'); return }
    setSaving(true)
    const { error } = editingBeat ? await supabase.from('beats').update(formData).eq('id', editingBeat.id) : await supabase.from('beats').insert([formData])
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
        <button onClick={openAdd} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm">+ Add</button>
      </div>

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
                  <p className="text-xs text-gray-500">{b.genre} • {b.bpm} BPM</p>
                </div>
                <p className="font-bold text-sm">{formatPrice(b.price_mp3)}</p>
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
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>{['Beat', 'Genre', 'BPM', 'Price', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-6 py-4 text-sm font-medium text-gray-400">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {beats.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden">{b.image_url ? <img src={b.image_url} alt="" className="w-full h-full object-cover" /> : <span>🎵</span>}</div><div><p className="font-medium">{b.title}</p><p className="text-xs text-gray-500">{b.tags?.slice(0, 2).join(', ')}</p></div></div></td>
                    <td className="px-6 py-4 text-sm">{b.genre}</td>
                    <td className="px-6 py-4 text-sm">{b.bpm}</td>
                    <td className="px-6 py-4 text-sm">{formatPrice(b.price_mp3)}</td>
                    <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => toggle(b, 'is_featured')} className={`text-xs px-2 py-1 rounded-full ${b.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500'}`}>{b.is_featured ? '★' : '☆'}</button><button onClick={() => toggle(b, 'is_sold')} className={`text-xs px-2 py-1 rounded-full ${b.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{b.is_sold ? 'Sold' : 'Avail'}</button></div></td>
                    <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => openEdit(b)} className="p-2 text-gray-400 hover:text-white">✏️</button><button onClick={() => handleDelete(b)} className="p-2 text-gray-400 hover:text-red-400">🗑️</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {beats.length === 0 && <EmptyState icon="🎵" text="No beats yet" />}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editingBeat ? 'Edit Beat' : 'Add Beat'}>
        <div className="space-y-4">
          <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Beat title" />
          <div className="grid grid-cols-3 gap-3">
            <Select label="Genre" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} options={genres} />
            <Input label="BPM" type="number" value={formData.bpm} onChange={e => setFormData({ ...formData, bpm: parseInt(e.target.value) || 0 })} />
            <Select label="Key" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} options={keys} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FileUpload label="Audio" type="audio" uploading={uploadingAudio} preview={formData.audio_url} onUpload={f => uploadFile(f, 'beats', setUploadingAudio, 'audio_url')} />
            <FileUpload label="Cover" type="image" uploading={uploadingImage} preview={formData.image_url} onUpload={f => uploadFile(f, 'images', setUploadingImage, 'image_url')} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">{formData.tags.map(t => <span key={t} className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-1 rounded-full text-xs flex items-center gap-1">#{t}<button onClick={() => removeTag(t)}>×</button></span>)}</div>
            <div className="flex gap-2"><input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Add tag..." /><button onClick={addTag} className="bg-white/10 px-4 py-2 rounded-xl text-sm">Add</button></div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Prices (EUR)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[['MP3', 'price_mp3'], ['WAV', 'price_wav'], ['Unlimited', 'price_stems'], ['Exclusive', 'price_exclusive']].map(([l, k]) => <div key={k}><p className="text-[10px] text-gray-500 mb-1">{l}</p><input type="number" step="0.01" value={formData[k]} onChange={e => setFormData({ ...formData, [k]: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" /></div>)}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#8B5CF6] rounded-xl font-semibold disabled:opacity-50 text-sm">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </Modal>
    </div>
  )
}

// Placeholder for other managers - they stay the same as the optimized version

