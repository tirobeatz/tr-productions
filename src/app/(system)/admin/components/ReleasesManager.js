'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { fetchSpotifyData, isValidSpotifyUrl } from '@/lib/spotify'
import { Modal, Input, EmptyState } from './ui'

export default function ReleasesManager({ releases, onRefresh, isMobile }) {
  const [showModal, setShowModal] = useState(false)
  const [editingRelease, setEditingRelease] = useState(null)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [formData, setFormData] = useState({
    spotify_url: '',
    spotify_id: '',
    title: '',
    artist: '',
    cover_image: '',
    is_featured: false,
    is_visible: true,
    display_order: 0
  })
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [saving, setSaving] = useState(false)

  const openAdd = () => {
    setEditingRelease(null)
    setSpotifyUrl('')
    setFormData({
      spotify_url: '',
      spotify_id: '',
      title: '',
      artist: '',
      cover_image: '',
      is_featured: false,
      is_visible: true,
      display_order: releases.length
    })
    setFetchError('')
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditingRelease(r)
    setSpotifyUrl(r.spotify_url || '')
    setFormData({
      spotify_url: r.spotify_url || '',
      spotify_id: r.spotify_id || '',
      title: r.title || '',
      artist: r.artist || '',
      cover_image: r.cover_image || '',
      is_featured: r.is_featured || false,
      is_visible: r.is_visible !== false,
      display_order: r.display_order || 0
    })
    setFetchError('')
    setShowModal(true)
  }

  const fetchFromSpotify = async () => {
    if (!spotifyUrl.trim()) {
      setFetchError('Please enter a Spotify URL')
      return
    }

    if (!isValidSpotifyUrl(spotifyUrl)) {
      setFetchError('Invalid Spotify URL. Use format: open.spotify.com/track/xxx')
      return
    }

    setFetching(true)
    setFetchError('')

    const result = await fetchSpotifyData(spotifyUrl)

    if (result.success) {
      setFormData({
        ...formData,
        spotify_url: result.data.spotify_url,
        spotify_id: result.data.spotify_id,
        title: result.data.title,
        artist: result.data.artist,
        cover_image: result.data.cover_image
      })
    } else {
      setFetchError(result.error || 'Failed to fetch from Spotify')
    }

    setFetching(false)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setFetchError('Title is required')
      return
    }
    if (!formData.spotify_url.trim()) {
      setFetchError('Spotify URL is required')
      return
    }

    setSaving(true)
    setFetchError('')

    const saveData = {
      ...formData,
      updated_at: new Date().toISOString()
    }

    const { error } = editingRelease
      ? await supabase.from('releases').update(saveData).eq('id', editingRelease.id)
      : await supabase.from('releases').insert([saveData])

    if (error) {
      setFetchError('Error: ' + error.message)
    } else {
      setShowModal(false)
      onRefresh()
    }

    setSaving(false)
  }

  const handleDelete = async (r) => {
    if (!confirm(`Delete "${r.title}"?`)) return
    await supabase.from('releases').delete().eq('id', r.id)
    onRefresh()
  }

  const toggleField = async (r, field) => {
    await supabase.from('releases').update({ [field]: !r[field] }).eq('id', r.id)
    onRefresh()
  }

  const moveOrder = async (r, direction) => {
    const newOrder = r.display_order + direction
    if (newOrder < 0) return
    await supabase.from('releases').update({ display_order: newOrder }).eq('id', r.id)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold">My Releases</h2>
          <p className="text-gray-500 text-xs md:text-sm">Tracks you produced - imported from Spotify</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#1DB954] hover:bg-[#1ed760] px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition text-xs md:text-sm flex items-center gap-2"
        >
          <span>🎵</span> Add Release
        </button>
      </div>

      {/* Releases Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {releases.map((r) => (
          <div
            key={r.id}
            className={`bg-white/[0.02] border rounded-xl overflow-hidden group transition-all hover:border-[#1DB954]/50 ${
              r.is_visible ? 'border-white/10' : 'border-white/5 opacity-50'
            }`}
          >
            {/* Cover Image */}
            <div className="aspect-square relative bg-[#1DB954]/10">
              {r.cover_image ? (
                <Image
                  src={r.cover_image}
                  alt={r.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🎵</div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openEdit(r)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(r)}
                  className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition"
                  title="Delete"
                >
                  🗑️
                </button>
                <a
                  href={r.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1DB954]/80 rounded-full hover:bg-[#1DB954] transition"
                  title="Open in Spotify"
                >
                  🔗
                </a>
              </div>

              {/* Featured badge */}
              {r.is_featured && (
                <div className="absolute top-2 left-2 bg-[#8B5CF6] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  ★ Featured
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm truncate">{r.title}</h3>
              <p className="text-gray-500 text-xs truncate">{r.artist}</p>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleField(r, 'is_featured')}
                    className={`text-xs px-2 py-1 rounded-full transition ${
                      r.is_featured ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                    }`}
                    title="Toggle featured"
                  >
                    {r.is_featured ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => toggleField(r, 'is_visible')}
                    className={`text-xs px-2 py-1 rounded-full transition ${
                      r.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                    }`}
                    title="Toggle visibility"
                  >
                    {r.is_visible ? '👁️' : '🙈'}
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveOrder(r, -1)}
                    className="text-xs p-1 text-gray-500 hover:text-white"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveOrder(r, 1)}
                    className="text-xs p-1 text-gray-500 hover:text-white"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {releases.length === 0 && (
        <EmptyState
          icon="🎵"
          text="No releases yet. Add your first produced track!"
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingRelease ? 'Edit Release' : 'Add New Release'}
      >
        <div className="space-y-4 md:space-y-6">
          {/* Spotify URL Input */}
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-2">
              Spotify URL *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]/50 transition"
                placeholder="https://open.spotify.com/track/..."
              />
              <button
                onClick={fetchFromSpotify}
                disabled={fetching}
                className="bg-[#1DB954] hover:bg-[#1ed760] px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {fetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>🔍 Fetch</>
                )}
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-1">
              Paste a Spotify track or album link
            </p>
          </div>

          {fetchError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {fetchError}
            </div>
          )}

          {/* Preview */}
          {formData.title && (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex gap-4">
                {formData.cover_image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                    <Image
                      src={formData.cover_image}
                      alt={formData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{formData.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{formData.artist}</p>
                  <p className="text-[#1DB954] text-xs mt-2">✓ Data fetched from Spotify</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Edit Fields */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Song title"
            />
            <Input
              label="Artist"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              placeholder="Artist name"
            />
          </div>

          <Input
            label="Cover Image URL"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            placeholder="https://..."
          />

          {/* Options */}
          <div className="flex gap-4 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Featured (show on homepage)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Visible
            </label>
          </div>
        </div>

        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2.5 md:py-3 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title}
            className="flex-1 py-2.5 md:py-3 bg-[#1DB954] hover:bg-[#1ed760] rounded-xl font-semibold disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : editingRelease ? 'Update' : 'Add Release'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
