import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Sparkles, User, Send, Settings, Trash2, Wifi, WifiOff } from 'lucide-react'

const ENDPOINT_STORAGE_KEY = 'orbit-ai-mentor-endpoint'
const DEFAULT_ENDPOINT = import.meta.env.VITE_MENTOR_URL || '/api/mentor'
const HISTORY_STORAGE_PREFIX = 'orbit-ai-mentor-history-v1'
const HISTORY_MAX_MESSAGES = 40

const OFFLINE_FALLBACK =
  "I can't reach the mentor backend right now, so I can't give you a real answer to that. Check that the server is running (see server/README) and try again."

function greeting(domain) {
  return { role: 'assistant', text: 'I hold the map to your future self. What is blocking your path today?' }
}

function historyKey(domain) {
  return `${HISTORY_STORAGE_PREFIX}:${domain || 'default'}`
}

function loadHistory(domain) {
  try {
    const raw = localStorage.getItem(historyKey(domain))
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // corrupted/blocked storage
  }
  return [greeting(domain)]
}

export default function Mentor() {
  const { state, recordActivity } = useApp()
  const [endpoint, setEndpoint] = useState(
    () => localStorage.getItem(ENDPOINT_STORAGE_KEY) || DEFAULT_ENDPOINT
  )
  const [showSettings, setShowSettings] = useState(false)
  const [backendOk, setBackendOk] = useState(null)
  const [messages, setMessages] = useState(() => loadHistory(state.goal?.domain))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    try {
      const trimmed = messages.slice(-HISTORY_MAX_MESSAGES)
      localStorage.setItem(historyKey(state.goal?.domain), JSON.stringify(trimmed))
    } catch {
      // storage full or blocked
    }
  }, [messages, state.goal?.domain])

  useEffect(() => {
    const healthUrl = endpoint.replace(/\/mentor\/?$/, '/health')
    fetch(healthUrl)
      .then((res) => setBackendOk(res.ok))
      .catch(() => setBackendOk(false))
  }, [endpoint])

  function saveEndpoint(url) {
    setEndpoint(url)
    localStorage.setItem(ENDPOINT_STORAGE_KEY, url)
  }

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  async function sendMessage(text) {
    if (!text.trim() || sending) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    requestAnimationFrame(resizeTextarea)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-11, -1),
          context: { goal: state.goal, roadmap: state.roadmap },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Backend returned ${res.status}`)
      }
      if (!res.body) {
        const data = await res.json()
        setBackendOk(true)
        recordActivity()
        setMessages((m) => [...m, { role: 'assistant', text: data.reply || '(empty reply from backend)' }])
        return
      }

      setBackendOk(true)
      recordActivity()
      setMessages((m) => [...m, { role: 'assistant', text: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamError = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (!payload) continue

          let json
          try {
            json = JSON.parse(payload)
          } catch {
            continue
          }

          if (json.error) {
            streamError = json.error
          } else if (json.delta) {
            setMessages((m) => {
              const next = [...m]
              const last = next[next.length - 1]
              next[next.length - 1] = { ...last, text: last.text + json.delta }
              return next
            })
          }
        }
      }

      if (streamError) throw new Error(streamError)
    } catch (err) {
      setBackendOk(false)
      setMessages((m) => {
        const errorText = `${OFFLINE_FALLBACK} (${err.message})`
        const last = m[m.length - 1]
        if (last?.role === 'assistant' && last.text === '') {
          return [...m.slice(0, -1), { role: 'assistant', text: errorText }]
        }
        return [...m, { role: 'assistant', text: errorText }]
      })
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearConversation() {
    setMessages([greeting(state.goal?.domain)])
    setInput('')
    try {
      localStorage.removeItem(historyKey(state.goal?.domain))
    } catch {}
  }

  const activeMilestone = state.roadmap.find((m) => m.status === 'active')
  const quickPrompts = activeMilestone
    ? [
        `Help me integrate the concepts in "${activeMilestone.title}" into my daily routine`,
        `I'm feeling resistance towards "${activeMilestone.title}" — how do I overcome this?`,
        `What mindset shift do I need to master "${activeMilestone.title}"?`,
      ]
    : [
        `What should I focus on first to grow in ${state.goal?.domain || 'my current path'}?`,
        'How do I stay consistent when my motivation dips?',
      ]
  const isFreshConversation = messages.length === 1

  return (
    <div className="page">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="eyebrow">AETHER · Oracle</span>
          <h1>Your Intelligence Partner</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => setShowSettings((s) => !s)} style={{ padding: '8px', color: 'var(--muted)' }} title="Network Settings">
            <Settings size={20} />
          </button>
          {messages.length > 1 && (
            <button className="btn btn-ghost" onClick={clearConversation} style={{ padding: '8px', color: 'var(--muted)' }} title="Clear Conversation">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="panel" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: backendOk ? 'var(--gold)' : 'var(--muted)' }}>
            {backendOk ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {backendOk === null && 'Checking backend status...'}
              {backendOk === true && 'Connected to backend'}
              {backendOk === false && 'Backend offline (Running in local mode)'}
            </span>
          </div>
          <div>
            <p className="task-meta" style={{ marginBottom: 8 }}>
              Configure API endpoint URL (for advanced users)
            </p>
            <input
              type="text"
              placeholder="/api/mentor"
              value={endpoint}
              onChange={(e) => saveEndpoint(e.target.value)}
              className="input-field"
              style={{ width: '100%', maxWidth: 400 }}
            />
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-history" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              <div className="chat-avatar">
                {m.role === 'assistant' ? <Sparkles size={18} /> : <User size={18} />}
              </div>
              <div className="chat-content">
                <div className="chat-sender">{m.role === 'assistant' ? 'AETHER' : 'You'}</div>
                <div className="chat-text">
                  {m.text || (sending && i === messages.length - 1 ? 'Thinking...' : '')}
                </div>
              </div>
            </div>
          ))}

          {isFreshConversation && !sending && (
            <div className="mentor-quick-prompts" style={{ maxWidth: 800, margin: '24px auto 0', width: '100%' }}>
              <p className="task-meta" style={{ marginBottom: 8 }}>Suggested prompts</p>
              {quickPrompts.map((p) => (
                <button key={p} className="quick-prompt-chip" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chat-input-wrapper">
          <form className="chat-input-box" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask AETHER anything..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                resizeTextarea()
              }}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" type="submit" disabled={sending || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}