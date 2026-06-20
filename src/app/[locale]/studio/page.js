'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { useT } from '@/i18n/I18nProvider'

export default function StudioPage() {
  const t = useT()
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', preferredTime: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [siteImages, setSiteImages] = useState([])
  const [visibleSections, setVisibleSections] = useState({})
  const [testimonials, setTestimonials] = useState([])
  const [weeklySchedule, setWeeklySchedule] = useState(null)

  const HOURLY_RATE = 30, MIX_MASTER_RATE = 150, BULK_RATE = 25

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const whatToExpect = [
    { icon: '🎤', title: t('studio.expect.recordingTitle'), text: t('studio.expect.recordingText') },
    { icon: '🎧', title: t('studio.expect.engineerTitle'), text: t('studio.expect.engineerText') },
    { icon: '💾', title: t('studio.expect.filesTitle'), text: t('studio.expect.filesText') },
    { icon: '☕', title: t('studio.expect.vibeTitle'), text: t('studio.expect.vibeText') },
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
    Promise.all([fetchSiteImages(), fetchTestimonials(), fetchSchedule()])
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisibleSections(p => ({ ...p, [e.target.id]: true }))),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('[data-animate]').forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [mounted])

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/studio-schedule')
      const data = await res.json()
      if (data.schedule) setWeeklySchedule(data.schedule)
    } catch (e) { console.error('Failed to fetch schedule:', e) }
  }
  const fetchSiteImages = async () => { const { data } = await supabase.from('site_images').select('*').eq('is_active', true); setSiteImages(data || []) }
  const fetchTestimonials = async () => {
    const { data } = await supabase.from('testimonials').select('*').eq('is_active', true).or('page.eq.all,page.eq.studio').order('display_order', { ascending: true })
    setTestimonials(data || [])
  }

  const getImage = (loc) => {
    const img = siteImages.find(img => img.location === loc)
    return img ? { url: img.image_url, focalX: img.focal_x ?? 50, focalY: img.focal_y ?? 50 } : null
  }
  const anim = (id) => `transition-all duration-1000 ${visibleSections[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true); setSubmitError(null)
    try {
      const res = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'studio',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          service: formData.service || null,
          preferredTime: formData.preferredTime || null,
          message: formData.message || null,
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || t('studio.form.errSend'))
      setSubmitted(true)
    } catch (err) { setSubmitError(err.message || t('studio.form.errSend')) }
    finally { setIsSubmitting(false) }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">

      <Background />

      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{t('studio.hero.label')}</p>
          <h1 className={`text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{t('studio.hero.titlePre')} <span className="text-[#8B5CF6]">TR</span></h1>
          <p className={`text-base md:text-lg text-gray-400 mb-6 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{t('studio.hero.subtitle')}</p>
          <div className={`flex flex-col sm:flex-row justify-center gap-3 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a href="#request" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105">{t('studio.hero.ctaRequest')}</a>
            <a href="#pricing" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition">{t('studio.hero.ctaPricing')}</a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-8 md:mb-12 ${anim('pricing')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.pricing.label')}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('studio.pricing.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {[
              { icon: '🎙️', title: t('studio.pricing.recTitle'), sub: t('studio.pricing.recSub'), price: HOURLY_RATE, unit: t('studio.pricing.unitHour'), badge: `💡 ${t('studio.pricing.recBadgePre')} €${BULK_RATE}/${t('studio.pricing.unitHour')}`, features: [t('studio.pricing.recF1'), t('studio.pricing.recF2'), t('studio.pricing.recF3'), t('studio.pricing.recF4')] },
              { icon: '🎚️', title: 'Mix & Master', sub: t('studio.pricing.mixSub'), price: MIX_MASTER_RATE, unit: t('studio.pricing.unitTrack'), badge: t('studio.pricing.mixBadge'), features: [t('studio.pricing.mixF1'), t('studio.pricing.mixF2'), t('studio.pricing.mixF3'), t('studio.pricing.mixF4')] }
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
          <p className={`text-center text-gray-500 text-sm mt-6 ${anim('pricing')}`}>{t('studio.pricing.note')}</p>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 ${anim('gallery')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.gallery.label')}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('studio.gallery.title')}</h2>
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
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.expect.label')}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('studio.expect.title')}</h2>
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

      {/* Request a Session */}
      <section id="request" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className={`text-center mb-8 ${anim('request')}`}>
            <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.request.label')}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">{t('studio.request.title')}</h2>
            <p className="text-gray-500 text-sm">{t('studio.request.subtitle')}</p>
          </div>

          <div className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 ${anim('request')}`}>
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-3">✅</span>
                <h3 className="text-2xl font-bold mb-2">{t('studio.success.title')}</h3>
                <p className="text-gray-500 text-sm mb-4">{t('studio.success.text')}</p>
                <div className="bg-white/5 rounded-2xl p-4 inline-block">
                  <p className="text-sm text-gray-400">{t('studio.success.reach')}</p>
                  <a href="mailto:studio@trproductions.de" className="text-[#8B5CF6] font-bold">studio@trproductions.de</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{submitError}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('studio.form.nameLabel')} *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder={t('studio.form.namePlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('studio.form.emailLabel')} *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('studio.form.phoneLabel')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder={t('studio.form.phonePlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('studio.form.serviceLabel')}</label>
                    <select value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition">
                      <option value="">{t('studio.form.servicePlaceholder')}</option>
                      {[
                        { value: 'Recording session', label: t('studio.form.svcRecording') },
                        { value: 'Recording + Mix & Master', label: t('studio.form.svcRecMix') },
                        { value: 'Mix & Master only', label: t('studio.form.svcMixOnly') },
                        { value: 'Other', label: t('studio.form.svcOther') }
                      ].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('studio.form.timeLabel')}</label>
                  <input type="text" value={formData.preferredTime} onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder={t('studio.form.timePlaceholder')} />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('studio.form.msgLabel')}</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none" placeholder={t('studio.form.msgPlaceholder')} />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className={`w-full py-4 rounded-full font-bold transition flex items-center justify-center gap-2 text-lg ${isSubmitting ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}>
                  {isSubmitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('studio.form.sending')}</> : t('studio.form.send')}
                </button>
                <p className="text-center text-gray-600 text-xs">{t('studio.form.note')}</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className={`text-center mb-8 ${anim('testimonials')}`}>
              <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.testimonials.label')}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('studio.testimonials.title')}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map((t, i) => (
                <div key={t.id} className={`bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-[#8B5CF6]/20 transition-all duration-500 ${anim('testimonials')}`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="flex gap-1 mb-3">{[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-[#8B5CF6] text-sm">★</span>)}</div>
                  <p className="text-gray-300 mb-4 italic text-sm">"{t.text}"</p>
                  <div><p className="font-semibold text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section id="location" data-animate className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 ${anim('location')}`}>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-gray-500 font-medium mb-3 tracking-[0.2em] uppercase text-xs">{t('studio.location.label')}</p>
                <h2 className="text-2xl font-bold tracking-tight mb-3">{t('studio.location.title')}</h2>
                <p className="text-gray-400 mb-4 text-sm">{t('studio.location.desc')}</p>
                <div className="space-y-2 text-xs text-gray-400">
                  {[{ i: '📍', t: t('studio.location.country') }, { i: '🕐', t: weeklySchedule ? (() => { const open = weeklySchedule.filter(d => d.is_open); if (open.length === 0) return t('studio.location.closed'); const minH = Math.min(...open.map(d => d.open_hour)); const maxH = Math.max(...open.map(d => d.close_hour)); return `${String(minH).padStart(2,'0')}:00 - ${String(maxH).padStart(2,'0')}:00`; })() : '10:00 - 22:00' }, { i: '📧', t: 'studio@trproductions.de' }].map(({ i, t }) => (
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

      <Footer />
    </main>
  )
}
