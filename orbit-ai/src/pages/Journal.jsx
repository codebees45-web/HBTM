import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Trophy, AlertOctagon, Lightbulb, Minus, BookOpen, Trash2, CheckCircle2 } from 'lucide-react'

const PROMPTS = [
  "What did you learn today?",
  "What's one obstacle you faced?",
  "What are you proud of?",
  "How did you push closer to your goals today?",
  "What do you need to improve tomorrow?",
  "Did you maintain your habits today?"
]

const MOODS = [
  { id: 'win', label: 'Win', icon: Trophy },
  { id: 'obstacle', label: 'Obstacle', icon: AlertOctagon },
  { id: 'insight', label: 'Insight', icon: Lightbulb },
  { id: 'neutral', label: 'Neutral', icon: Minus }
]

function JournalEntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  
  const isLong = entry.content.length > 200
  const displayContent = !expanded && isLong ? entry.content.slice(0, 200) + '...' : entry.content
  
  const moodData = MOODS.find(m => m.id === entry.mood)
  const MoodIcon = moodData?.icon

  return (
    <div className="journal-entry-card">
      <div className="journal-actions">
        <button className="btn btn-ghost" onClick={() => onDelete(entry.id)} style={{ padding: '6px' }} title="Delete entry">
          <Trash2 size={16} color="var(--muted)" />
        </button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
          {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        {moodData && (
          <span className="task-meta" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-panel-2)', padding: '2px 8px', borderRadius: 12 }}>
            <MoodIcon size={12} /> {moodData.label}
          </span>
        )}
      </div>
      
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0, color: 'var(--text)' }}>
        {displayContent}
      </p>
      
      {isLong && (
        <button 
          className="muted-link" 
          onClick={() => setExpanded(!expanded)} 
          style={{ marginTop: 12, display: 'inline-block' }}
        >
          {expanded ? 'Show less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  )
}

export default function Journal() {
  const { state, addJournalEntry, deleteJournalEntry } = useApp()
  const { journalEntries = [] } = state
  
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(null)
  const [prompt, setPrompt] = useState(PROMPTS[0])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    // Pick a random placeholder prompt on mount
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    
    setSaving(true)
    
    // Simulate slight save delay for better UX
    setTimeout(() => {
      const today = new Date()
      addJournalEntry({
        date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        content: content.trim(),
        mood
      })
      setContent('')
      setMood(null)
      setSaving(false)
      
      // Show success toast
      setToast(true)
      setTimeout(() => setToast(false), 3000)
    }, 400)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">AETHER · Reflection</span>
        <h1>Daily Journal</h1>
      </div>

      <div className="panel" style={{ marginBottom: 32, padding: 32 }}>
        <p className="task-meta" style={{ marginBottom: 24 }}>
          Reflect on your progress, wins, and obstacles. Your reflections help calibrate the system.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {MOODS.map(m => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`mood-chip ${mood === m.id ? 'selected' : ''}`}
                  onClick={() => setMood(mood === m.id ? null : m.id)}
                >
                  <Icon size={16} /> {m.label}
                </button>
              )
            })}
          </div>

          <textarea
            className="input-field"
            rows={5}
            placeholder={prompt}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', 
              resize: 'vertical', 
              marginBottom: 12,
              padding: 16,
              fontSize: 15,
              lineHeight: 1.6,
              borderRadius: 12,
              background: 'var(--bg-panel-2)'
            }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="task-meta">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {content.length} chars
            </span>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!content.trim() || saving}
              style={{ padding: '12px 28px' }}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {journalEntries.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: 8, color: 'var(--text)' }}>No journal entries yet</h3>
            <p>Start writing your first reflection above. Your insights will appear here.</p>
          </div>
        ) : (
          journalEntries.map(entry => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={deleteJournalEntry} />
          ))
        )}
      </div>

      {toast && (
        <div className="toast-message">
          <CheckCircle2 size={18} color="var(--gold)" />
          Entry saved successfully
        </div>
      )}
    </div>
  )
}
