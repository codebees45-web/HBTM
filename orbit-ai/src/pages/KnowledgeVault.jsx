import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function KnowledgeVault() {
  const { state, addResource, deleteResource } = useApp()
  const { resources = [] } = state
  
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [showToast, setShowToast] = useState(false)

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
    
    // Show success toast
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function getDomain(urlStr) {
    try {
      const urlObj = new URL(urlStr)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'link'
    }
  }

  return (
    <div className="page">
      <div className="page-head" style={{ marginBottom: '24px' }}>
        <div>
          <span className="eyebrow">Knowledge Vault</span>
          <h1>Save resources for your journey</h1>
        </div>
      </div>

      <div className="bento-card vault-form-panel">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="input-icon-wrapper" style={{ minWidth: '250px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Resource Title (e.g. React Docs)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%' }}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            
            <div className="input-icon-wrapper" style={{ minWidth: '250px' }}>
              <input
                type="url"
                className="input-field"
                placeholder="URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%' }}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
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

      <div style={{ marginTop: '32px' }}>
        {resources.length === 0 ? (
          <div className="vault-empty-state">
            <svg className="vault-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text)' }}>Your vault is empty</h3>
            <p>Save bookmarks, tutorials, and notes above to start building your knowledge base.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {resources.map(resource => (
              <div key={resource.id} className="vault-resource-card">
                <div className="vault-resource-header">
                  <div className="vault-resource-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {resource.title}
                  </div>
                  <div className="vault-actions">
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => deleteResource(resource.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      title="Delete resource"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="vault-resource-domain">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {getDomain(resource.url)}
                </a>
                
                {resource.notes && (
                  <p className="vault-resource-notes">
                    {resource.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showToast && (
        <div className="toast-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Resource Saved
        </div>
      )}
    </div>
  )
}
