'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Background from '@/app/components/Background'
import { useT, useLocale } from '@/i18n/I18nProvider'

export default function ContactPage() {
  const t = useT()
  const locale = useLocale()
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setMounted(true)
  }, [])

  // Contact method values (email / handle) stay literal; the city is translated.
  const contactMethods = [
    { icon: '📧', title: t('contact.methods.emailTitle'), value: 'contact@trproductions.de', desc: t('contact.methods.emailDesc'), action: 'mailto:contact@trproductions.de', time: t('contact.methods.emailTime') },
    { icon: '📍', title: t('contact.methods.locationTitle'), value: t('contact.methods.locationValue'), desc: t('contact.methods.locationDesc'), action: null, time: t('contact.methods.locationTime') },
    { icon: '💬', title: t('contact.methods.igTitle'), value: '@tr.productionz', desc: t('contact.methods.igDesc'), action: 'https://www.instagram.com/tr.productionz/', time: t('contact.methods.igTime') }
  ]

  // Subject `value` stays English (stored in DB); only the label is translated.
  const subjects = [
    { value: '', label: t('contact.subjects.select') },
    { value: 'Beat Inquiry / Licensing', label: t('contact.subjects.beat') },
    { value: 'Studio Session Booking', label: t('contact.subjects.studio') },
    { value: 'Mix and Master Service', label: t('contact.subjects.mix') },
    { value: 'Collaboration', label: t('contact.subjects.collab') },
    { value: 'Other', label: t('contact.subjects.other') }
  ]

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
    { q: t('contact.faq.q5'), a: t('contact.faq.a5') }
  ]

  const socials = [
    { name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/tr.productionz/', handle: '@tr.productionz' },
    { name: 'YouTube', icon: '🎬', url: 'https://www.youtube.com/@trproductionz', handle: '@trproductionz' },
    { name: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/@trproductions', handle: '@trproductions' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const { error } = await supabase.from('contact_messages').insert([{ name: formData.name, email: formData.email, subject: formData.subject, message: formData.message, is_read: false }])
      if (error) throw error
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setSubmitError(err.message || t('contact.form.errSend'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      
<Background />

      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial="hidden" animate={mounted ? "visible" : "hidden"} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.p variants={fadeUp} className="text-[#8B5CF6] font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">{t('contact.hero.label')}</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6">{t('contact.hero.titlePre')} <span className="text-[#8B5CF6]">{t('contact.hero.titleHighlight')}</span></motion.h1>
            <motion.p variants={fadeUp} className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('contact.hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {contactMethods.map((m, i) => (
              <motion.div key={m.title} initial="hidden" animate={mounted ? "visible" : "hidden"} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                {m.action ? (
                  <a href={m.action} target={m.action.startsWith('http') ? '_blank' : undefined} rel={m.action.startsWith('http') ? 'noopener noreferrer' : undefined} className="block h-full">
                    <ContactCard m={m} />
                  </a>
                ) : (
                  <ContactCard m={m} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="relative py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 md:gap-12">
            
            {/* Form */}
            <motion.div className="lg:col-span-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{t('contact.form.title')}</h2>
                <p className="text-gray-500 mb-6 md:mb-8 text-sm">{t('contact.form.subtitle')}</p>

                {submitted ? (
                  <motion.div className="text-center py-8 md:py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <span className="text-5xl md:text-6xl block mb-3 md:mb-4">✅</span>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{t('contact.form.successTitle')}</h3>
                    <p className="text-gray-500 text-sm">{t('contact.form.successText')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {submitError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 text-red-400 text-xs md:text-sm">{submitError}</div>}

                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                      {[{ k: 'name', t: 'text', l: t('contact.form.nameLabel'), p: t('contact.form.namePlaceholder') }, { k: 'email', t: 'email', l: t('contact.form.emailLabel'), p: 'your@email.com' }].map(f => (
                        <div key={f.k}>
                          <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{f.l} *</label>
                          <input type={f.t} required value={formData[f.k]} onChange={(e) => setFormData({ ...formData, [f.k]: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-base md:text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" placeholder={f.p} />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{t('contact.form.subjectLabel')} *</label>
                      <select required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition">
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm text-gray-400 mb-1.5 md:mb-2">{t('contact.form.messageLabel')} *</label>
                      <textarea required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
                        placeholder={t('contact.form.messagePlaceholder')} />
                    </div>

                    <button type="submit" disabled={isSubmitting}
                      className={`w-full py-3 md:py-4 rounded-full font-semibold transition flex items-center justify-center gap-2 text-sm md:text-base ${isSubmitting ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105 text-white'}`}>
                      {isSubmitting ? <><div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('contact.form.sending')}</> : t('contact.form.send')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div className="lg:col-span-2 space-y-4 md:space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
              {/* Response Time */}
              <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">⚡</span>
                  <h3 className="font-semibold text-sm md:text-base">{t('contact.sidebar.quickResponse')}</h3>
                </div>
                <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">{t('contact.sidebar.responseText')}</p>
                <div className="flex items-center gap-2 text-[#8B5CF6] text-xs md:text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{t('contact.sidebar.online')}
                </div>
              </div>

              {/* Socials */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t('contact.sidebar.followMe')}</h3>
                <div className="space-y-2 md:space-y-3">
                  {socials.map(s => (
                    <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-white/10 transition group">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-lg md:text-xl">{s.icon}</span>
                        <span className="font-medium text-sm">{s.name}</span>
                      </div>
                      <span className="text-gray-500 text-xs md:text-sm group-hover:text-[#8B5CF6] transition">{s.handle}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">{t('contact.sidebar.location')}</h3>
                <div className="aspect-video bg-gradient-to-br from-[#8B5CF6]/10 to-[#050505] rounded-lg md:rounded-xl flex items-center justify-center border border-white/5 mb-3 md:mb-4">
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl block mb-1 md:mb-2">📍</span>
                    <p className="text-gray-500 text-xs md:text-sm">{t('contact.sidebar.city')}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">{t('contact.sidebar.locationNote')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-8 md:mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-gray-500 font-medium mb-3 md:mb-4 tracking-[0.2em] uppercase text-xs">{t('contact.faq.label')}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('contact.faq.title')}</h2>
          </motion.div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition">
                  <span className="font-medium pr-4 text-sm md:text-base">{faq.q}</span>
                  <span className={`text-[#8B5CF6] transition-transform text-lg md:text-xl ${activeFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-4 md:px-6 pb-4 md:pb-5 text-gray-400 text-xs md:text-sm leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 md:mb-4">{t('contact.cta.title')}</h2>
            <p className="text-gray-400 mb-6 md:mb-8 max-w-xl mx-auto text-sm md:text-base">{t('contact.cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4">
              <a href={`/${locale}/beats`} className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition-all hover:scale-105 text-sm md:text-base">{t('contact.cta.browseBeats')}</a>
              <a href={`/${locale}/studio`} className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition text-sm md:text-base">{t('contact.cta.bookStudio')}</a>
              <a href={`/${locale}/mixing`} className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold transition text-sm md:text-base">Mix & Master</a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function ContactCard({ m }) {
  return (
    <div className="h-full bg-white/[0.02] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition cursor-pointer group">
      <span className="text-2xl md:text-3xl block mb-2 md:mb-3 group-hover:scale-110 transition-transform">{m.icon}</span>
      <h3 className="font-semibold mb-0.5 md:mb-1 text-sm md:text-base">{m.title}</h3>
      <p className="text-[#8B5CF6] text-xs md:text-sm mb-1 md:mb-2">{m.value}</p>
      <p className="text-gray-500 text-[10px] md:text-xs">{m.desc}</p>
      <p className="text-gray-600 text-[10px] md:text-xs mt-1 md:mt-2">{m.time}</p>
    </div>
  )
}