'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [activeFaq, setActiveFaq] = useState(null)

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      value: 'info@trproductions.de',
      description: 'Best for detailed inquiries',
      action: 'mailto:info@trproductions.de',
      responseTime: 'Usually within 24 hours'
    },
    {
      icon: '📱',
      title: 'Phone',
      value: '+49 123 456 789',
      description: 'For urgent matters',
      action: 'tel:+49123456789',
      responseTime: 'Mon-Sat, 10:00-20:00'
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'Trier, Germany',
      description: 'Home studio sessions',
      action: null,
      responseTime: 'By appointment only'
    },
    {
      icon: '💬',
      title: 'Instagram DM',
      value: '@trproductions',
      description: 'Quick questions and updates',
      action: 'https://instagram.com/trproductions',
      responseTime: 'Usually within a few hours'
    }
  ]

  const subjects = [
    { value: '', label: 'Select a topic' },
    { value: 'Beat Inquiry / Licensing', label: 'Beat Inquiry / Licensing' },
    { value: 'Studio Session Booking', label: 'Studio Session Booking' },
    { value: 'Mix and Master Service', label: 'Mix and Master Service' },
    { value: 'Collaboration', label: 'Collaboration' },
    { value: 'Other', label: 'Other' }
  ]

  const faqs = [
    {
      question: 'How fast do you respond?',
      answer: 'I typically respond to emails within 24 hours. For urgent matters, call or DM me on Instagram for a faster response.'
    },
    {
      question: 'Can I visit the studio before booking?',
      answer: 'Yes! I offer a free 15-minute studio tour so you can check out the space and vibe before committing to a session.'
    },
    {
      question: 'Do you offer custom beats?',
      answer: 'Absolutely. If you do not find what you are looking for in the store, reach out and we can discuss a custom beat tailored to your style.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'Beat licenses are non-refundable. For studio sessions, cancellations with 24+ hours notice get a full refund. Mix and master projects can be refunded before work begins.'
    },
    {
      question: 'Do you work with beginners?',
      answer: '100%. Everyone starts somewhere. I love working with new artists and helping them develop their sound.'
    }
  ]

  const socialLinks = [
    { name: 'Instagram', icon: '📸', url: '#', handle: '@trproductions' },
    { name: 'YouTube', icon: '🎬', url: '#', handle: 'TR Productions' },
    { name: 'TikTok', icon: '🎵', url: '#', handle: '@trproductions' },
    { name: 'Twitter', icon: '🐦', url: '#', handle: '@tr_beats' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          is_read: false
        }])
        .select()

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)

    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitError(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Background Effects */}
<div className="fixed inset-0 pointer-events-none overflow-hidden">
  {/* Main gradient glow */}
  <div 
    className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.08] rounded-full animate-glow-pulse"
    style={{ filter: 'blur(150px)' }}
  />
  
  {/* Secondary glow - bottom right */}
  <div 
    className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.05] rounded-full"
    style={{ filter: 'blur(120px)' }}
  />
  
  {/* Accent glow - left side */}
  <div 
    className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#6D28D9] opacity-[0.04] rounded-full"
    style={{ filter: 'blur(100px)' }}
  />
  
  {/* Grid pattern - desktop only */}
  <div 
    className="absolute inset-0 opacity-[0.03] hidden md:block"
    style={{
      backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
    }}
  />
  
  {/* Sound waves SVG - desktop only */}
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] hidden md:block" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="soundWavesStudio" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
        <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
        <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
        <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="0.5" fill="none"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#soundWavesStudio)" />
  </svg>

  {/* Gradient fade at bottom */}
  <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
  
  {/* Noise texture */}
  <div 
    className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
    }}
  />
</div>

<Header />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            className="text-[#8B5CF6] font-medium mb-4 tracking-[0.2em] uppercase text-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Get In Touch
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Lets <span className="text-[#8B5CF6]">Talk</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Got a question? Want to work together? Or just want to say hi? I am always happy to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="relative py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {method.action ? (
                  <a
                    href={method.action}
                    target={method.action.startsWith('http') ? '_blank' : undefined}
                    rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block h-full"
                  >
                    <ContactCard method={method} />
                  </a>
                ) : (
                  <ContactCard method={method} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Form + Info */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
                <p className="text-gray-500 mb-8">Fill out the form and I will get back to you within 24 hours.</p>

                {submitted ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="text-6xl block mb-4">✅</span>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-gray-500">I will get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                        {submitError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition"
                      >
                        {subjects.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Message *</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none"
                        placeholder="Tell me about your project, question, or just say hi..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-full font-semibold transition flex items-center justify-center gap-2 ${
                        isSubmitting
                          ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                          : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Sidebar Info */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Response Time */}
              <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-semibold">Quick Response</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  I typically respond to all inquiries within 24 hours. For urgent matters, give me a call or send a DM.
                </p>
                <div className="flex items-center gap-2 text-[#8B5CF6] text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Usually online
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Follow Me</h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{social.icon}</span>
                        <span className="font-medium">{social.name}</span>
                      </div>
                      <span className="text-gray-500 text-sm group-hover:text-[#8B5CF6] transition">
                        {social.handle}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Location</h3>
                <div className="aspect-video bg-gradient-to-br from-[#8B5CF6]/10 to-[#050505] rounded-xl flex items-center justify-center border border-white/5 mb-4">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📍</span>
                    <p className="text-gray-500 text-sm">Trier, Germany</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Home studio in Trier. Exact address shared after booking confirmation.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Before You Ask</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <span className={`text-[#8B5CF6] transition-transform text-xl ${activeFaq === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Ready to Start?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Whether you need beats, studio time, or mixing services - I got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/beats" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition">
                Browse Beats
              </a>
              <a href="/studio" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                Book Studio
              </a>
              <a href="/mixing" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition">
                Mix and Master
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function ContactCard({ method }) {
  return (
    <motion.div
      className="h-full bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition cursor-pointer group"
      whileHover={{ y: -5 }}
    >
      <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{method.icon}</span>
      <h3 className="font-semibold mb-1">{method.title}</h3>
      <p className="text-[#8B5CF6] text-sm mb-2">{method.value}</p>
      <p className="text-gray-500 text-xs">{method.description}</p>
      <p className="text-gray-600 text-xs mt-2">{method.responseTime}</p>
    </motion.div>
  )
}