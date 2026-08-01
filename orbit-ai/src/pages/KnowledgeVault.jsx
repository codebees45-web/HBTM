import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function KnowledgeVault() {
  const { state, addResource, deleteResource } = useApp()
  const { resources = [] } = state
  
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    addResource({
      title: title.trim(),
      url: url.trim(),
      notes: notes.trim(),
      type: 'link'
    })
    setTitle('')
    setUrl('')
    setNotes('')
  }

  return (
    <div className="bento-dashboard">
      <div className="bento-card">
        <div className="panel-head">
          <h2>Knowledge Vault</h2>
          <p className="task-meta">Save bookmarks, tutorials, and notes for your learning journey.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Resource Title (e.g. React Docs)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="url"
              className="input-field"
              placeholder="URL (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Why is this useful? (Optional notes)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <button type="submit" className="btn btn-primary" disabled={!title.trim() || !url.trim()} style={{ alignSelf: 'flex-start' }}>
            Save Resource
          </button>
        </form>
      </div>

      <div className="bento-row" style={{ flexWrap: 'wrap', marginTop: '24px' }}>
        {resources.length === 0 ? (
          <div className="bento-card" style={{ width: '100%' }}>
            <p className="empty-state">No resources saved yet. Start building your knowledge vault!</p>
          </div>
        ) : (
          resources.map(resource => (
            <div key={resource.id} className="bento-card" style={{ flex: '1 1 300px' }}>
              <div className="panel-head">
                <h3 style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {resource.title}
                </h3>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => deleteResource(resource.id)}
                  style={{ color: 'var(--muted)', padding: '4px 8px' }}
                >
                  Delete
                </button>
              </div>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--gold)', display: 'block', marginBottom: '12px', wordBreak: 'break-all' }}
              >
                {resource.url}
              </a>
              {resource.notes && (
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>
                  {resource.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
