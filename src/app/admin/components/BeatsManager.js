'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../../lib/supabase'
import { Modal, Input, Select, FileUpload, EmptyState } from './ui'

export default function BeatsManager({ beats, onRefresh, formatPrice, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingBeat, setEditingBeat] = useState(null)
  const [formData, setFormData] = useState({
    title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [],
    price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99,
    is_featured: false, is_sold: false, audio_url: '', image_url: ''
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const genres = ['Trap', 'Drill', 'R&B', 'Jersey', 'Rap', 'Pop', 'Afrobeat']
  const keys = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm', 'Bb', 'Eb', 'Ab']

  const openAdd = () => {
    setEditingBeat(null)
    setFormData({
      title: '', genre: 'Trap', bpm: 140, key: 'Cm', tags: [],
      price_mp3: 29.99, price_wav: 49.99, price_stems: 99.99, price_exclusive: 299.99,
      is_featured: false, is_sold: false, audio_url: '', image_url: ''
    })
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditingBeat(b)
    setFormData({
      title: b.title || '', genre: b.genre || 'Trap', bpm: b.bpm || 140, key: b.key || 'Cm',
      tags: b.tags || [], price_mp3: b.price_mp3 || 29.99, price_wav: b.price_wav || 49.99,
      price_stems: b.price_stems || 99.99, price_exclusive: b.price_exclusive || 299.99,
      is_featured: b.is_featured || false, is_sold: b.is_sold || false,
      audio_url: b.audio_url || '', image_url: b.image_url || ''
    })
    setShowModal(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim().toLowerCase()] })
      setTagInput('')
    }
  }

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
    const { error } = editingBeat
      ? await supabase.from('beats').update(formData).eq('id', editingBeat.id)
      : await supabase.from('beats').insert([formData])
    if (error) alert('Error: ' + error.message)
    else { setShowModal(false); onRefresh() }
    setSaving(false)
  }

  const handleDelete = async (b) => {
    if (!confirm(`Delete "${b.title}"?`)) return
    await supabase.from('beats').delete().eq('id', b.id)
    onRefresh()
  }

  const toggle = async (b, field) => {
    await supabase.from('beats').update({ [field]: !b[field] }).eq('id', b.id)
    onRefresh()
  }

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
                <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {b.image_url ? (
                    <Image src={b.image_url} alt="" fill className="object-cover" sizes="48px" unoptimized />
                  ) : <span>🎵</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.genre} • {b.bpm} BPM • {b.key}</p>
                </div>
                <p className="font-bold text-sm">{formatPrice(b.price_mp3)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => toggle(b, 'is_featured')} className={`text-xs px-2 py-1 rounded-full ${b.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500'}`}>
                    {b.is_featured ? '★' : '☆'}
                  </button>
                  <button onClick={() => toggle(b, 'is_sold')} className={`text-xs px-2 py-1 rounded-full ${b.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {b.is_sold ? 'Sold' : 'Available'}
                  </button>
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
                  {['Beat', 'Genre', 'BPM', 'Key', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-sm font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {beats.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center overflow-hidden relative">
                          {b.image_url ? (
                            <Image src={b.image_url} alt="" fill className="object-cover" sizes="40px" unoptimized />
                          ) : <span>🎵</span>}
                        </div>
                        <div>
                          <p className="font-medium">{b.title}</p>
                          <div className="flex items-center gap-2">
                            {b.audio_url && <span className="text-green-500 text-xs">🔊</span>}
                            <p className="text-xs text-gray-500">{b.tags?.slice(0, 2).join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{b.genre}</td>
                    <td className="px-6 py-4 text-sm">{b.bpm}</td>
                    <td className="px-6 py-4 text-sm">{b.key}</td>
                    <td className="px-6 py-4 text-sm">{formatPrice(b.price_mp3)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle(b, 'is_featured')} className={`text-xs px-2 py-1 rounded-full transition ${b.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                          {b.is_featured ? '★ Featured' : '☆'}
                        </button>
                        <button onClick={() => toggle(b, 'is_sold')} className={`text-xs px-2 py-1 rounded-full transition ${b.is_sold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {b.is_sold ? 'Sold' : 'Available'}
                        </button>
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
        <div className="space-y-4 md:space-y-6">
          <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Beat title" />
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Select label="Genre" value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} options={genres} />
            <Input label="BPM" type="number" value={formData.bpm} onChange={e => setFormData({ ...formData, bpm: parseInt(e.target.value) || 0 })} />
            <Select label="Key" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} options={keys} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <FileUpload label="Audio File" type="audio" uploading={uploadingAudio} preview={formData.audio_url} onUpload={f => uploadFile(f, 'beats', setUploadingAudio, 'audio_url')} />
            <FileUpload label="Cover Image" type="image" uploading={uploadingImage} preview={formData.image_url} onUpload={f => uploadFile(f, 'images', setUploadingImage, 'image_url')} />
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.tags.map(t => (
                <span key={t} className="bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 md:px-3 py-1 rounded-full text-xs flex items-center gap-1 md:gap-2">
                  #{t}<button onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2 text-sm" placeholder="Add tag..." />
              <button onClick={addTag} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm">Add</button>
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">Prices (EUR)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {[['MP3', 'price_mp3'], ['WAV', 'price_wav'], ['Unlimited', 'price_stems'], ['Exclusive', 'price_exclusive']].map(([l, k]) => (
                <div key={k}>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">{l}</p>
                  <input type="number" step="0.01" value={formData[k]} onChange={e => setFormData({ ...formData, [k]: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={formData.is_sold} onChange={e => setFormData({ ...formData, is_sold: e.target.checked })} className="w-4 h-4 rounded" />
              Sold
            </label>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
          <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 md:py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 md:py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-semibold disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : (editingBeat ? 'Update' : 'Add Beat')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
