'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function StudioPage() {
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  })

  const packages = [
    {
      id: 'basic',
      name: 'Basic Session',
      price: 50,
      duration: '2 hours',
      icon: '🎤',
      features: [
        'Professional recording booth',
        'Basic mixing included',
        'MP3 & WAV export',
        'Engineer assistance'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Session',
      price: 120,
      duration: '5 hours',
      icon: '🎧',
      features: [
        'Professional recording booth',
        'Full mixing & mastering',
        'MP3, WAV & stems export',
        'Engineer assistance',
        'Beat selection help',
        '1 revision included'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Session',
      price: 250,
      duration: 'Full day (10 hours)',
      icon: '👑',
      features: [
        'Professional recording booth',
        'Full mixing & mastering',
        'All file formats + stems',
        'Dedicated engineer',
        'Beat production assistance',
        'Unlimited revisions',
        'Music video consultation',
        'Refreshments included'
      ]
    }
  ]

  const equipment = [
    { category: 'Microphones', icon: '🎙️', items: ['Neumann U87', 'Shure SM7B', 'AKG C414'] },
    { category: 'Preamps', icon: '🎛️', items: ['Universal Audio', 'Neve 1073', 'API 512c'] },
    { category: 'DAW', icon: '💻', items: ['Pro Tools', 'Logic Pro X', 'FL Studio'] },
    { category: 'Monitors', icon: '🔊', items: ['Yamaha HS8', 'Adam A7X', 'KRK Rokit 8'] },
    { category: 'Plugins', icon: '🎚️', items: ['Waves', 'FabFilter', 'Soundtoys', 'iZotope'] }
  ]

  const timeSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

  const testimonials = [
    { name: 'Marcus J.', role: 'Rapper', text: 'Best studio in Trier! The vibe is perfect for recording.', rating: 5 },
    { name: 'Sarah K.', role: 'Singer', text: 'Professional equipment and amazing engineers. Highly recommend!', rating: 5 },
    { name: 'DJ Flow', role: 'Producer', text: 'Recorded my entire album here. Top quality sound.', rating: 5 }
  ]

  const stats = [
    { value: '500+', label: 'Sessions' },
    { value: '200+', label: 'Artists' },
    { value: '50+', label: 'Albums' },
    { value: '5', label: 'Years' }
  ]

  const openBooking = (pkg) => {
    setSelectedPackage(pkg)
    setBookingStep(1)
    setShowBookingModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeBooking = () => {
    setShowBookingModal(false)
    document.body.style.overflow = 'unset'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Booking Request Submitted!\n\nPackage: ${selectedPackage.name}\nDate: ${formData.date}\nTime: ${formData.time}\n\nWe'll contact you at ${formData.email} to confirm.`)
    closeBooking()
    setFormData({ name: '', email: '', phone: '', date: '', time: '', message: '' })
  }

  const nextStep = () => {
    if (bookingStep < 3) setBookingStep(bookingStep + 1)
  }

  const prevStep = () => {
    if (bookingStep > 1) setBookingStep(bookingStep - 1)
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Background Gradient + Sound Waves - Same as Homepage */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.07] blur-[180px] rounded-full" />
        
        {/* Subtle sound wave lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundWaves" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 160 Q 100 120, 200 160 T 400 160 T 600 160 T 800 160 T 1000 160 T 1200 160 T 1400 160 T 1600 160 T 1800 160 T 2000 160 T 2200 160 T 2400 160" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundWaves)" />
        </svg>
      </div>

      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract wave shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.04]" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 300 Q 360 150, 720 300 T 1440 300 L 1440 600 L 0 600 Z" fill="url(#waveGradient)"/>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-[50%] opacity-[0.03]" viewBox="0 0 1440 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 Q 480 100, 960 250 T 1920 250 L 1920 500 L 0 500 Z" fill="url(#waveGradient2)"/>
          <defs>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle center glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Recording Studio
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Where Hits Are <span className="text-[#8B5CF6]">Made</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Professional recording studio in Trier, Germany. State-of-the-art equipment,
            experienced engineers, and a creative atmosphere to bring your vision to life.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a href="#packages" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition duration-150">
              View Packages
            </a>
            <a href="#gallery" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition duration-150">
              Explore Studio
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-[#8B5CF6] mb-2">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Virtual Tour</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Explore Our Space</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="col-span-2 row-span-2 aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-3xl flex items-center justify-center border border-white/5 hover:border-[#8B5CF6]/30 transition-all duration-300 group cursor-pointer">
              <div className="text-center">
                <span className="text-7xl block mb-4 group-hover:scale-110 transition-transform duration-300">🎙️</span>
                <p className="text-gray-400 group-hover:text-white transition-colors">Recording Booth</p>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 hover:border-[#8B5CF6]/30 transition-all duration-300 group cursor-pointer">
              <div className="text-center">
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🎚️</span>
                <p className="text-gray-500 text-sm group-hover:text-white transition-colors">Mixing Console</p>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 hover:border-[#8B5CF6]/30 transition-all duration-300 group cursor-pointer">
              <div className="text-center">
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🎧</span>
                <p className="text-gray-500 text-sm group-hover:text-white transition-colors">Listening Room</p>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 hover:border-[#8B5CF6]/30 transition-all duration-300 group cursor-pointer">
              <div className="text-center">
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🎹</span>
                <p className="text-gray-500 text-sm group-hover:text-white transition-colors">Production Suite</p>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 hover:border-[#8B5CF6]/30 transition-all duration-300 group cursor-pointer">
              <div className="text-center">
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🔊</span>
                <p className="text-gray-500 text-sm group-hover:text-white transition-colors">Monitor Setup</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Session Packages</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Choose the perfect package for your project. All sessions include professional engineering.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.15 } }}
                className={`relative bg-white/[0.02] border rounded-3xl p-8 transition-all duration-150 ${
                  pkg.popular ? 'border-[#8B5CF6]/50 ring-1 ring-[#8B5CF6]/20' : 'border-white/5 hover:border-white/10'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-xs px-4 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                )}

                <div className="text-4xl mb-4">{pkg.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{pkg.duration}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">€{pkg.price}</span>
                  <span className="text-gray-500 ml-2">/ session</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="text-[#8B5CF6] mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openBooking(pkg)}
                  className={`w-full py-3 rounded-full font-semibold transition duration-150 ${
                    pkg.popular
                      ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Professional Gear</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Studio Equipment</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Industry-standard equipment for the best sound quality.</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {equipment.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-all duration-150"
              >
                <span className="text-3xl block mb-4">{cat.icon}</span>
                <h3 className="font-semibold text-[#8B5CF6] mb-4">{cat.category}</h3>
                <ul className="space-y-2">
                  {cat.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-400">{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">What Artists Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#8B5CF6]">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Location</p>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Find Us in Trier</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Our studio is located in the heart of Trier, Germany. Easy to reach by public transport
                and with parking available nearby. We're here to make your recording experience as smooth as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-xl">📍</div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-500 text-sm">Musterstraße 123, 54290 Trier</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-xl">🕐</div>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-gray-500 text-sm">Mon - Sat: 10:00 - 22:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-xl">📧</div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500 text-sm">studio@trproductions.de</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-xl">📱</div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-500 text-sm">+49 123 456 789</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-3xl flex items-center justify-center border border-white/5">
              <div className="text-center">
                <span className="text-7xl block mb-4">🗺️</span>
                <p className="text-gray-400">Map Integration</p>
                <p className="text-gray-600 text-sm">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/20 rounded-3xl p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Ready to Record?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Book your session today and take the first step towards your next hit.
            </p>
            <button
              onClick={() => openBooking(packages[1])}
              className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition duration-150"
            >
              Book a Session
            </button>
          </motion.div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBooking}
            />

            <motion.div
              className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button
                onClick={closeBooking}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition z-10"
              >
                ✕
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <span className="text-4xl block mb-2">{selectedPackage?.icon}</span>
                  <h3 className="text-2xl font-bold mb-1">{selectedPackage?.name}</h3>
                  <p className="text-[#8B5CF6] font-semibold">€{selectedPackage?.price} / {selectedPackage?.duration}</p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                        bookingStep >= step ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-500'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`w-8 h-0.5 ${bookingStep > step ? 'bg-[#8B5CF6]' : 'bg-white/10'}`} />
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-center mb-4">Select Date & Time</h4>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Date *</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Time *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setFormData({ ...formData, time })}
                              className={`py-2 rounded-lg text-sm font-medium transition ${
                                formData.time === time
                                  ? 'bg-[#8B5CF6] text-white'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!formData.date || !formData.time}
                        className={`w-full py-3 rounded-full font-semibold transition mt-4 ${
                          formData.date && formData.time
                            ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-center mb-4">Your Details</h4>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50"
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50"
                          placeholder="+49 123 456789"
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-3 rounded-full font-semibold bg-white/5 hover:bg-white/10 transition"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={!formData.name || !formData.email}
                          className={`flex-1 py-3 rounded-full font-semibold transition ${
                            formData.name && formData.email
                              ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                              : 'bg-white/10 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-center mb-4">Confirm Booking</h4>

                      <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Package</span>
                          <span>{selectedPackage?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration</span>
                          <span>{selectedPackage?.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Date</span>
                          <span>{formData.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Time</span>
                          <span>{formData.time}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Name</span>
                          <span>{formData.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Email</span>
                          <span>{formData.email}</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-[#8B5CF6]">€{selectedPackage?.price}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
                          placeholder="Tell us about your project..."
                        />
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 py-3 rounded-full font-semibold bg-white/5 hover:bg-white/10 transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-full font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}