'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'

export default function StudioPage() {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHours, setSelectedHours] = useState([])
  const [includeMixMaster, setIncludeMixMaster] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [availability, setAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [siteImages, setSiteImages] = useState([])
  const [visibleSections, setVisibleSections] = useState({})

  const HOURLY_RATE = 30, MIX_MASTER_RATE = 60, BULK_DISCOUNT_HOURS = 5, BULK_RATE = 25
  const allHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

  const testimonials = [
    { name: 'Marcus J.', role: 'Rapper', text: 'Super chill vibe. TR knows how to get the best take out of you.', rating: 5 },
    { name: 'Sarah K.', role: 'Singer', text: "Finally a studio where I don't feel rushed. Fair prices!", rating: 5 },
  ]

  const whatToExpect = [
    { icon: '🎤', title: 'Recording', text: 'Professional vocal recording with guidance' },
    { icon: '🎧', title: 'Engineer', text: 'I handle all the technical stuff' },
    { icon: '💾', title: 'Your Files', text: 'WAV format after the session' },
    { icon: '☕', title: 'Relaxed Vibe', text: 'Cozy atmosphere, no stress' },
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    fetchData()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisibleSections(p => ({ ...p, [e.target.id]: true }))),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('[data-animate]').forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [mounted])

  const fetchData = async () => { setLoading(true); await Promise.all([fetchAvailability(), fetchBookings(), fetchSiteImages()]); setLoading(false) }
  const fetchAvailability = async () => { const { data } = await supabase.from('studio_availability').select('*').order('date', { ascending: true }); setAvailability(data || []) }
  const fetchBookings = async () => { const { data } = await supabase.from('studio_bookings').select('*').in('status', ['pending', 'confirmed']); setBookings(data || []) }
  const fetchSiteImages = async () => { const { data } = await supabase.from('site_images').select('*').eq('is_active', true); setSiteImages(data || []) }

  const getImage = (loc) => {
    const img = siteImages.find(img => img.location === loc)
    return img ? { url: img.image_url, focalX: img.focal_x ?? 50, focalY: img.focal_y ?? 50 } : null
  }
  const generateCalendarDays = () => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth(), first = new Date(y, m, 1), days = []
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) days.push(new Date(y, m, d))
    return days
  }
  const formatDateKey = (d) => d?.toISOString().split('T')[0] || ''
  const getAvailabilityForDate = (d) => d ? availability.find(a => a.date === formatDateKey(d)) : null
  const getUnavailableHours = (d) => {
    if (!d) return []
    const avail = getAvailabilityForDate(d)
    if (avail?.is_fully_blocked) return allHours
    const unavail = avail?.blocked_hours || []
    bookings.filter(b => b.date === formatDateKey(d)).forEach(b => b.hours && unavail.push(...b.hours))
    return [...new Set(unavail)]
  }
  const isDateFullyBlocked = (d) => getAvailabilityForDate(d)?.is_fully_blocked || false
  const isDateInPast = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t }
  const isToday = (d) => d?.toDateString() === new Date().toDateString()
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const toggleHour = (h) => setSelectedHours(p => p.includes(h) ? p.filter(x => x !== h) : [...p, h].sort((a,b) => a-b))
  const calculateTotal = () => (selectedHours.length >= BULK_DISCOUNT_HOURS ? selectedHours.length * BULK_RATE : selectedHours.length * HOURLY_RATE) + (includeMixMaster ? MIX_MASTER_RATE : 0)
  const getHourlyRate = () => selectedHours.length >= BULK_DISCOUNT_HOURS ? BULK_RATE : HOURLY_RATE
  const openBookingModal = () => { if (selectedDate && selectedHours.length > 0) { setShowBookingModal(true); setSubmitError(null); setSubmitted(false); document.body.style.overflow = 'hidden' } }
  const closeBookingModal = () => { setShowBookingModal(false); document.body.style.overflow = 'unset' }
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const handleDateSelect = (d) => { if (!isDateInPast(d) && !isDateFullyBlocked(d)) { setSelectedDate(d); setSelectedHours([]) } }
  const anim = (id) => `transition-all duration-1000 ${visibleSections[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setSubmitError(null)
    try {
      const { error } = await supabase.from('studio_bookings').insert([{
        name: formData.name, email: formData.email, phone: formData.phone || null, message: formData.message || null,
        date: formatDateKey(selectedDate), hours: selectedHours, add_mix_master: includeMixMaster, total_price: calculateTotal(), status: 'pending'
      }])
      if (error) throw error
      setSubmitted(true); await fetchBookings()
      setTimeout(() => { closeBookingModal(); setSelectedDate(null); setSelectedHours([]); setIncludeMixMaster(false); setFormData({ name: '', email: '', phone: '', message: '' }); setSubmitted(false) }, 3000)
    } catch (err) { setSubmitError(err.message || 'Failed to submit.') }
    finally { setIsSubmitting(false) }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      
<Background />

      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Recording Studio in Trier</p>
          <h1 className={`text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Record With <span className="text-[#8B5CF6]">TR</span></h1>
          <p className={`text-base md:text-lg text-gray-400 mb-6 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Cozy creative space, personal attention, and professional results.</p>
          <div className={`flex flex-col sm:flex-row justify-center gap-3 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a href="#booking" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105">Book a Session</a>
            <a href="#pricing" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition">View Pricing</a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 ${anim('pricing')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Simple Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">No Hidden Fees</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              { icon: '🎙️', title: 'Recording Session', sub: 'Engineer included', price: HOURLY_RATE, unit: 'hour', badge: `💡 Book 5+ hours = €${BULK_RATE}/hour`, badgeColor: '[#8B5CF6]', features: ['Professional recording', 'Engineer included', 'WAV files', 'Relaxed vibe'] },
              { icon: '🎚️', title: 'Mix & Master', sub: 'Per track', price: MIX_MASTER_RATE, unit: 'track', badge: 'Add to booking or order separately', badgeColor: 'gray-400', features: ['Professional mixing', 'Mastering included', 'Radio-ready', '1 revision'] }
            ].map((item, i) => (
              <div key={item.title} className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 text-center transition-all duration-700 hover:border-[#8B5CF6]/30 hover:-translate-y-1 ${anim('pricing')}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-gray-500 mb-4 text-sm">{item.sub}</p>
                <div className="mb-3"><span className="text-4xl font-bold">€{item.price}</span><span className="text-gray-500 ml-1 text-sm">/ {item.unit}</span></div>
                <div className={`${i === 0 ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20' : 'bg-white/5 border-white/10'} border rounded-xl p-3 mb-4`}>
                  <p className={`text-xs ${i === 0 ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>{item.badge}</p>
                </div>
                <ul className="text-left space-y-2 text-xs text-gray-400">
                  {item.features.map((f, j) => <li key={j} className="flex items-center gap-2"><span className="text-[#8B5CF6]">✓</span>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 ${anim('gallery')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">The Space</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Where Magic Happens</h2>
          </div>
          <div className={`grid md:grid-cols-3 gap-3 ${anim('gallery')}`}>
            <div className="md:col-span-2 aspect-video bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center border border-white/5 group hover:border-[#8B5CF6]/30 transition overflow-hidden relative">
              {getImage('studio-main') ? <Image src={getImage('studio-main').url} alt="Studio" fill className="object-cover group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: `${getImage('studio-main').focalX}% ${getImage('studio-main').focalY}%` }} sizes="(max-width: 768px) 100vw, 66vw" quality={60} /> : <span className="text-5xl group-hover:scale-110 transition-transform">🎙️</span>}
            </div>
            <div className="flex flex-row md:flex-col gap-3">
              {[{ loc: 'studio-setup', icon: '🎧' }, { loc: 'studio-vibe', icon: '🛋️' }].map(({ loc, icon }) => {
                const img = getImage(loc)
                return (
                  <div key={loc} className="flex-1 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center border border-white/5 group hover:border-[#8B5CF6]/30 transition overflow-hidden min-h-[100px] relative">
                    {img ? <Image src={img.url} alt={loc} fill className="object-cover group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }} sizes="(max-width: 768px) 50vw, 33vw" quality={60} /> : <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section id="expect" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-8 ${anim('expect')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Your Session</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What to Expect</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {whatToExpect.map((item, i) => (
              <div key={item.title} className={`text-center ${anim('expect')}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-8 ${anim('booking')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Book Now</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Pick Your Time</h2>
            <p className="text-gray-500 text-sm">Select a date, choose hours, and let's record.</p>
          </div>

          <div className={`grid lg:grid-cols-3 gap-6 ${anim('booking')}`}>
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">←</button>
                <h3 className="text-base font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-[10px] text-gray-500 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, i) => {
                  if (!date) return <div key={`e-${i}`} className="aspect-square" />
                  const isPast = isDateInPast(date), isBlocked = isDateFullyBlocked(date), isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isTodayDate = isToday(date), unavail = getUnavailableHours(date), partial = unavail.length > 0 && unavail.length < allHours.length
                  return (
                    <button key={date.toISOString()} onClick={() => handleDateSelect(date)} disabled={isPast || isBlocked}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition relative ${isPast || isBlocked ? 'text-gray-700 cursor-not-allowed' : isSelected ? 'bg-[#8B5CF6] text-white' : isTodayDate ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-white/5 text-gray-300'}`}>
                      {date.getDate()}
                      {isBlocked && !isPast && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
                      {partial && !isPast && !isBlocked && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-3 text-[10px] text-gray-500">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Blocked</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />Partial</div>
              </div>

              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                  <h4 className="font-semibold mb-3 text-sm">Hours for {formatDate(selectedDate)}</h4>
                  {loading ? (
                    <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" /></div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {allHours.map(h => {
                        const unavail = getUnavailableHours(selectedDate).includes(h), sel = selectedHours.includes(h)
                        return (
                          <button key={h} onClick={() => !unavail && toggleHour(h)} disabled={unavail}
                            className={`py-2 rounded-lg text-xs font-medium transition ${unavail ? 'bg-white/5 text-gray-600 cursor-not-allowed line-through' : sel ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}>
                            {h}:00
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 h-fit lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold mb-4">Your Booking</h3>
              {selectedDate ? (
                <>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Date</span><span>{formatDate(selectedDate)}</span></div>
                    {selectedHours.length > 0 && (
                      <>
                        <div className="flex justify-between"><span className="text-gray-400">Hours</span><span className="text-right">{selectedHours.map(h => `${h}:00`).join(', ')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Rate</span><span>€{getHourlyRate()}/h {selectedHours.length >= BULK_DISCOUNT_HOURS && <span className="text-[#8B5CF6]">(bulk!)</span>}</span></div>
                      </>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl border mb-4 cursor-pointer transition ${includeMixMaster ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`} onClick={() => setIncludeMixMaster(!includeMixMaster)}>
                    <div className="flex items-center justify-between">
                      <div><p className="font-medium text-sm">Add Mix & Master</p><p className="text-gray-500 text-xs">€{MIX_MASTER_RATE}/track</p></div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${includeMixMaster ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/30'}`}>{includeMixMaster && <span className="text-[10px]">✓</span>}</div>
                    </div>
                  </div>
                  {selectedHours.length > 0 && (
                    <div className="border-t border-white/10 pt-3 mb-4 flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-xl font-bold text-[#8B5CF6]">€{calculateTotal()}</span>
                    </div>
                  )}
                  <button onClick={openBookingModal} disabled={selectedHours.length === 0}
                    className={`w-full py-3 rounded-full font-semibold transition text-sm ${selectedHours.length > 0 ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}>
                    {selectedHours.length > 0 ? 'Continue' : 'Select Hours'}
                  </button>
                </>
              ) : (
                <p className="text-center py-6 text-gray-500 text-sm">Select a date to see hours</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-8 ${anim('testimonials')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Reviews</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What Artists Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-[#8B5CF6]/20 transition-all duration-500 ${anim('testimonials')}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-[#8B5CF6] text-sm">★</span>)}</div>
                <p className="text-gray-300 mb-4 italic text-sm">"{t.text}"</p>
                <div><p className="font-semibold text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.role}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 ${anim('location')}`}>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">Location</p>
                <h2 className="text-2xl font-bold tracking-tight mb-3">Studio in Trier</h2>
                <p className="text-gray-400 mb-4 text-sm">Cozy space, easy to find, parking available.</p>
                <div className="space-y-2 text-xs text-gray-400">
                  {[{ i: '📍', t: 'Trier, Germany' }, { i: '🕐', t: '10:00 - 22:00' }, { i: '📧', t: 'studio@trproductions.de' }].map(({ i, t }) => (
                    <div key={t} className="flex items-center gap-2"><span className="text-[#8B5CF6]">{i}</span>{t}</div>
                  ))}
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-xl flex items-center justify-center border border-white/5 overflow-hidden relative">
                {getImage('studio-location') ? <Image src={getImage('studio-location').url} alt="Location" fill className="object-cover" style={{ objectPosition: `${getImage('studio-location').focalX}% ${getImage('studio-location').focalY}%` }} sizes="(max-width: 768px) 100vw, 50vw" quality={60} /> : <span className="text-4xl">🏠</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeBookingModal} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <button onClick={closeBookingModal} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition">✕</button>
            <div className="p-5">
              {submitted ? (
                <div className="text-center py-6">
                  <span className="text-5xl block mb-3 animate-bounce-in">✅</span>
                  <h3 className="text-xl font-bold mb-2">Submitted!</h3>
                  <p className="text-gray-500 text-sm">I'll confirm within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-1">Complete Booking</h3>
                  <p className="text-gray-500 mb-6 text-sm">Fill in your details</p>
                  <div className="bg-white/5 rounded-xl p-3 mb-6 text-sm">
                    <div className="flex justify-between mb-1"><span className="text-gray-400">Date</span><span>{selectedDate && formatDate(selectedDate)}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-gray-400">Hours</span><span>{selectedHours.map(h => `${h}:00`).join(', ')}</span></div>
                    {includeMixMaster && <div className="flex justify-between mb-1"><span className="text-gray-400">Mix/Master</span><span>€{MIX_MASTER_RATE}</span></div>}
                    <div className="border-t border-white/10 pt-1 mt-1 flex justify-between font-semibold"><span>Total</span><span className="text-[#8B5CF6]">€{calculateTotal()}</span></div>
                  </div>
                  {submitError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-xs">{submitError}</div>}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {[{ k: 'name', t: 'text', p: 'Name *', r: true }, { k: 'email', t: 'email', p: 'Email *', r: true }, { k: 'phone', t: 'tel', p: 'Phone' }].map(f => (
                      <input key={f.k} type={f.t} required={f.r} value={formData[f.k]} onChange={(e) => setFormData({ ...formData, [f.k]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50" placeholder={f.p} />
                    ))}
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]/50 resize-none" placeholder="Message (optional)" />
                    <button type="submit" disabled={isSubmitting}
                      className={`w-full py-3 rounded-full font-semibold transition flex items-center justify-center gap-2 text-sm ${isSubmitting ? 'bg-white/10 text-gray-500' : 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105'}`}>
                      {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : 'Confirm Booking'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}