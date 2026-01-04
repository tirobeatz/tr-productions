'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function StudioPage() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHours, setSelectedHours] = useState([])
  const [includeMixMaster, setIncludeMixMaster] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const HOURLY_RATE = 30
  const MIX_MASTER_RATE = 60
  const BULK_DISCOUNT_HOURS = 5
  const BULK_RATE = 25

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Empty cells for days before the 1st
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  // Simulated booked hours (in real app, this would come from a database)
  const getBookedHours = (date) => {
    if (!date) return []
    const dateStr = date.toDateString()
    
    // Simulate some booked slots
    const bookedSlots = {
      [new Date(2025, 0, 6).toDateString()]: [10, 11, 14],
      [new Date(2025, 0, 8).toDateString()]: [12, 13, 14, 15],
      [new Date(2025, 0, 10).toDateString()]: [16, 17, 18],
    }
    
    return bookedSlots[dateStr] || []
  }

  // Available hours (10:00 - 22:00)
  const allHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (date) => {
    const today = new Date()
    return date && date.toDateString() === today.toDateString()
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const toggleHour = (hour) => {
    setSelectedHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    )
  }

  const calculateTotal = () => {
    const hours = selectedHours.length
    const hourlyTotal = hours >= BULK_DISCOUNT_HOURS 
      ? hours * BULK_RATE 
      : hours * HOURLY_RATE
    const mixMasterTotal = includeMixMaster ? MIX_MASTER_RATE : 0
    return hourlyTotal + mixMasterTotal
  }

  const getHourlyRate = () => {
    return selectedHours.length >= BULK_DISCOUNT_HOURS ? BULK_RATE : HOURLY_RATE
  }

  const openBookingModal = () => {
    if (selectedDate && selectedHours.length > 0) {
      setShowBookingModal(true)
      document.body.style.overflow = 'hidden'
    }
  }

  const closeBookingModal = () => {
    setShowBookingModal(false)
    document.body.style.overflow = 'unset'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const hoursFormatted = selectedHours.map(h => `${h}:00`).join(', ')
    alert(`Booking Request Submitted!\n\nDate: ${formatDate(selectedDate)}\nHours: ${hoursFormatted}\nTotal: €${calculateTotal()}\n\nWe'll contact you at ${formData.email} to confirm.`)
    closeBookingModal()
    setSelectedDate(null)
    setSelectedHours([])
    setIncludeMixMaster(false)
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const testimonials = [
    { name: 'Marcus J.', role: 'Rapper', text: 'Super chill vibe. TR knows how to get the best take out of you. Felt like home.', rating: 5 },
    { name: 'Sarah K.', role: 'Singer', text: 'Finally a studio where I don\'t feel rushed. Fair prices, great results!', rating: 5 },
  ]

  const whatToExpect = [
    { icon: '🎤', title: 'Recording', text: 'Professional vocal recording with guidance and direction' },
    { icon: '🎧', title: 'Engineer Included', text: 'I handle all the technical stuff so you can focus on performing' },
    { icon: '💾', title: 'Your Files', text: 'Get your recorded tracks in WAV format after the session' },
    { icon: '☕', title: 'Relaxed Vibe', text: 'Cozy studio atmosphere, no stress, just creativity' },
  ]

  return (
    <main className="min-h-screen bg-[#050505] text-white relative">
      
      {/* Background - Same as Homepage */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8B5CF6] opacity-[0.07] blur-[180px] rounded-full" />
        
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundWavesStudio" x="0" y="0" width="100%" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 Q 150 50, 300 100 T 600 100 T 900 100 T 1200 100 T 1500 100 T 1800 100 T 2100 100 T 2400 100" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 130 Q 200 80, 400 130 T 800 130 T 1200 130 T 1600 130 T 2000 130 T 2400 130" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 160 Q 100 120, 200 160 T 400 160 T 600 160 T 800 160 T 1000 160 T 1200 160 T 1400 160 T 1600 160 T 1800 160 T 2000 160 T 2200 160 T 2400 160" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
              <path d="M0 70 Q 250 30, 500 70 T 1000 70 T 1500 70 T 2000 70 T 2500 70" stroke="#8B5CF6" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundWavesStudio)" />
        </svg>
      </div>

      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.04]" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 300 Q 360 150, 720 300 T 1440 300 L 1440 600 L 0 600 Z" fill="url(#waveGradientStudio)"/>
          <defs>
            <linearGradient id="waveGradientStudio" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-[50%] opacity-[0.03]" viewBox="0 0 1440 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 Q 480 100, 960 250 T 1920 250 L 1920 500 L 0 500 Z" fill="url(#waveGradient2Studio)"/>
          <defs>
            <linearGradient id="waveGradient2Studio" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Recording Studio in Trier
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Record With <span className="text-[#8B5CF6]">TR</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Cozy creative space, personal attention, and professional results. 
            Book by the hour and let's make your vision come to life.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a href="#booking" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8 py-4 rounded-full font-semibold transition duration-150">
              Book a Session
            </a>
            <a href="#pricing" className="border border-white/20 hover:border-white/40 hover:bg-white/5 px-8 py-4 rounded-full font-semibold transition duration-150">
              View Pricing
            </a>
          </motion.div>
        </div>
      </section>

      {/* Simple Pricing Section */}
      <section id="pricing" className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Simple Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">No Hidden Fees</h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Recording Session */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">🎙️</div>
              <h3 className="text-2xl font-bold mb-2">Recording Session</h3>
              <p className="text-gray-500 mb-6">Engineer included</p>
              <div className="mb-4">
                <span className="text-5xl font-bold">€{HOURLY_RATE}</span>
                <span className="text-gray-500 ml-2">/ hour</span>
              </div>
              <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#8B5CF6]">
                  💡 Book 5+ hours and pay only <span className="font-bold">€{BULK_RATE}/hour</span>
                </p>
              </div>
              <ul className="text-left space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Professional vocal recording
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Recording engineer included
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  WAV files delivered
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Relaxed studio vibe
                </li>
              </ul>
            </div>

            {/* Mix & Master */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">🎚️</div>
              <h3 className="text-2xl font-bold mb-2">Mix & Master</h3>
              <p className="text-gray-500 mb-6">Per track</p>
              <div className="mb-4">
                <span className="text-5xl font-bold">€{MIX_MASTER_RATE}</span>
                <span className="text-gray-500 ml-2">/ track</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400">
                  Add to your booking or order separately
                </p>
              </div>
              <ul className="text-left space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Professional mixing
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Mastering included
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  Radio-ready sound
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8B5CF6]">✓</span>
                  1 revision included
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Studio Gallery */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">The Space</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Where The Magic Happens</h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="md:col-span-2 aspect-video bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 group hover:border-[#8B5CF6]/30 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <span className="text-7xl block mb-4 group-hover:scale-110 transition-transform duration-300">🎙️</span>
                <p className="text-gray-400">Studio Photo</p>
                <p className="text-gray-600 text-sm">Upload your image</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex-1 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 group hover:border-[#8B5CF6]/30 transition-all duration-300 cursor-pointer py-8">
                <div className="text-center">
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🎧</span>
                  <p className="text-gray-500 text-sm">Setup</p>
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5 group hover:border-[#8B5CF6]/30 transition-all duration-300 cursor-pointer py-8">
                <div className="text-center">
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-300">🛋️</span>
                  <p className="text-gray-500 text-sm">Vibe</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Your Session</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">What to Expect</h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {whatToExpect.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Booking Calendar Section */}
      <section id="booking" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Book Now</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Pick Your Time</h2>
            <p className="text-gray-500">Select a date, choose your hours, and let's record.</p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  ←
                </button>
                <h3 className="text-xl font-semibold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const isPast = isDateInPast(date)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isTodayDate = isToday(date)

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => !isPast && setSelectedDate(date)}
                      disabled={isPast}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        isPast 
                          ? 'text-gray-700 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#8B5CF6] text-white'
                            : isTodayDate
                              ? 'bg-white/10 text-white hover:bg-white/20'
                              : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-8 border-t border-white/10"
                >
                  <h4 className="font-semibold mb-4">
                    Available hours for {formatDate(selectedDate)}
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {allHours.map(hour => {
                      const isBooked = getBookedHours(selectedDate).includes(hour)
                      const isSelected = selectedHours.includes(hour)

                      return (
                        <button
                          key={hour}
                          onClick={() => !isBooked && toggleHour(hour)}
                          disabled={isBooked}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            isBooked
                              ? 'bg-white/5 text-gray-600 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-[#8B5CF6] text-white'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {hour}:00
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    <span className="inline-block w-3 h-3 bg-white/5 rounded mr-2"></span>Available
                    <span className="inline-block w-3 h-3 bg-[#8B5CF6] rounded mx-2 ml-4"></span>Selected
                    <span className="inline-block w-3 h-3 bg-white/5 rounded mx-2 ml-4 line-through"></span>Booked
                  </p>
                </motion.div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-fit sticky top-24">
              <h3 className="text-xl font-semibold mb-6">Your Booking</h3>

              {selectedDate ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Date</span>
                      <span>{formatDate(selectedDate)}</span>
                    </div>

                    {selectedHours.length > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Hours</span>
                          <span>{selectedHours.map(h => `${h}:00`).join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration</span>
                          <span>{selectedHours.length} hour{selectedHours.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Rate</span>
                          <span>
                            €{getHourlyRate()}/hour
                            {selectedHours.length >= BULK_DISCOUNT_HOURS && (
                              <span className="text-[#8B5CF6] ml-1">(bulk discount!)</span>
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mix & Master Add-on */}
                  <div 
                    className={`p-4 rounded-xl border mb-6 cursor-pointer transition-all ${
                      includeMixMaster 
                        ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setIncludeMixMaster(!includeMixMaster)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Add Mix & Master</p>
                        <p className="text-gray-500 text-xs">€{MIX_MASTER_RATE} per track</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        includeMixMaster ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/30'
                      }`}>
                        {includeMixMaster && <span className="text-xs">✓</span>}
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  {selectedHours.length > 0 && (
                    <div className="border-t border-white/10 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total</span>
                        <span className="text-2xl font-bold text-[#8B5CF6]">€{calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={openBookingModal}
                    disabled={selectedHours.length === 0}
                    className={`w-full py-4 rounded-full font-semibold transition ${
                      selectedHours.length > 0
                        ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedHours.length > 0 ? 'Continue Booking' : 'Select Hours'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Select a date to see available hours</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Reviews</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">What Artists Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
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

      {/* Location */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-500 font-medium mb-4 tracking-[0.2em] uppercase text-xs">Location</p>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Recording Studio in Trier</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Cozy creative space in a relaxed environment. Easy to find, parking available, 
                  and all the essentials for a productive session.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#8B5CF6]">📍</span>
                    <span className="text-gray-400">Trier, Germany (exact address after booking)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#8B5CF6]">🕐</span>
                    <span className="text-gray-400">10:00 - 22:00 (flexible)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#8B5CF6]">📧</span>
                    <span className="text-gray-400">studio@trproductions.de</span>
                  </div>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-[#8B5CF6]/20 to-[#050505] rounded-2xl flex items-center justify-center border border-white/5">
                <div className="text-center">
                  <span className="text-5xl block mb-2">🏠</span>
                  <p className="text-gray-500 text-sm">Pro Studio Vibes</p>
                </div>
              </div>
            </div>
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
              onClick={closeBookingModal}
            />

            <motion.div
              className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button
                onClick={closeBookingModal}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition z-10"
              >
                ✕
              </button>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">Complete Your Booking</h3>
                <p className="text-gray-500 mb-8">Fill in your details to confirm</p>

                {/* Booking Summary */}
                <div className="bg-white/5 rounded-2xl p-4 mb-8 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Date</span>
                    <span>{selectedDate && formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Hours</span>
                    <span>{selectedHours.map(h => `${h}:00`).join(', ')}</span>
                  </div>
                  {includeMixMaster && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Mix & Master</span>
                      <span>€{MIX_MASTER_RATE}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#8B5CF6]">€{calculateTotal()}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message (optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] py-4 rounded-full font-semibold transition"
                  >
                    Confirm Booking Request
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    I'll confirm your booking via email within 24 hours
                  </p>
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