'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('beats')
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [beats, setBeats] = useState([])
  const [bookings, setBookings] = useState([])
  const [mixRequests, setMixRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [availability, setAvailability] = useState([])

  // Simple password protection (change this!)
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
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchBeats(),
      fetchBookings(),
      fetchMixRequests(),
      fetchMessages(),
      fetchAvailability()
    ])
    setLoading(false)
  }

  const fetchBeats = async () => {
    const { data } = await supabase
      .from('beats')
      .select('*')
      .order('created_at', { ascending: false })
    setBeats(data || [])
  }

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('studio_bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const fetchMixRequests = async () => {
    const { data } = await supabase
      .from('mix_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setMixRequests(data || [])
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
  }

  const fetchAvailability = async () => {
    const { data } = await supabase
      .from('studio_availability')
      .select('*')
      .order('date', { ascending: true })
    setAvailability(data || [])
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('tr-admin-auth')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price || 0)
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <span className="text-4xl block mb-4">🔐</span>
            <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Enter password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
            />
            <button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition"
            >
              Login
            </button>
          </form>
          
          <p className="text-center text-gray-600 text-xs mt-6">
            <a href="/" className="hover:text-white transition">← Back to site</a>
          </p>
        </motion.div>
      </main>
    )
  }

  const tabs = [
    { id: 'beats', label: 'Beats', icon: '🎵', count: beats.length },
    { id: 'availability', label: 'Availability', icon: '📅', count: null },
    { id: 'bookings', label: 'Bookings', icon: '🎤', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'mixing', label: 'Mix Requests', icon: '🎚️', count: mixRequests.filter(m => m.status === 'pending').length },
    { id: 'messages', label: 'Messages', icon: '💬', count: messages.filter(m => !m.is_read).length },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold">
              TR <span className="text-[#8B5CF6]">Admin</span>
            </a>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllData}
              className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Overview */}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Beats Tab */}
        {!loading && activeTab === 'beats' && (
          <BeatsManager 
            beats={beats} 
            onRefresh={fetchBeats}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        )}

        {/* Availability Tab */}
        {!loading && activeTab === 'availability' && (
          <AvailabilityManager 
            availability={availability}
            bookings={bookings}
            onRefresh={fetchAvailability}
          />
        )}

        {/* Bookings Tab */}
        {!loading && activeTab === 'bookings' && (
          <BookingsManager 
            bookings={bookings} 
            onRefresh={fetchBookings}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        )}

        {/* Mix Requests Tab */}
        {!loading && activeTab === 'mixing' && (
          <MixRequestsManager 
            requests={mixRequests} 
            onRefresh={fetchMixRequests}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        )}

        {/* Messages Tab */}
        {!loading && activeTab === 'messages' && (
          <MessagesManager 
            messages={messages} 
            onRefresh={fetchMessages}
            formatDate={formatDate}
          />
        )}

      </div>
    </main>
  )
}

// ============ BEATS MANAGER WITH FILE UPLOAD ============
function BeatsManager({ beats, onRefresh, formatPrice, formatDate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingBeat, setEditingBeat] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Trap',
    bpm: 140,
    key: 'Cm',
    tags: [],
    price_mp3: 29.99,
    price_wav: 49.99,
    price_stems: 99.99,
    price_exclusive: 299.99,
    is_featured: false,
    is_sold: false,
    audio_url: '',
    image_url: ''
  })
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
    setFormData({
      title: '',
      genre: 'Trap',
      bpm: 140,
      key: 'Cm',
      tags: [],
      price_mp3: 29.99,
      price_wav: 49.99,
      price_stems: 99.99,
      price_exclusive: 299.99,
      is_featured: false,
      is_sold: false,
      audio_url: '',
      image_url: ''
    })
    setShowModal(true)
  }

  const openEditModal = (beat) => {
    setEditingBeat(beat)
    setFormData({
      title: beat.title || '',
      genre: beat.genre || 'Trap',
      bpm: beat.bpm || 140,
      key: beat.key || 'Cm',
      tags: beat.tags || [],
      price_mp3: beat.price_mp3 || 29.99,
      price_wav: beat.price_wav || 49.99,
      price_stems: beat.price_stems || 99.99,
      price_exclusive: beat.price_exclusive || 299.99,
      is_featured: beat.is_featured || false,
      is_sold: beat.is_sold || false,
      audio_url: beat.audio_url || '',
      image_url: beat.image_url || ''
    })
    setShowModal(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  // Upload audio file
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('audio')) {
      alert('Please select an audio file (MP3, WAV, etc.)')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Maximum size is 50MB.')
      return
    }

    setUploadingAudio(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('beats')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('beats')
        .getPublicUrl(fileName)

      setFormData({ ...formData, audio_url: urlData.publicUrl })
    } catch (error) {
      alert('Error uploading audio: ' + error.message)
    }

    setUploadingAudio(false)
  }

  // Upload image file
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('image')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      setFormData({ ...formData, image_url: urlData.publicUrl })
    } catch (error) {
      alert('Error uploading image: ' + error.message)
    }

    setUploadingImage(false)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)

    if (editingBeat) {
      const { error } = await supabase
        .from('beats')
        .update(formData)
        .eq('id', editingBeat.id)

      if (error) {
        alert('Error updating beat: ' + error.message)
      } else {
        setShowModal(false)
        onRefresh()
      }
    } else {
      const { error } = await supabase
        .from('beats')
        .insert([formData])

      if (error) {
        alert('Error adding beat: ' + error.message)
      } else {
        setShowModal(false)
        onRefresh()
      }
    }

    setSaving(false)
  }

  const handleDelete = async (beat) => {
    if (!confirm(`Are you sure you want to delete "${beat.title}"?`)) return

    const { error } = await supabase
      .from('beats')
      .delete()
      .eq('id', beat.id)

    if (error) {
      alert('Error deleting beat: ' + error.message)
    } else {
      onRefresh()
    }
  }

  const toggleFeatured = async (beat) => {
    const { error } = await supabase
      .from('beats')
      .update({ is_featured: !beat.is_featured })
      .eq('id', beat.id)

    if (!error) onRefresh()
  }

  const toggleSold = async (beat) => {
    const { error } = await supabase
      .from('beats')
      .update({ is_sold: !beat.is_sold })
      .eq('id', beat.id)

    if (!error) onRefresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Beats</h2>
        <button
          onClick={openAddModal}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
        >
          <span>+</span> Add Beat
        </button>
      </div>

      {/* Beats Table */}
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
                        {beat.image_url ? (
                          <img src={beat.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>🎵</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{beat.title}</p>
                        <div className="flex items-center gap-2">
                          {beat.audio_url && <span className="text-green-500 text-xs">🔊 Audio</span>}
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
                      <button
                        onClick={() => toggleFeatured(beat)}
                        className={`text-xs px-2 py-1 rounded-full transition ${
                          beat.is_featured 
                            ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' 
                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {beat.is_featured ? '★ Featured' : '☆ Feature'}
                      </button>
                      <button
                        onClick={() => toggleSold(beat)}
                        className={`text-xs px-2 py-1 rounded-full transition ${
                          beat.is_sold 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {beat.is_sold ? 'Sold' : 'Available'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(beat)}
                        className="text-gray-400 hover:text-white transition p-2"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(beat)}
                        className="text-gray-400 hover:text-red-400 transition p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {beats.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No beats yet. Click "Add Beat" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">
                  {editingBeat ? 'Edit Beat' : 'Add New Beat'}
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      placeholder="Beat title"
                    />
                  </div>

                  {/* Genre, BPM, Key */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Genre</label>
                      <select
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      >
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">BPM</label>
                      <input
                        type="number"
                        value={formData.bpm}
                        onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Key</label>
                      <select
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      >
                        {keys.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Audio Upload */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Audio File</label>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => audioInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                          formData.audio_url 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-white/10 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5'
                        }`}
                      >
                        {uploadingAudio ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span className="text-sm">Uploading...</span>
                          </div>
                        ) : formData.audio_url ? (
                          <div>
                            <span className="text-2xl block mb-1">✅</span>
                            <p className="text-green-400 text-sm">Audio uploaded</p>
                            <p className="text-gray-500 text-xs mt-1">Click to replace</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl block mb-1">🎵</span>
                            <p className="text-gray-400 text-sm">Click to upload audio</p>
                            <p className="text-gray-600 text-xs">MP3, WAV (max 50MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Cover Image</label>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition overflow-hidden ${
                          formData.image_url 
                            ? 'border-green-500/30 bg-green-500/5' 
                            : 'border-white/10 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5'
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.div
                              className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span className="text-sm">Uploading...</span>
                          </div>
                        ) : formData.image_url ? (
                          <div>
                            <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg mx-auto mb-1" />
                            <p className="text-green-400 text-sm">Image uploaded</p>
                            <p className="text-gray-500 text-xs mt-1">Click to replace</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl block mb-1">🖼️</span>
                            <p className="text-gray-400 text-sm">Click to upload image</p>
                            <p className="text-gray-600 text-xs">JPG, PNG (max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        placeholder="Add tag..."
                      />
                      <button
                        onClick={addTag}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Prices */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Prices (EUR)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">MP3 Lease</p>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price_mp3}
                          onChange={(e) => setFormData({ ...formData, price_mp3: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">WAV Lease</p>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price_wav}
                          onChange={(e) => setFormData({ ...formData, price_wav: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Unlimited</p>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price_stems}
                          onChange={(e) => setFormData({ ...formData, price_stems: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Exclusive</p>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price_exclusive}
                          onChange={(e) => setFormData({ ...formData, price_exclusive: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_sold}
                        onChange={(e) => setFormData({ ...formData, is_sold: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Sold (hide from store)</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (editingBeat ? 'Update Beat' : 'Add Beat')}
                  </button>
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

  const HOURS = Array.from({ length: 13 }, (_, i) => i + 10) // 10:00 - 22:00

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add empty slots for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]
  }

  const getAvailabilityForDate = (date) => {
    return availability.find(a => a.date === formatDateKey(date))
  }

  const getBookingsForDate = (date) => {
    return bookings.filter(b => b.date === formatDateKey(date) && b.status !== 'cancelled')
  }

  const handleDateClick = (date) => {
    if (!date || date < new Date().setHours(0, 0, 0, 0)) return
    
    setSelectedDate(date)
    const existing = getAvailabilityForDate(date)
    if (existing) {
      setSelectedHours(existing.blocked_hours || [])
      setIsFullyBlocked(existing.is_fully_blocked || false)
      setNote(existing.note || '')
    } else {
      setSelectedHours([])
      setIsFullyBlocked(false)
      setNote('')
    }
  }

  const toggleHour = (hour) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour))
    } else {
      setSelectedHours([...selectedHours, hour])
    }
  }

  const handleSave = async () => {
    if (!selectedDate) return
    
    setSaving(true)
    
    const dateKey = formatDateKey(selectedDate)
    const existing = getAvailabilityForDate(selectedDate)
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('studio_availability')
        .update({
          blocked_hours: selectedHours,
          is_fully_blocked: isFullyBlocked,
          note: note
        })
        .eq('id', existing.id)
      
      if (error) alert('Error updating: ' + error.message)
    } else {
      // Insert new
      const { error } = await supabase
        .from('studio_availability')
        .insert([{
          date: dateKey,
          blocked_hours: selectedHours,
          is_fully_blocked: isFullyBlocked,
          note: note
        }])
      
      if (error) alert('Error saving: ' + error.message)
    }
    
    setSaving(false)
    onRefresh()
  }

  const handleClear = async () => {
    if (!selectedDate) return
    
    const existing = getAvailabilityForDate(selectedDate)
    if (!existing) return
    
    if (!confirm('Clear availability settings for this date?')) return
    
    const { error } = await supabase
      .from('studio_availability')
      .delete()
      .eq('id', existing.id)
    
    if (!error) {
      setSelectedHours([])
      setIsFullyBlocked(false)
      setNote('')
      onRefresh()
    }
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Studio Availability</h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              ←
            </button>
            <h3 className="font-semibold text-lg">{monthName}</h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />
              }
              
              const isPast = date < new Date().setHours(0, 0, 0, 0)
              const isSelected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate)
              const avail = getAvailabilityForDate(date)
              const dateBookings = getBookingsForDate(date)
              const hasBookings = dateBookings.length > 0
              const isBlocked = avail?.is_fully_blocked
              const hasBlockedHours = avail?.blocked_hours?.length > 0
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isPast}
                  className={`aspect-square rounded-lg text-sm font-medium transition relative ${
                    isPast 
                      ? 'text-gray-700 cursor-not-allowed'
                      : isSelected
                        ? 'bg-[#8B5CF6] text-white'
                        : isBlocked
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : hasBlockedHours
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'hover:bg-white/10'
                  }`}
                >
                  {date.getDate()}
                  {hasBookings && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500/20 rounded" /> Fully Blocked
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500/20 rounded" /> Partial Block
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Has Bookings
            </div>
          </div>
        </div>

        {/* Selected Date Panel */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          {selectedDate ? (
            <>
              <h3 className="font-semibold text-lg mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>

              {/* Bookings for this date */}
              {getBookingsForDate(selectedDate).length > 0 && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-medium mb-2">Existing Bookings:</p>
                  {getBookingsForDate(selectedDate).map(booking => (
                    <p key={booking.id} className="text-sm text-gray-400">
                      {booking.name} - {booking.hours?.map(h => `${h}:00`).join(', ')}
                    </p>
                  ))}
                </div>
              )}

              {/* Full Day Block */}
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFullyBlocked}
                  onChange={(e) => setIsFullyBlocked(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">Block entire day</span>
              </label>

              {/* Hour Selection */}
              {!isFullyBlocked && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">Block specific hours:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {HOURS.map(hour => {
                      const isBooked = getBookingsForDate(selectedDate).some(b => b.hours?.includes(hour))
                      return (
                        <button
                          key={hour}
                          onClick={() => !isBooked && toggleHour(hour)}
                          disabled={isBooked}
                          className={`py-2 rounded-lg text-sm font-medium transition ${
                            isBooked
                              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                              : selectedHours.includes(hour)
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {hour}:00
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Green = booked, Red = blocked by you
                  </p>
                </div>
              )}

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Holiday, Personal, Maintenance..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] py-3 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition"
                >
                  Clear
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-4">📅</span>
              <p>Select a date to manage availability</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ BOOKINGS MANAGER ============
function BookingsManager({ bookings, onRefresh, formatPrice, formatDate }) {
  const updateStatus = async (booking, status) => {
    const { error } = await supabase
      .from('studio_bookings')
      .update({ status })
      .eq('id', booking.id)

    if (!error) onRefresh()
  }

  const deleteBooking = async (booking) => {
    if (!confirm('Delete this booking?')) return

    const { error } = await supabase
      .from('studio_bookings')
      .delete()
      .eq('id', booking.id)

    if (!error) onRefresh()
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    cancelled: 'bg-red-500/20 text-red-400'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Studio Bookings</h2>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.name}</h3>
                <p className="text-gray-500 text-sm">{booking.email}</p>
                {booking.phone && <p className="text-gray-500 text-sm">{booking.phone}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="font-medium">{new Date(booking.date).toLocaleDateString('de-DE')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Hours</p>
                <p className="font-medium">{booking.hours?.map(h => `${h}:00`).join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total</p>
                <p className="font-medium text-[#8B5CF6]">{formatPrice(booking.total_price)}</p>
              </div>
            </div>

            {booking.add_mix_master && (
              <p className="text-sm text-purple-400 mb-4">+ Mix & Master add-on</p>
            )}

            {booking.message && (
              <p className="text-gray-400 text-sm mb-4 bg-white/5 p-3 rounded-xl">{booking.message}</p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 flex-1">Received: {formatDate(booking.created_at)}</p>
              <select
                value={booking.status}
                onChange={(e) => updateStatus(booking, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => deleteBooking(booking)}
                className="text-gray-400 hover:text-red-400 transition p-2"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings yet.
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MIX REQUESTS MANAGER ============
function MixRequestsManager({ requests, onRefresh, formatPrice, formatDate }) {
  const updateStatus = async (request, status) => {
    const { error } = await supabase
      .from('mix_requests')
      .update({ status })
      .eq('id', request.id)

    if (!error) onRefresh()
  }

  const deleteRequest = async (request) => {
    if (!confirm('Delete this request?')) return

    const { error } = await supabase
      .from('mix_requests')
      .delete()
      .eq('id', request.id)

    if (!error) onRefresh()
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mix & Master Requests</h2>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{request.track_name}</h3>
                <p className="text-gray-500 text-sm">by {request.name} ({request.email})</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                {request.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs">Genre</p>
                <p className="font-medium">{request.genre}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Delivery</p>
                <p className="font-medium">{request.rush_delivery ? '⚡ Rush (24-48h)' : 'Standard (2-3 days)'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total</p>
                <p className="font-medium text-[#8B5CF6]">{formatPrice(request.total_price)}</p>
              </div>
            </div>

            {request.reference_url && (
              <p className="text-sm mb-2">
                <span className="text-gray-500">Reference:</span>{' '}
                <a href={request.reference_url} target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:underline">
                  {request.reference_url}
                </a>
              </p>
            )}

            {request.notes && (
              <p className="text-gray-400 text-sm mb-4 bg-white/5 p-3 rounded-xl">{request.notes}</p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 flex-1">Received: {formatDate(request.created_at)}</p>
              <select
                value={request.status}
                onChange={(e) => updateStatus(request, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => deleteRequest(request)}
                className="text-gray-400 hover:text-red-400 transition p-2"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No mix requests yet.
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MESSAGES MANAGER ============
function MessagesManager({ messages, onRefresh, formatDate }) {
  const toggleRead = async (message) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: !message.is_read })
      .eq('id', message.id)

    if (!error) onRefresh()
  }

  const deleteMessage = async (message) => {
    if (!confirm('Delete this message?')) return

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', message.id)

    if (!error) onRefresh()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>

      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`bg-white/[0.02] border rounded-2xl p-6 transition ${
              message.is_read ? 'border-white/10' : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/5'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{message.name}</h3>
                  {!message.is_read && (
                    <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">New</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{message.email}</p>
              </div>
              <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[#8B5CF6] mb-2">Subject: {message.subject}</p>
              <p className="text-gray-300 bg-white/5 p-4 rounded-xl">{message.message}</p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <a 
                href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Reply
              </a>
              <button
                onClick={() => toggleRead(message)}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition"
              >
                {message.is_read ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button
                onClick={() => deleteMessage(message)}
                className="text-gray-400 hover:text-red-400 transition p-2 ml-auto"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  )
}