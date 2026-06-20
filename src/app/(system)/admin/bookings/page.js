'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_COLORS = {
  pending: 'bg-gray-500/20 text-gray-400',
  deposit_paid: 'bg-blue-500/20 text-blue-400',
  invoice_sent: 'bg-yellow-500/20 text-yellow-400',
  fully_paid: 'bg-green-500/20 text-green-400',
}

const STATUS_LABELS = {
  pending: 'Awaiting Deposit',
  deposit_paid: 'Deposit Paid',
  invoice_sent: 'Invoice Sent',
  fully_paid: 'Fully Paid',
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('mix')
  const [mixRequests, setMixRequests] = useState([])
  const [studioBookings, setStudioBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingInvoice, setSendingInvoice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [bookingFiles, setBookingFiles] = useState({})

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    setLoading(true)
    const [mixRes, studioRes] = await Promise.all([
      supabase.from('mix_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('studio_bookings').select('*').order('created_at', { ascending: false })
    ])
    setMixRequests(mixRes.data || [])
    setStudioBookings(studioRes.data || [])
    setLoading(false)
  }

  async function toggleFiles(bookingId) {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null)
      return
    }
    setExpandedBooking(bookingId)
    if (!bookingFiles[bookingId]) {
      try {
        const res = await fetch(`/api/upload-files?bookingId=${bookingId}&type=${activeTab}`)
        const data = await res.json()
        setBookingFiles(prev => ({ ...prev, [bookingId]: data.files || [] }))
      } catch {
        setBookingFiles(prev => ({ ...prev, [bookingId]: [] }))
      }
    }
  }

  async function deleteUploadedFile(bookingId, fileName) {
    if (!confirm(`Delete ${fileName}?`)) return
    try {
      const res = await fetch('/api/upload-files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, serviceType: activeTab, fileName })
      })
      const data = await res.json()
      if (data.success) {
        setBookingFiles(prev => ({
          ...prev,
          [bookingId]: prev[bookingId].filter(f => f.name !== fileName)
        }))
      }
    } catch {
      alert('Failed to delete file')
    }
  }

  async function sendInvoice(serviceType, bookingId) {
    setSendingInvoice(bookingId)
    try {
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, bookingId })
      })
      const data = await res.json()
      if (data.error) {
        alert(`Error: ${data.error}`)
      } else {
        alert(`Invoice sent! Amount: €${data.amount.toFixed(2)}`)
        fetchBookings()
      }
    } catch (err) {
      alert('Failed to send invoice')
    }
    setSendingInvoice(null)
  }

  const bookings = activeTab === 'mix' ? mixRequests : studioBookings
  const filtered = filter === 'all' ? bookings : bookings.filter(b => (b.payment_status || 'pending') === filter)

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-gray-500 hover:text-gray-300 text-sm mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Service Bookings</h1>
          </div>
          <button onClick={fetchBookings} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'mix', label: 'Mix & Master', icon: '🎚️', count: mixRequests.length },
            { id: 'studio', label: 'Studio Sessions', icon: '🎙️', count: studioBookings.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Awaiting Deposit' },
            { id: 'deposit_paid', label: 'Deposit Paid' },
            { id: 'invoice_sent', label: 'Invoice Sent' },
            { id: 'fully_paid', label: 'Fully Paid' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.id ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No bookings found
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const paymentStatus = booking.payment_status || 'pending'
              const depositPaid = paymentStatus === 'deposit_paid'
              const depositAmount = booking.deposit_amount || Math.round(booking.total_price / 2)
              const remaining = booking.total_price - depositAmount

              return (
                <div key={booking.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium truncate">
                          {activeTab === 'mix' ? booking.track_name : `Session on ${booking.date}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[paymentStatus]}`}>
                          {STATUS_LABELS[paymentStatus]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>{booking.name}</span>
                        <span>{booking.email}</span>
                        {activeTab === 'mix' && booking.genre && <span>{booking.genre}</span>}
                        {activeTab === 'mix' && booking.rush_delivery && <span className="text-orange-400">Rush</span>}
                        {activeTab === 'studio' && booking.hours && <span>{booking.hours.length}h booked</span>}
                        {activeTab === 'studio' && booking.add_mix_master && <span className="text-purple-400">+ Mix & Master</span>}
                        <span>{formatDate(booking.created_at)}</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">&euro;{booking.total_price?.toFixed(2)}</div>
                        {paymentStatus !== 'pending' && paymentStatus !== 'fully_paid' && (
                          <div className="text-xs text-gray-500">
                            Paid: &euro;{depositAmount.toFixed(2)} &middot; Due: &euro;{remaining.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {depositPaid && (
                        <button
                          onClick={() => sendInvoice(activeTab, booking.id)}
                          disabled={sendingInvoice === booking.id}
                          className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {sendingInvoice === booking.id ? 'Sending...' : 'Send Invoice'}
                        </button>
                      )}

                      {paymentStatus === 'invoice_sent' && booking.payment_link_url && (
                        <a
                          href={booking.payment_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                          View Link
                        </a>
                      )}

                      {paymentStatus === 'fully_paid' && (
                        <span className="text-green-400 text-sm font-medium">Paid</span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {(booking.notes || booking.message) && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-sm text-gray-500">{booking.notes || booking.message}</p>
                    </div>
                  )}

                  {/* Files & Upload Link */}
                  {paymentStatus !== 'pending' && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                      <button
                        onClick={() => toggleFiles(booking.id)}
                        className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                      >
                        {expandedBooking === booking.id ? 'Hide Files' : 'View Files'}
                      </button>
                      <a
                        href={`/upload?type=${activeTab}&id=${booking.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        Upload Link
                      </a>
                    </div>
                  )}

                  {/* Expanded Files List */}
                  {expandedBooking === booking.id && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      {!bookingFiles[booking.id] ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Loading files...
                        </div>
                      ) : bookingFiles[booking.id].length === 0 ? (
                        <p className="text-sm text-gray-600">No files uploaded yet</p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-xs text-gray-500 mb-2">{bookingFiles[booking.id].length} file(s) uploaded</p>
                          {bookingFiles[booking.id].map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-[#8B5CF6]">&#9679;</span>
                              <span className="text-gray-300 truncate flex-1">{f.name}</span>
                              {f.size > 0 && <span className="text-gray-600 text-xs">{(f.size / 1024 / 1024).toFixed(1)}MB</span>}
                              <a
                                href={`/api/upload-files?type=${activeTab}&bookingId=${booking.id}&download=${encodeURIComponent(f.name)}`}
                                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                              >
                                Download
                              </a>
                              <button
                                onClick={() => deleteUploadedFile(booking.id, f.name)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Deposits Received', value: bookings.filter(b => ['deposit_paid', 'invoice_sent', 'fully_paid'].includes(b.payment_status)).length },
            { label: 'Fully Paid', value: bookings.filter(b => b.payment_status === 'fully_paid').length },
            { label: 'Revenue', value: `€${bookings.filter(b => b.payment_status === 'fully_paid').reduce((sum, b) => sum + (b.total_price || 0), 0).toFixed(0)}` },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
