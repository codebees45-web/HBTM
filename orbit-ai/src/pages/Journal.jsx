import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Journal() {
  const { state, addJournalEntry, deleteJournalEntry } = useApp()
  const { journalEntries = [] } = state
  const [content, setContent] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    const today = new Date()
    addJournalEntry({
      date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      content: content.trim()
    })
    setContent('')
  }

  return (
    <div className="bento-dashboard">
      <div className="bento-card">
        <div className="panel-head">
          <h2>Daily Journal</h2>
          <p className="task-meta">Reflect on your progress, wins, and obstacles.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <textarea
            className="input-field"
            rows={4}
            placeholder="What did you learn today? Any obstacles?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', resize: 'vertical', marginBottom: '16px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={!content.trim()}>
            Save Entry
          </button>
        </form>
      </div>

      <div className="bento-row" style={{ flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        {journalEntries.length === 0 ? (
          <div className="bento-card">
            <p className="empty-state">No journal entries yet. Start writing your first reflection!</p>
          </div>
        ) : (
          journalEntries.map(entry => (
            <div key={entry.id} className="bento-card">
              <div className="panel-head" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => deleteJournalEntry(entry.id)}
                  style={{ color: 'var(--muted)', padding: '4px 8px' }}
                >
                  Delete
                </button>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
