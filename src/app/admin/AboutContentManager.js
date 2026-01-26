'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

// Shared Input component
const Input = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label} {required && '*'}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition" />
  </div>
)

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <textarea {...props} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50 transition resize-none" />
  </div>
)

export default function AboutContentManager({ onRefresh }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [hasChanges, setHasChanges] = useState(false)

  const sections = [
    { id: 'hero', label: 'Hero', icon: '🏠' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'skills', label: 'Skills', icon: '💪' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'genres', label: 'Genres', icon: '🎵' },
    { id: 'schedule', label: 'Day', icon: '⏰' },
    { id: 'funfacts', label: 'Facts', icon: '🎲' },
    { id: 'socials', label: 'Social', icon: '📱' },
    { id: 'cta', label: 'CTA', icon: '🎯' },
  ]

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('about_content').select('*').single()
    if (error) {
      // Create default if not exists
      if (error.code === 'PGRST116') {
        const { data: newData } = await supabase.from('about_content').insert([{}]).select().single()
        setContent(newData)
      }
    } else {
      setContent(data)
    }
    setLoading(false)
  }

  const updateContent = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!content) return
    setSaving(true)
    const { error } = await supabase
      .from('about_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      })
      .eq('id', content.id)

    if (error) alert('Error: ' + error.message)
    else {
      setHasChanges(false)
      if (onRefresh) onRefresh()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="mb-4">No content found. Run the SQL to create the table first.</p>
        <p className="text-xs text-gray-600">Check sql/about_content.sql</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-2xl font-bold">About Page Content</h2>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition text-xs md:text-sm flex items-center gap-2 ${
            hasChanges ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]' : 'bg-white/10 text-gray-500'
          }`}
        >
          {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save All'}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeSection === s.id ? 'bg-[#8B5CF6] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 md:p-6">
        {activeSection === 'hero' && <HeroSection content={content} updateContent={updateContent} />}
        {activeSection === 'stats' && <StatsSection content={content} updateContent={updateContent} />}
        {activeSection === 'timeline' && <TimelineSection content={content} updateContent={updateContent} />}
        {activeSection === 'skills' && <SkillsSection content={content} updateContent={updateContent} />}
        {activeSection === 'tools' && <ToolsSection content={content} updateContent={updateContent} />}
        {activeSection === 'genres' && <GenresSection content={content} updateContent={updateContent} />}
        {activeSection === 'schedule' && <ScheduleSection content={content} updateContent={updateContent} />}
        {activeSection === 'funfacts' && <FunFactsSection content={content} updateContent={updateContent} />}
        {activeSection === 'socials' && <SocialsSection content={content} updateContent={updateContent} />}
        {activeSection === 'cta' && <CTASection content={content} updateContent={updateContent} />}
      </div>

      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
          Unsaved changes
        </div>
      )}
    </div>
  )
}

// ============ SECTION COMPONENTS ============

function HeroSection({ content, updateContent }) {
  const heroTexts = content.hero_texts || []

  const updateHeroText = (index, value) => {
    const newTexts = [...heroTexts]
    newTexts[index] = value
    updateContent('hero_texts', newTexts)
  }

  const addHeroText = () => {
    updateContent('hero_texts', [...heroTexts, 'New text...'])
  }

  const removeHeroText = (index) => {
    updateContent('hero_texts', heroTexts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Hero Section</h3>

      <Input
        label="Tagline (small text above title)"
        value={content.hero_tagline || ''}
        onChange={e => updateContent('hero_tagline', e.target.value)}
      />

      <Input
        label="Main Title"
        value={content.hero_title || ''}
        onChange={e => updateContent('hero_title', e.target.value)}
      />

      <div>
        <label className="block text-xs text-gray-400 mb-2">Typewriter Texts (rotating)</label>
        {heroTexts.map((text, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={text}
              onChange={e => updateHeroText(i, e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B5CF6]/50"
            />
            <button onClick={() => removeHeroText(i)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">×</button>
          </div>
        ))}
        <button onClick={addHeroText} className="text-xs text-[#8B5CF6] hover:underline">+ Add text</button>
      </div>
    </div>
  )
}

function StatsSection({ content, updateContent }) {
  const stats = content.stats || []

  const updateStat = (index, field, value) => {
    const newStats = [...stats]
    newStats[index] = { ...newStats[index], [field]: field === 'value' ? parseInt(value) || 0 : value }
    updateContent('stats', newStats)
  }

  const addStat = () => {
    updateContent('stats', [...stats, { label: 'New Stat', value: 0 }])
  }

  const removeStat = (index) => {
    updateContent('stats', stats.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Stats (Numbers that count up)</h3>

      <div className="grid gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2 items-center bg-white/5 rounded-lg p-3">
            <input
              value={stat.label}
              onChange={e => updateStat(i, 'label', e.target.value)}
              placeholder="Label"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={stat.value}
              onChange={e => updateStat(i, 'value', e.target.value)}
              placeholder="Value"
              className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={() => removeStat(i)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">🗑️</button>
          </div>
        ))}
      </div>
      <button onClick={addStat} className="text-xs text-[#8B5CF6] hover:underline">+ Add stat</button>
    </div>
  )
}

function TimelineSection({ content, updateContent }) {
  const timeline = content.timeline || []

  const updateItem = (index, field, value) => {
    const newTimeline = [...timeline]
    newTimeline[index] = { ...newTimeline[index], [field]: value }
    updateContent('timeline', newTimeline)
  }

  const addItem = () => {
    updateContent('timeline', [...timeline, { year: new Date().getFullYear().toString(), title: 'New Event', desc: 'Description...', icon: '📌', milestone: 'Milestone' }])
  }

  const removeItem = (index) => {
    updateContent('timeline', timeline.filter((_, i) => i !== index))
  }

  const moveItem = (index, direction) => {
    const newTimeline = [...timeline]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= newTimeline.length) return
    ;[newTimeline[index], newTimeline[newIndex]] = [newTimeline[newIndex], newTimeline[index]]
    updateContent('timeline', newTimeline)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Timeline / Journey</h3>

      <div className="space-y-3">
        {timeline.map((item, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={item.icon}
                onChange={e => updateItem(i, 'icon', e.target.value)}
                className="w-12 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-lg"
              />
              <input
                value={item.year}
                onChange={e => updateItem(i, 'year', e.target.value)}
                placeholder="Year"
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-[#8B5CF6]"
              />
              <input
                value={item.title}
                onChange={e => updateItem(i, 'title', e.target.value)}
                placeholder="Title"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-medium"
              />
              <div className="flex gap-1">
                <button onClick={() => moveItem(i, -1)} className="p-1 text-gray-400 hover:bg-white/10 rounded">↑</button>
                <button onClick={() => moveItem(i, 1)} className="p-1 text-gray-400 hover:bg-white/10 rounded">↓</button>
                <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
              </div>
            </div>
            <textarea
              value={item.desc}
              onChange={e => updateItem(i, 'desc', e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2 resize-none"
            />
            <input
              value={item.milestone}
              onChange={e => updateItem(i, 'milestone', e.target.value)}
              placeholder="Milestone (shows on click)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#8B5CF6]"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="text-xs text-[#8B5CF6] hover:underline">+ Add timeline event</button>
    </div>
  )
}

function SkillsSection({ content, updateContent }) {
  const skills = content.skills || []

  const updateSkill = (index, field, value) => {
    const newSkills = [...skills]
    newSkills[index] = { ...newSkills[index], [field]: field === 'level' ? parseInt(value) || 0 : value }
    updateContent('skills', newSkills)
  }

  const addSkill = () => {
    updateContent('skills', [...skills, { name: 'New Skill', level: 50, icon: '⭐' }])
  }

  const removeSkill = (index) => {
    updateContent('skills', skills.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Skills (Progress Bars)</h3>

      <div className="space-y-3">
        {skills.map((skill, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3">
            <div className="flex gap-2 items-center mb-2">
              <input
                value={skill.icon}
                onChange={e => updateSkill(i, 'icon', e.target.value)}
                className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center"
              />
              <input
                value={skill.name}
                onChange={e => updateSkill(i, 'name', e.target.value)}
                placeholder="Skill name"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={skill.level}
                onChange={e => updateSkill(i, 'level', e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
              <button onClick={() => removeSkill(i)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">🗑️</button>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${skill.level}%` }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={addSkill} className="text-xs text-[#8B5CF6] hover:underline">+ Add skill</button>
    </div>
  )
}

function ToolsSection({ content, updateContent }) {
  const tools = content.tools || []

  const updateTool = (index, field, value) => {
    const newTools = [...tools]
    if (field === 'years') value = parseInt(value) || 0
    if (field === 'primary') value = !newTools[index].primary
    newTools[index] = { ...newTools[index], [field]: value }
    updateContent('tools', newTools)
  }

  const addTool = () => {
    updateContent('tools', [...tools, { name: 'New Tool', icon: '🔧', years: 1, primary: false }])
  }

  const removeTool = (index) => {
    updateContent('tools', tools.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Tools I Use</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <div key={i} className={`bg-white/5 rounded-lg p-3 border ${tool.primary ? 'border-[#8B5CF6]/50' : 'border-white/10'}`}>
            <div className="flex gap-2 items-center">
              <input
                value={tool.icon}
                onChange={e => updateTool(i, 'icon', e.target.value)}
                className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center"
              />
              <input
                value={tool.name}
                onChange={e => updateTool(i, 'name', e.target.value)}
                placeholder="Tool name"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                value={tool.years}
                onChange={e => updateTool(i, 'years', e.target.value)}
                className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-center"
              />
              <span className="text-xs text-gray-500">yrs</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => updateTool(i, 'primary')}
                className={`text-xs px-2 py-1 rounded-full ${tool.primary ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-gray-500'}`}
              >
                {tool.primary ? '★ Primary' : '☆ Primary'}
              </button>
              <button onClick={() => removeTool(i)} className="text-red-400 text-sm hover:bg-red-500/20 p-1 rounded">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addTool} className="text-xs text-[#8B5CF6] hover:underline">+ Add tool</button>
    </div>
  )
}

function GenresSection({ content, updateContent }) {
  const genres = content.genres || []

  const updateGenre = (index, field, value) => {
    const newGenres = [...genres]
    if (field === 'influence') value = parseInt(value) || 0
    newGenres[index] = { ...newGenres[index], [field]: value }
    updateContent('genres', newGenres)
  }

  const addGenre = () => {
    updateContent('genres', [...genres, { name: 'New Genre', influence: 50, color: '#8B5CF6' }])
  }

  const removeGenre = (index) => {
    updateContent('genres', genres.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Music DNA / Genres</h3>

      <div className="space-y-3">
        {genres.map((genre, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3">
            <div className="flex gap-2 items-center mb-2">
              <input
                type="color"
                value={genre.color}
                onChange={e => updateGenre(i, 'color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <input
                value={genre.name}
                onChange={e => updateGenre(i, 'name', e.target.value)}
                placeholder="Genre name"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={genre.influence}
                onChange={e => updateGenre(i, 'influence', e.target.value)}
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-center"
              />
              <span className="text-xs text-gray-500">%</span>
              <button onClick={() => removeGenre(i)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">🗑️</button>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${genre.influence}%`, backgroundColor: genre.color }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={addGenre} className="text-xs text-[#8B5CF6] hover:underline">+ Add genre</button>
    </div>
  )
}

function ScheduleSection({ content, updateContent }) {
  const schedule = content.day_schedule || []
  const types = ['morning', 'work', 'break', 'creative', 'end']

  const updateItem = (index, field, value) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    updateContent('day_schedule', newSchedule)
  }

  const addItem = () => {
    updateContent('day_schedule', [...schedule, { time: '12:00', activity: 'New activity', icon: '📌', type: 'work' }])
  }

  const removeItem = (index) => {
    updateContent('day_schedule', schedule.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">A Day in My Life</h3>

      <div className="space-y-2">
        {schedule.map((item, i) => (
          <div key={i} className="flex gap-2 items-center bg-white/5 rounded-lg p-2">
            <input
              value={item.time}
              onChange={e => updateItem(i, 'time', e.target.value)}
              placeholder="Time"
              className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-center font-mono"
            />
            <input
              value={item.icon}
              onChange={e => updateItem(i, 'icon', e.target.value)}
              className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center"
            />
            <input
              value={item.activity}
              onChange={e => updateItem(i, 'activity', e.target.value)}
              placeholder="Activity"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm"
            />
            <select
              value={item.type}
              onChange={e => updateItem(i, 'type', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="text-xs text-[#8B5CF6] hover:underline">+ Add activity</button>
    </div>
  )
}

function FunFactsSection({ content, updateContent }) {
  const facts = content.fun_facts || []

  const updateFact = (index, field, value) => {
    const newFacts = [...facts]
    newFacts[index] = { ...newFacts[index], [field]: value }
    updateContent('fun_facts', newFacts)
  }

  const addFact = () => {
    updateContent('fun_facts', [...facts, { front: 'Question?', back: 'Answer!', icon: '❓' }])
  }

  const removeFact = (index) => {
    updateContent('fun_facts', facts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Fun Facts (Flip Cards)</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {facts.map((fact, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex gap-2 items-center mb-2">
              <input
                value={fact.icon}
                onChange={e => updateFact(i, 'icon', e.target.value)}
                className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center"
              />
              <span className="text-xs text-gray-500 flex-1">Front & Back</span>
              <button onClick={() => removeFact(i)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
            </div>
            <input
              value={fact.front}
              onChange={e => updateFact(i, 'front', e.target.value)}
              placeholder="Question (front)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2"
            />
            <input
              value={fact.back}
              onChange={e => updateFact(i, 'back', e.target.value)}
              placeholder="Answer (back)"
              className="w-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <button onClick={addFact} className="text-xs text-[#8B5CF6] hover:underline">+ Add fact</button>
    </div>
  )
}

function SocialsSection({ content, updateContent }) {
  const socials = content.socials || []

  const updateSocial = (index, field, value) => {
    const newSocials = [...socials]
    newSocials[index] = { ...newSocials[index], [field]: value }
    updateContent('socials', newSocials)
  }

  const addSocial = () => {
    updateContent('socials', [...socials, { name: 'Platform', icon: '🔗', url: '#', color: 'from-gray-500 to-gray-600', handle: '@handle' }])
  }

  const removeSocial = (index) => {
    updateContent('socials', socials.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Social Links</h3>

      <div className="space-y-3">
        {socials.map((social, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex gap-2 items-center mb-2">
              <input
                value={social.icon}
                onChange={e => updateSocial(i, 'icon', e.target.value)}
                className="w-10 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center"
              />
              <input
                value={social.name}
                onChange={e => updateSocial(i, 'name', e.target.value)}
                placeholder="Platform"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={() => removeSocial(i)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">🗑️</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={social.handle}
                onChange={e => updateSocial(i, 'handle', e.target.value)}
                placeholder="@handle"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={social.url}
                onChange={e => updateSocial(i, 'url', e.target.value)}
                placeholder="URL"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={addSocial} className="text-xs text-[#8B5CF6] hover:underline">+ Add social</button>
    </div>
  )
}

function CTASection({ content, updateContent }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-4">Call to Action Section</h3>

      <Input
        label="Title"
        value={content.cta_title || ''}
        onChange={e => updateContent('cta_title', e.target.value)}
      />

      <Input
        label="Subtitle"
        value={content.cta_subtitle || ''}
        onChange={e => updateContent('cta_subtitle', e.target.value)}
      />

      <Input
        label="Hint Text (easter egg hint)"
        value={content.cta_hint || ''}
        onChange={e => updateContent('cta_hint', e.target.value)}
      />

      <div className="border-t border-white/10 pt-4 mt-4">
        <h4 className="font-medium mb-3 text-sm">Easter Egg (Konami Code)</h4>

        <Input
          label="Discount Code"
          value={content.easter_egg_code || ''}
          onChange={e => updateContent('easter_egg_code', e.target.value)}
        />

        <div className="mt-2">
          <Input
            label="Discount Text"
            value={content.easter_egg_discount || ''}
            onChange={e => updateContent('easter_egg_discount', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
