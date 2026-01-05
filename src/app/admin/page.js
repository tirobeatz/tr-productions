'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('beats')
  const [loading, setLoading] = useState(false)
  
  const [beats, setBeats] = useState([])
  const [bookings, setBookings] = useState([])
  const [mixRequests, setMixRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [availability, setAvailability] = useState([])
  const [mixDemos, setMixDemos] = useState([])
  const [recentMixes, setRecentMixes] = useState([])
  const [siteImages, setSiteImages] = useState([])

  const ADMIN_PASSWORD = 'tr2024admin'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('tr-admin-auth', 'true')
    } else {
      alert('Wrong password!')
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem('tr-admin-auth')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchAllData()
  }, [isAuthenticated])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchBeats(), fetchBookings(), fetchMixRequests(), 
      fetchMessages(), fetchAvailability(), fetchMixDemos(), 
      fetchRecentMixes(), fetchSiteImages()
  ])
  setLoading(false)
}

  const fetchBeats = async () => {
    const { data } = await supabase.from('beats').select('*').order('created_at', { ascending: false })
    setBeats(data || [])
  }

  const fetchBookings = async () => {
    const { data } = await supabase.from('studio_bookings').select('*').order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const fetchMixRequests = async () => {
    const { data } = await supabase.from('mix_requests').select('*').order('created_at', { ascending: false })
    setMixRequests(data || [])
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
  }

  const fetchAvailability = async () => {
    const { data } = await supabase.from('studio_availability').select('*').order('date', { ascending: true })
    setAvailability(data || [])
  }

  const fetchMixDemos = async () => {
    const { data } = await supabase.from('mix_demos').select('*').order('created_at', { ascending: false })
    setMixDemos(data || [])
  }

  const fetchRecentMixes = async () => {
    const { data } = await supabase.from('recent_mixes').select('*').order('created_at', { ascending: false })
    setRecentMixes(data || [])
  }

  const fetchSiteImages = async () => {
   const { data } = await supabase.from('site_images').select('*').order('created_at', { ascending: false })
   setSiteImages(data || [])
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('tr-admin-auth')
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatPrice = (price) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price || 0)

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <span className="text-4xl block mb-4">🔐</span>
            <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition" />
            <button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition">Login</button>
          </form>
          <p className="text-center text-gray-600 text-xs mt-6"><a href="/" className="hover:text-white transition">← Back to site</a></p>
        </motion.div>
      </main>
    )
  }

  const tabs = [
    { id: 'beats', label: 'Beats', icon: '🎵', count: beats.length },
    { id: 'availability', label: 'Availability', icon: '📅', count: null },
    { id: 'bookings', label: 'Bookings', icon: '🎤', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'mixing', label: 'Mix Requests', icon: '🎚️', count: mixRequests.filter(m => m.status === 'pending').length },
    { id: 'mixdemo', label: 'Mix Demo', icon: '🔊', count: null },
    { id: 'recentmixes', label: 'Recent Mixes', icon: '💿', count: recentMixes.length },
    { id: 'images', label: 'Site Images', icon: '🖼️', count: siteImages.length },
    { id: 'messages', label: 'Messages', icon: '💬', count: messages.filter(m => !m.is_read).length },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold">TR <span className="text-[#8B5CF6]">Admin</span></a>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchAllData} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2">🔄 Refresh</button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">Total Beats</p>
            <p className="text-3xl font-bold">{beats.length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">Available Beats</p>
            <p className="text-3xl font-bold text-green-500">{beats.filter(b => !b.is_sold).length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">Pending Bookings</p>
            <p className="text-3xl font-bold text-yellow-500">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">Mix Requests</p>
            <p className="text-3xl font-bold text-blue-500">{mixRequests.filter(m => m.status === 'pending').length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">Unread Messages</p>
            <p className="text-3xl font-bold text-purple-500">{messages.filter(m => !m.is_read).length}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          </div>
        )}

        {!loading && activeTab === 'beats' && <BeatsManager beats={beats} onRefresh={fetchBeats} formatPrice={formatPrice} />}
        {!loading && activeTab === 'availability' && <AvailabilityManager availability={availability} bookings={bookings} onRefresh={fetchAvailability} />}
        {!loading && activeTab === 'bookings' && <BookingsManager bookings={bookings} onRefresh={fetchBookings} formatPrice={formatPrice} formatDate={formatDate} />}
        {!loading && activeTab === 'mixing' && <MixRequestsManager requests={mixRequests} onRefresh={fetchMixRequests} formatPrice={formatPrice} formatDate={formatDate} />}
        {!loading && activeTab === 'mixdemo' && <MixDemoManager demos={mixDemos} onRefresh={fetchMixDemos} />}
        {!loading && activeTab === 'recentmixes' && <RecentMixesManager mixes={recentMixes} onRefresh={fetchRecentMixes} />}
        {!loading && activeTab === 'images' && <SiteImagesManager images={siteImages} onRefresh={fetchSiteImages} />}
        {!loading && activeTab === 'messages' && <MessagesManager messages={messages} onRefresh={fetchMessages} formatDate={formatDate} />}
      </div>
    </main>
  )
}

// ============ BEATS MANAGER ============
function BeatsManager({ beats, onRefresh, formatPrice }) {
  const [showModal, setShowModal] = useState(false)
  const [editingBeat, setEditingBeat] = useState(null)
  const [formData, setFormData] = useState({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99, is_featured: false, is_sold: false, audio_url: '', image_url: '' })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const audioInputRef = useRef(null)
  const imageInputRef = useRef(null)

  const genres = ['Trap', 'Drill', 'R&B', 'Jersey', 'Rap', 'Pop', 'Afrobeat']
  const keys = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm', 'Bb', 'Eb', 'Ab']

  const openAddModal = () => {
    setEditingBeat(null)
    setFormData({ title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [], price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99, is_featured: false, is_sold: false, audio_url: '', image_url: '' })
    setShowModal(true)
  }

  const openEditModal = (beat) => {
    setEditingBeat(beat)
    setFormData({ title: beat.title || '', genre: beat.genre || 'Trap', bpm: beat.bpm || 140, key: beat.key || 'Cm', tags: beat.tags || [], price_mp3: beat.price_mp3 || 29.99, price_wav: beat.price_wav || 49.99, price_stems: beat.price_stems || 99.99, price_exclusive: beat.price_exclusive || 299.99, is_featured: beat.is_featured || false, is_sold: beat.is_sold || false, audio_url: beat.audio_url || '', image_url: beat.image_url || '' })
    setShowModal(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.includes('audio')) { alert('Please select an audio file'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Max 50MB'); return }
    setUploadingAudio(true)
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('beats').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('beats').getPublicUrl(fileName)
      setFormData({ ...formData, audio_url: urlData.publicUrl })
    } catch (error) { alert('Error: ' + error.message) }
    setUploadingAudio(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.includes('image')) { alert('Please select an image'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return }
    setUploadingImage(true)
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      setFormData({ ...formData, image_url: urlData.publicUrl })
    } catch (error) { alert('Error: ' + error.message) }
    setUploadingImage(false)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) { alert('Enter title'); return }
    setSaving(true)
    if (editingBeat) {
      const { error } = await supabase.from('beats').update(formData).eq('id', editingBeat.id)
      if (error) alert('Error: ' + error.message)
      else { setShowModal(false); onRefresh() }
    } else {
      const { error } = await supabase.from('beats').insert([formData])
      if (error) alert('Error: ' + error.message)
      else { setShowModal(false); onRefresh() }
    }
    setSaving(false)
  }

  const handleDelete = async (beat) => {
    if (!confirm(`Delete "${beat.title}"?`)) return
    const { error } = await supabase.from('beats').delete().eq('id', beat.id)
    if (!error) onRefresh()
  }

  const toggleFeatured = async (beat) => { await supabase.from('beats').update({ is_featured: !beat.is_featured }).eq('id', beat.id); onRefresh() }
  const toggleSold = async (beat) => { await supabase.from('beats').update({ is_sold: !beat.is_sold }).eq('id', beat.id); onRefresh() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Beats</h2>
        <button onClick={openAddModal} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"><span>+</span> Add Beat</button>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Beat</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Genre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">BPM</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Key</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {beats.map((beat) => (
                <tr key={beat.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden">
                        {beat.image_url ? <img src={beat.image_url} alt="" className="w-full h-full object-cover" /> : <span>🎵</span>}
                      </div>
                      <div>
                        <p className="font-medium">{beat.title}</p>
                        <div className="flex items-center gap-2">
                          {beat.audio_url && <span className="text-green-500 text-xs">🔊</span>}
                          <p className="text-xs text-gray-500">{beat.tags?.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{beat.genre}</td>
                  <td className="px-6 py-4 text-sm">{beat.bpm}</td>
                  <td className="px-6 py-4 text-sm">{beat.key}</td>
                  <td className="px-6 py-4 text-sm">{formatPrice(beat.price_mp3)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFeatured(beat)} className={`text-xs px-2 py-1 rounded-full transition ${beat.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>{beat.is_featured ? '★ Featured' : '☆ Feature'}</button>
                      <button onClick={() => toggleSold(beat)} className={`text-xs px-2 py-1 rounded-full transition ${beat.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{beat.is_sold ? 'Sold' : 'Available'}</button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(beat)} className="text-gray-400 hover:text-white transition p-2">✏️</button>
                      <button onClick={() => handleDelete(beat)} className="text-gray-400 hover:text-red-400 transition p-2">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {beats.length === 0 && <div className="text-center py-12 text-gray-500">No beats yet. Click "Add Beat" to create one.</div>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">{editingBeat ? 'Edit Beat' : 'Add New Beat'}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder="Beat title" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Genre</label>
                      <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3">{genres.map(g => <option key={g} value={g}>{g}</option>)}</select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">BPM</label>
                      <input type="number" value={formData.bpm} onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Key</label>
                      <select value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3">{keys.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Audio File</label>
                      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                      <div onClick={() => audioInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${formData.audio_url ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
                        {uploadingAudio ? <motion.div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : formData.audio_url ? <><span className="text-2xl block mb-1">✅</span><p className="text-green-400 text-sm">Audio uploaded</p></> : <><span className="text-2xl block mb-1">🎵</span><p className="text-gray-400 text-sm">Upload audio</p></>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Cover Image</label>
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div onClick={() => imageInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${formData.image_url ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
                        {uploadingImage ? <motion.div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : formData.image_url ? <><img src={formData.image_url} alt="" className="w-12 h-12 object-cover rounded-lg mx-auto mb-1" /><p className="text-green-400 text-sm">Image uploaded</p></> : <><span className="text-2xl block mb-1">🖼️</span><p className="text-gray-400 text-sm">Upload image</p></>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">{formData.tags.map(tag => <span key={tag} className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 rounded-full text-sm flex items-center gap-2">#{tag}<button onClick={() => removeTag(tag)}>×</button></span>)}</div>
                    <div className="flex gap-2">
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" placeholder="Add tag..." />
                      <button onClick={addTag} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition">Add</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prices (EUR)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><p className="text-xs text-gray-500 mb-1">MP3</p><input type="number" step="0.01" value={formData.price_mp3} onChange={(e) => setFormData({ ...formData, price_mp3: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" /></div>
                      <div><p className="text-xs text-gray-500 mb-1">WAV</p><input type="number" step="0.01" value={formData.price_wav} onChange={(e) => setFormData({ ...formData, price_wav: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" /></div>
                      <div><p className="text-xs text-gray-500 mb-1">Unlimited</p><input type="number" step="0.01" value={formData.price_stems} onChange={(e) => setFormData({ ...formData, price_stems: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" /></div>
                      <div><p className="text-xs text-gray-500 mb-1">Exclusive</p><input type="number" step="0.01" value={formData.price_exclusive} onChange={(e) => setFormData({ ...formData, price_exclusive: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" /></div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm">Featured</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_sold} onChange={(e) => setFormData({ ...formData, is_sold: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm">Sold</span></label>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white transition">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold transition disabled:opacity-50">{saving ? 'Saving...' : (editingBeat ? 'Update' : 'Add Beat')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ AVAILABILITY MANAGER ============
function AvailabilityManager({ availability, bookings, onRefresh }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHours, setSelectedHours] = useState([])
  const [isFullyBlocked, setIsFullyBlocked] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const HOURS = Array.from({ length: 13 }, (_, i) => i + 10)

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  const formatDateKey = (date) => date.toISOString().split('T')[0]
  const getAvailabilityForDate = (date) => availability.find(a => a.date === formatDateKey(date))
  const getBookingsForDate = (date) => bookings.filter(b => b.date === formatDateKey(date) && b.status !== 'cancelled')

  const handleDateClick = (date) => {
    if (!date || date < new Date().setHours(0, 0, 0, 0)) return
    setSelectedDate(date)
    const existing = getAvailabilityForDate(date)
    if (existing) { setSelectedHours(existing.blocked_hours || []); setIsFullyBlocked(existing.is_fully_blocked || false); setNote(existing.note || '') }
    else { setSelectedHours([]); setIsFullyBlocked(false); setNote('') }
  }

  const toggleHour = (hour) => {
    if (selectedHours.includes(hour)) setSelectedHours(selectedHours.filter(h => h !== hour))
    else setSelectedHours([...selectedHours, hour])
  }

  const handleSave = async () => {
    if (!selectedDate) return
    setSaving(true)
    const dateKey = formatDateKey(selectedDate)
    const existing = getAvailabilityForDate(selectedDate)
    if (existing) {
      await supabase.from('studio_availability').update({ blocked_hours: selectedHours, is_fully_blocked: isFullyBlocked, note }).eq('id', existing.id)
    } else {
      await supabase.from('studio_availability').insert([{ date: dateKey, blocked_hours: selectedHours, is_fully_blocked: isFullyBlocked, note }])
    }
    setSaving(false)
    onRefresh()
  }

  const handleClear = async () => {
    if (!selectedDate) return
    const existing = getAvailabilityForDate(selectedDate)
    if (!existing || !confirm('Clear availability?')) return
    await supabase.from('studio_availability').delete().eq('id', existing.id)
    setSelectedHours([]); setIsFullyBlocked(false); setNote('')
    onRefresh()
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Studio Availability</h2>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-white/10 rounded-lg">←</button>
            <h3 className="font-semibold text-lg">{monthName}</h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-white/10 rounded-lg">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) return <div key={index} className="aspect-square" />
              const isPast = date < new Date().setHours(0, 0, 0, 0)
              const isSelected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate)
              const avail = getAvailabilityForDate(date)
              const hasBookings = getBookingsForDate(date).length > 0
              const isBlocked = avail?.is_fully_blocked
              const hasBlockedHours = avail?.blocked_hours?.length > 0
              return (
                <button key={index} onClick={() => handleDateClick(date)} disabled={isPast} className={`aspect-square rounded-lg text-sm font-medium transition relative ${isPast ? 'text-gray-700 cursor-not-allowed' : isSelected ? 'bg-[#8B5CF6] text-white' : isBlocked ? 'bg-red-500/20 text-red-400' : hasBlockedHours ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}>
                  {date.getDate()}
                  {hasBookings && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500/20 rounded" /> Blocked</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500/20 rounded" /> Partial</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Booked</div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          {selectedDate ? (
            <>
              <h3 className="font-semibold text-lg mb-4">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              {getBookingsForDate(selectedDate).length > 0 && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-medium mb-2">Existing Bookings:</p>
                  {getBookingsForDate(selectedDate).map(b => <p key={b.id} className="text-sm text-gray-400">{b.name} - {b.hours?.map(h => `${h}:00`).join(', ')}</p>)}
                </div>
              )}
              <label className="flex items-center gap-3 mb-6 cursor-pointer"><input type="checkbox" checked={isFullyBlocked} onChange={(e) => setIsFullyBlocked(e.target.checked)} className="w-5 h-5 rounded" /><span className="font-medium">Block entire day</span></label>
              {!isFullyBlocked && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">Block hours:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {HOURS.map(hour => {
                      const isBooked = getBookingsForDate(selectedDate).some(b => b.hours?.includes(hour))
                      return <button key={hour} onClick={() => !isBooked && toggleHour(hour)} disabled={isBooked} className={`py-2 rounded-lg text-sm font-medium transition ${isBooked ? 'bg-green-500/20 text-green-400 cursor-not-allowed' : selectedHours.includes(hour) ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10'}`}>{hour}:00</button>
                    })}
                  </div>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., Holiday" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={handleClear} className="px-6 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white transition">Clear</button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500"><span className="text-4xl block mb-4">📅</span><p>Select a date</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ BOOKINGS MANAGER ============
function BookingsManager({ bookings, onRefresh, formatPrice, formatDate }) {
  const updateStatus = async (b, status) => { await supabase.from('studio_bookings').update({ status }).eq('id', b.id); onRefresh() }
  const deleteBooking = async (b) => { if (!confirm('Delete?')) return; await supabase.from('studio_bookings').delete().eq('id', b.id); onRefresh() }
  const statusColors = { pending: 'bg-yellow-500/20 text-yellow-400', confirmed: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400', cancelled: 'bg-red-500/20 text-red-400' }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Studio Bookings</h2>
      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-semibold text-lg">{b.name}</h3><p className="text-gray-500 text-sm">{b.email}</p>{b.phone && <p className="text-gray-500 text-sm">{b.phone}</p>}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><p className="text-gray-500 text-xs">Date</p><p className="font-medium">{new Date(b.date).toLocaleDateString('de-DE')}</p></div>
              <div><p className="text-gray-500 text-xs">Hours</p><p className="font-medium">{b.hours?.map(h => `${h}:00`).join(', ')}</p></div>
              <div><p className="text-gray-500 text-xs">Total</p><p className="font-medium text-[#8B5CF6]">{formatPrice(b.total_price)}</p></div>
            </div>
            {b.add_mix_master && <p className="text-sm text-purple-400 mb-4">+ Mix & Master</p>}
            {b.message && <p className="text-gray-400 text-sm mb-4 bg-white/5 p-3 rounded-xl">{b.message}</p>}
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 flex-1">Received: {formatDate(b.created_at)}</p>
              <select value={b.status} onChange={(e) => updateStatus(b, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => deleteBooking(b)} className="text-gray-400 hover:text-red-400 p-2">🗑️</button>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div className="text-center py-12 text-gray-500">No bookings yet.</div>}
      </div>
    </div>
  )
}

// ============ MIX REQUESTS MANAGER ============
function MixRequestsManager({ requests, onRefresh, formatPrice, formatDate }) {
  const updateStatus = async (r, status) => { await supabase.from('mix_requests').update({ status }).eq('id', r.id); onRefresh() }
  const deleteRequest = async (r) => { if (!confirm('Delete?')) return; await supabase.from('mix_requests').delete().eq('id', r.id); onRefresh() }
  const statusColors = { pending: 'bg-yellow-500/20 text-yellow-400', in_progress: 'bg-blue-500/20 text-blue-400', completed: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mix & Master Requests</h2>
      <div className="space-y-4">
        {requests.map(r => (
          <div key={r.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-semibold text-lg">{r.track_name}</h3><p className="text-gray-500 text-sm">by {r.name} ({r.email})</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div><p className="text-gray-500 text-xs">Genre</p><p className="font-medium">{r.genre}</p></div>
              <div><p className="text-gray-500 text-xs">Delivery</p><p className="font-medium">{r.rush_delivery ? '⚡ Rush' : 'Standard'}</p></div>
              <div><p className="text-gray-500 text-xs">Total</p><p className="font-medium text-[#8B5CF6]">{formatPrice(r.total_price)}</p></div>
            </div>
            {r.reference_url && <p className="text-sm mb-2"><span className="text-gray-500">Reference:</span> <a href={r.reference_url} target="_blank" className="text-[#8B5CF6] hover:underline">{r.reference_url}</a></p>}
            {r.notes && <p className="text-gray-400 text-sm mb-4 bg-white/5 p-3 rounded-xl">{r.notes}</p>}
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 flex-1">Received: {formatDate(r.created_at)}</p>
              <select value={r.status} onChange={(e) => updateStatus(r, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => deleteRequest(r)} className="text-gray-400 hover:text-red-400 p-2">🗑️</button>
            </div>
          </div>
        ))}
        {requests.length === 0 && <div className="text-center py-12 text-gray-500">No mix requests yet.</div>}
      </div>
    </div>
  )
}

// ============ MIX DEMO MANAGER ============
function MixDemoManager({ demos, onRefresh }) {
  const [uploading, setUploading] = useState({ raw: false, mixed: false })
  const [currentDemo, setCurrentDemo] = useState(null)
  const [audioPlaying, setAudioPlaying] = useState(null)
  const rawInputRef = useRef(null)
  const mixedInputRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => { if (demos.length > 0) setCurrentDemo(demos.find(d => d.is_active) || demos[0]) }, [demos])

  const handleUpload = async (type, file) => {
    if (!file || !currentDemo) return
    if (!file.type.includes('audio')) { alert('Select audio file'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Max 50MB'); return }
    setUploading({ ...uploading, [type]: true })
    try {
      const fileName = `mix-demo-${type}-${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('beats').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('beats').getPublicUrl(fileName)
      const updateField = type === 'raw' ? 'raw_audio_url' : 'mixed_audio_url'
      await supabase.from('mix_demos').update({ [updateField]: urlData.publicUrl }).eq('id', currentDemo.id)
      onRefresh()
    } catch (error) { alert('Error: ' + error.message) }
    setUploading({ ...uploading, [type]: false })
  }

  const playAudio = (url, type) => {
    if (audioRef.current) {
      if (audioPlaying === type) { audioRef.current.pause(); setAudioPlaying(null) }
      else { audioRef.current.src = url; audioRef.current.play(); setAudioPlaying(type) }
    }
  }

  const deleteAudio = async (type) => {
    if (!currentDemo || !confirm(`Delete ${type} audio?`)) return
    const updateField = type === 'raw' ? 'raw_audio_url' : 'mixed_audio_url'
    await supabase.from('mix_demos').update({ [updateField]: null }).eq('id', currentDemo.id)
    onRefresh()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mix Demo Audio</h2>
      <p className="text-gray-500 mb-8">Upload before/after audio for the Mix & Master page preview.</p>
      <audio ref={audioRef} onEnded={() => setAudioPlaying(null)} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-1">🔇 Raw Recording</h3>
          <p className="text-gray-500 text-sm mb-4">Unprocessed audio</p>
          {currentDemo?.raw_audio_url ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                <button onClick={() => playAudio(currentDemo.raw_audio_url, 'raw')} className={`w-12 h-12 rounded-full flex items-center justify-center ${audioPlaying === 'raw' ? 'bg-[#8B5CF6]' : 'bg-white/10 hover:bg-white/20'}`}>{audioPlaying === 'raw' ? '❚❚' : '▶'}</button>
                <div><p className="text-sm text-green-400">✓ Uploaded</p><p className="text-xs text-gray-500 truncate">{currentDemo.raw_audio_url.split('/').pop()}</p></div>
              </div>
              <div className="flex gap-2">
                <input ref={rawInputRef} type="file" accept="audio/*" onChange={(e) => handleUpload('raw', e.target.files?.[0])} className="hidden" />
                <button onClick={() => rawInputRef.current?.click()} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm">{uploading.raw ? 'Uploading...' : 'Replace'}</button>
                <button onClick={() => deleteAudio('raw')} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm">Delete</button>
              </div>
            </div>
          ) : (
            <div>
              <input ref={rawInputRef} type="file" accept="audio/*" onChange={(e) => handleUpload('raw', e.target.files?.[0])} className="hidden" />
              <div onClick={() => rawInputRef.current?.click()} className="border-2 border-dashed border-white/10 hover:border-[#8B5CF6]/30 rounded-xl p-8 text-center cursor-pointer">
                {uploading.raw ? <motion.div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : <><span className="text-4xl block mb-2">📤</span><p className="text-gray-400">Upload raw audio</p></>}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white/[0.02] border border-[#8B5CF6]/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-1">🔊 Mixed & Mastered</h3>
          <p className="text-gray-500 text-sm mb-4">Professional mix</p>
          {currentDemo?.mixed_audio_url ? (
            <div className="space-y-4">
              <div className="bg-[#8B5CF6]/10 rounded-xl p-4 flex items-center gap-4">
                <button onClick={() => playAudio(currentDemo.mixed_audio_url, 'mixed')} className={`w-12 h-12 rounded-full flex items-center justify-center ${audioPlaying === 'mixed' ? 'bg-[#8B5CF6]' : 'bg-[#8B5CF6]/30 hover:bg-[#8B5CF6]/50'}`}>{audioPlaying === 'mixed' ? '❚❚' : '▶'}</button>
                <div><p className="text-sm text-green-400">✓ Uploaded</p><p className="text-xs text-gray-500 truncate">{currentDemo.mixed_audio_url.split('/').pop()}</p></div>
              </div>
              <div className="flex gap-2">
                <input ref={mixedInputRef} type="file" accept="audio/*" onChange={(e) => handleUpload('mixed', e.target.files?.[0])} className="hidden" />
                <button onClick={() => mixedInputRef.current?.click()} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm">{uploading.mixed ? 'Uploading...' : 'Replace'}</button>
                <button onClick={() => deleteAudio('mixed')} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm">Delete</button>
              </div>
            </div>
          ) : (
            <div>
              <input ref={mixedInputRef} type="file" accept="audio/*" onChange={(e) => handleUpload('mixed', e.target.files?.[0])} className="hidden" />
              <div onClick={() => mixedInputRef.current?.click()} className="border-2 border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 rounded-xl p-8 text-center cursor-pointer">
                {uploading.mixed ? <motion.div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : <><span className="text-4xl block mb-2">📤</span><p className="text-gray-400">Upload mixed audio</p></>}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 p-4 bg-white/[0.02] border border-white/10 rounded-xl">
        <h4 className="font-medium mb-2">Status</h4>
        <div className="flex items-center gap-4 text-sm">
          <span className={currentDemo?.raw_audio_url ? 'text-green-400' : 'text-gray-500'}>{currentDemo?.raw_audio_url ? '✓' : '○'} Raw Audio</span>
          <span className={currentDemo?.mixed_audio_url ? 'text-green-400' : 'text-gray-500'}>{currentDemo?.mixed_audio_url ? '✓' : '○'} Mixed Audio</span>
          <span className={currentDemo?.raw_audio_url && currentDemo?.mixed_audio_url ? 'text-green-400' : 'text-yellow-400'}>{currentDemo?.raw_audio_url && currentDemo?.mixed_audio_url ? '✓ Ready' : '⚠ Upload both'}</span>
        </div>
      </div>
    </div>
  )
}

// ============ RECENT MIXES MANAGER ============
function RecentMixesManager({ mixes, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [editingMix, setEditingMix] = useState(null)
  const [formData, setFormData] = useState({ title: '', artist: '', genre: '', image_url: '', audio_url: '', color: 'from-purple-500/20', is_visible: true })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const imageInputRef = useRef(null)
  const audioInputRef = useRef(null)

  const colors = [
    { value: 'from-purple-500/20', label: 'Purple' }, { value: 'from-pink-500/20', label: 'Pink' },
    { value: 'from-blue-500/20', label: 'Blue' }, { value: 'from-red-500/20', label: 'Red' },
    { value: 'from-green-500/20', label: 'Green' }, { value: 'from-yellow-500/20', label: 'Yellow' },
    { value: 'from-orange-500/20', label: 'Orange' }, { value: 'from-cyan-500/20', label: 'Cyan' },
  ]
  const genres = ['Hip-Hop', 'Trap', 'Drill', 'R&B', 'Pop', 'Afrobeat', 'Other']

  const openAddModal = () => { setEditingMix(null); setFormData({ title: '', artist: '', genre: '', image_url: '', audio_url: '', color: 'from-purple-500/20', is_visible: true }); setShowModal(true) }
  const openEditModal = (mix) => { setEditingMix(mix); setFormData({ title: mix.title || '', artist: mix.artist || '', genre: mix.genre || '', image_url: mix.image_url || '', audio_url: mix.audio_url || '', color: mix.color || 'from-purple-500/20', is_visible: mix.is_visible !== false }); setShowModal(true) }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.includes('image')) { alert('Select image'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return }
    setUploadingImage(true)
    try {
      const fileName = `mix-cover-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      setFormData({ ...formData, image_url: urlData.publicUrl })
    } catch (error) { alert('Error: ' + error.message) }
    setUploadingImage(false)
  }

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.includes('audio')) { alert('Select audio'); return }
    if (file.size > 50 * 1024 * 1024) { alert('Max 50MB'); return }
    setUploadingAudio(true)
    try {
      const fileName = `mix-audio-${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('beats').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('beats').getPublicUrl(fileName)
      setFormData({ ...formData, audio_url: urlData.publicUrl })
    } catch (error) { alert('Error: ' + error.message) }
    setUploadingAudio(false)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.artist || !formData.genre) { alert('Fill title, artist, genre'); return }
    setSaving(true)
    if (editingMix) {
      const { error } = await supabase.from('recent_mixes').update(formData).eq('id', editingMix.id)
      if (error) alert('Error: ' + error.message)
      else { setShowModal(false); onRefresh() }
    } else {
      const { error } = await supabase.from('recent_mixes').insert([formData])
      if (error) alert('Error: ' + error.message)
      else { setShowModal(false); onRefresh() }
    }
    setSaving(false)
  }

  const handleDelete = async (mix) => { if (!confirm(`Delete "${mix.title}"?`)) return; await supabase.from('recent_mixes').delete().eq('id', mix.id); onRefresh() }
  const toggleVisibility = async (mix) => { await supabase.from('recent_mixes').update({ is_visible: !mix.is_visible }).eq('id', mix.id); onRefresh() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Recent Mixes</h2><p className="text-gray-500 text-sm">Portfolio for Mix & Master page</p></div>
        <button onClick={openAddModal} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-xl font-semibold flex items-center gap-2"><span>+</span> Add Mix</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mixes.map((mix) => (
          <div key={mix.id} className={`bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden ${!mix.is_visible ? 'opacity-50' : ''}`}>
            <div className={`aspect-square bg-gradient-to-br ${mix.color} to-[#050505] flex items-center justify-center relative`}>
              {mix.image_url ? <img src={mix.image_url} alt={mix.title} className="w-full h-full object-cover" /> : <span className="text-5xl opacity-30">🎵</span>}
              {mix.audio_url && <div className="absolute bottom-2 right-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">🔊</div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{mix.title}</h3>
              <p className="text-gray-500 text-sm">{mix.artist} - {mix.genre}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEditModal(mix)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">Edit</button>
                <button onClick={() => toggleVisibility(mix)} className={`px-3 py-2 rounded-lg text-sm ${mix.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{mix.is_visible ? '👁' : '👁‍🗨'}</button>
                <button onClick={() => handleDelete(mix)} className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm">🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {mixes.length === 0 && <div className="col-span-4 text-center py-12 text-gray-500"><span className="text-5xl block mb-4">💿</span><p>No mixes yet. Add your portfolio!</p></div>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">{editingMix ? 'Edit Mix' : 'Add New Mix'}</h2>
                <div className="space-y-4">
                  <div><label className="block text-sm text-gray-400 mb-2">Track Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" placeholder="e.g. Midnight Run" /></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Artist *</label><input type="text" value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" placeholder="e.g. Jay Flex" /></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Genre *</label><select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"><option value="">Select</option>{genres.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Color</label><div className="grid grid-cols-4 gap-2">{colors.map((c) => <button key={c.value} onClick={() => setFormData({ ...formData, color: c.value })} className={`h-10 rounded-lg bg-gradient-to-br ${c.value} to-[#050505] border-2 ${formData.color === c.value ? 'border-white' : 'border-transparent hover:border-white/30'}`} />)}</div></div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cover Image</label>
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div onClick={() => imageInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${formData.image_url ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
                      {uploadingImage ? <motion.div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : formData.image_url ? <div className="flex items-center gap-3"><img src={formData.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" /><div className="text-left"><p className="text-green-400 text-sm">Uploaded</p><p className="text-gray-500 text-xs">Click to replace</p></div></div> : <><span className="text-2xl block mb-1">🖼️</span><p className="text-gray-400 text-sm">Upload image</p></>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Audio Preview</label>
                    <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                    <div onClick={() => audioInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${formData.audio_url ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
                      {uploadingAudio ? <motion.div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} /> : formData.audio_url ? <><p className="text-green-400 text-sm">✅ Uploaded</p><p className="text-gray-500 text-xs">Click to replace</p></> : <><span className="text-2xl block mb-1">🎵</span><p className="text-gray-400 text-sm">Upload audio</p></>}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_visible} onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm">Show on website</span></label>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50">{saving ? 'Saving...' : (editingMix ? 'Update' : 'Add Mix')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ MESSAGES MANAGER ============
function MessagesManager({ messages, onRefresh, formatDate }) {
  const toggleRead = async (m) => { await supabase.from('contact_messages').update({ is_read: !m.is_read }).eq('id', m.id); onRefresh() }
  const deleteMessage = async (m) => { if (!confirm('Delete?')) return; await supabase.from('contact_messages').delete().eq('id', m.id); onRefresh() }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`bg-white/[0.02] border rounded-2xl p-6 ${m.is_read ? 'border-white/10' : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5'}`}>
            <div className="flex items-start justify-between mb-4">
              <div><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{m.name}</h3>{!m.is_read && <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">New</span>}</div><p className="text-gray-500 text-sm">{m.email}</p></div>
              <p className="text-xs text-gray-500">{formatDate(m.created_at)}</p>
            </div>
            <div className="mb-4"><p className="text-sm text-[#8B5CF6] mb-2">Subject: {m.subject}</p><p className="text-gray-300 bg-white/5 p-4 rounded-xl">{m.message}</p></div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 rounded-lg text-sm font-medium">Reply</a>
              <button onClick={() => toggleRead(m)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm">{m.is_read ? 'Mark Unread' : 'Mark Read'}</button>
              <button onClick={() => deleteMessage(m)} className="text-gray-400 hover:text-red-400 p-2 ml-auto">🗑️</button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <div className="text-center py-12 text-gray-500">No messages yet.</div>}
      </div>
    </div>
  )
}

// ============ SITE IMAGES MANAGER ============
function SiteImagesManager({ images, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [formData, setFormData] = useState({ name: '', location: '', image_url: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const imageInputRef = useRef(null)

  const locations = [
    { value: 'studio-main', label: 'Studio - Main Photo', description: 'Large studio photo on /studio page' },
    { value: 'studio-setup', label: 'Studio - Setup', description: 'Equipment/setup photo' },
    { value: 'studio-vibe', label: 'Studio - Vibe', description: 'Atmosphere/lounge photo' },
    { value: 'studio-location', label: 'Studio - Location', description: 'Location section photo' },
    { value: 'about-profile', label: 'About - Profile Photo', description: 'Your profile photo on /about' },
    { value: 'about-studio', label: 'About - Studio Shot', description: 'Working in studio photo' },
    { value: 'homepage-hero', label: 'Homepage - Hero', description: 'Hero section background' },
    { value: 'homepage-about', label: 'Homepage - About Section', description: 'About preview section' },
    { value: 'other', label: 'Other', description: 'General purpose image' },
  ]

  const openAddModal = () => { setEditingImage(null); setFormData({ name: '', location: '', image_url: '', is_active: true }); setShowModal(true) }
  const openEditModal = (img) => { setEditingImage(img); setFormData({ name: img.name || '', location: img.location || '', image_url: img.image_url || '', is_active: img.is_active !== false }); setShowModal(true) }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.includes('image')) { alert('Please select an image'); return }
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return }
    setUploading(true)
    try {
      const fileName = `site-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('images').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      setFormData({ ...formData, image_url: urlData.publicUrl })
    } catch (error) { alert('Error uploading: ' + error.message) }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.image_url) { alert('Please fill in all required fields'); return }
    setSaving(true)
    try {
      if (editingImage) { const { error } = await supabase.from('site_images').update(formData).eq('id', editingImage.id); if (error) throw error }
      else { const { error } = await supabase.from('site_images').insert([formData]); if (error) throw error }
      setShowModal(false); onRefresh()
    } catch (error) { alert('Error saving: ' + error.message) }
    setSaving(false)
  }

  const handleDelete = async (img) => { if (!confirm(`Delete "${img.name}"?`)) return; await supabase.from('site_images').delete().eq('id', img.id); onRefresh() }
  const toggleActive = async (img) => { await supabase.from('site_images').update({ is_active: !img.is_active }).eq('id', img.id); onRefresh() }
  const copyUrl = (url, id) => { navigator.clipboard.writeText(url); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000) }

  const groupedImages = locations.map(loc => ({ ...loc, images: images.filter(img => img.location === loc.value) }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Site Images</h2><p className="text-gray-500 text-sm">Manage photos for your website pages</p></div>
        <button onClick={openAddModal} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"><span>+</span> Upload Image</button>
      </div>

      <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold mb-3 flex items-center gap-2">💡 How to use</h3>
        <ol className="text-sm text-gray-400 space-y-2">
          <li>1. Click "Upload Image" and select a location</li>
          <li>2. Upload your image and save</li>
          <li>3. The image will automatically appear on the corresponding page</li>
          <li>4. Use the copy button to get the URL for custom use</li>
        </ol>
      </div>

      <div className="space-y-8">
        {groupedImages.map(group => (
          <div key={group.value} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-semibold">{group.label}</h3><p className="text-gray-500 text-sm">{group.description}</p></div>
              {group.images.length === 0 && <button onClick={() => { setFormData({ name: '', location: group.value, image_url: '', is_active: true }); setEditingImage(null); setShowModal(true) }} className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm flex items-center gap-1">+ Add Image</button>}
            </div>
            {group.images.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.images.map(img => (
                  <div key={img.id} className={`relative rounded-xl overflow-hidden border transition ${img.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                    <div className="aspect-video bg-black"><img src={img.image_url} alt={img.name} className="w-full h-full object-cover" /></div>
                    <div className="p-3 bg-white/5">
                      <p className="font-medium text-sm truncate">{img.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => copyUrl(img.image_url, img.id)} className={`flex-1 py-1.5 rounded-lg text-xs transition ${copiedId === img.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}>{copiedId === img.id ? '✓ Copied!' : '📋 Copy URL'}</button>
                        <button onClick={() => openEditModal(img)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm">✏️</button>
                        <button onClick={() => toggleActive(img)} className={`p-1.5 rounded-lg text-sm ${img.is_active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{img.is_active ? '👁' : '👁‍🗨'}</button>
                        <button onClick={() => handleDelete(img)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center"><span className="text-3xl block mb-2">📷</span><p className="text-gray-500 text-sm">No image uploaded for this location</p></div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">{editingImage ? 'Edit Image' : 'Upload New Image'}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Image *</label>
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div onClick={() => imageInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${formData.image_url ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-[#8B5CF6]/30'}`}>
                      {uploading ? <div className="flex flex-col items-center gap-2"><motion.div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /><p className="text-sm text-gray-400">Uploading...</p></div>
                      : formData.image_url ? <div><img src={formData.image_url} alt="Preview" className="max-h-40 mx-auto rounded-lg mb-3" /><p className="text-green-400 text-sm">✓ Image uploaded</p><p className="text-gray-500 text-xs mt-1">Click to replace</p></div>
                      : <><span className="text-4xl block mb-2">📤</span><p className="text-gray-400">Click to upload image</p><p className="text-gray-600 text-xs mt-1">Max 10MB</p></>}
                    </div>
                  </div>
                  <div><label className="block text-sm text-gray-400 mb-2">Image Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50" placeholder="e.g., Studio Main Photo" /></div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location *</label>
                    <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50">
                      <option value="">Select location</option>
                      {locations.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                    </select>
                    {formData.location && <p className="text-gray-500 text-xs mt-2">{locations.find(l => l.value === formData.location)?.description}</p>}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded" /><span>Active (show on website)</span></label>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white transition">Cancel</button>
                  <button onClick={handleSave} disabled={saving || !formData.image_url} className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold transition disabled:opacity-50">{saving ? 'Saving...' : (editingImage ? 'Update' : 'Save Image')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}