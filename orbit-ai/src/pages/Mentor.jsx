import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const ENDPOINT_STORAGE_KEY = 'orbit-ai-mentor-endpoint'
const DEFAULT_ENDPOINT = import.meta.env.VITE_MENTOR_URL || '/api/mentor'
const HISTORY_STORAGE_PREFIX = 'orbit-ai-mentor-history-v1'
const HISTORY_MAX_MESSAGES = 40

// Used only if the backend is unreachable, so the chat still responds
// instead of hanging or dying silently.
const OFFLINE_FALLBACK =
  "I can't reach the mentor backend right now, so I can't give you a real answer to that. Check that the server is running (see server/README) and try again."

function greeting(domain) {
  return { role: 'assistant', text: 'I hold the map to your future self. What is blocking your path today?' }
}

// One saved thread per learning domain, so switching goals doesn't mix
// conversations, and re-opening /dashboard/mentor picks up where you left off.
function historyKey(domain) {
  return `${HISTORY_STORAGE_PREFIX}:${domain || 'default'}`
}

function loadHistory(domain) {
  try {
    const raw = localStorage.getItem(historyKey(domain))
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // corrupted/blocked storage — fall back to a fresh greeting
  }
  return [greeting(domain)]
}

export default function Mentor() {
  const { state, recordActivity } = useApp()
  const [endpoint, setEndpoint] = useState(
    () => localStorage.getItem(ENDPOINT_STORAGE_KEY) || DEFAULT_ENDPOINT
  )
  const [showSettings, setShowSettings] = useState(false)
  const [backendOk, setBackendOk] = useState(null) // null=unknown, true/false
  const [messages, setMessages] = useState(() => loadHistory(state.goal?.domain))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Persist the thread so it survives navigating away and coming back, or a
  // full page reload — real memory, not just in-component state.
  useEffect(() => {
    try {
      const trimmed = messages.slice(-HISTORY_MAX_MESSAGES)
      localStorage.setItem(historyKey(state.goal?.domain), JSON.stringify(trimmed))
    } catch {
      // storage full or blocked (private browsing) — chat still works, it
      // just won't persist across reloads
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
          // last 10 turns of real conversation, so the mentor has memory
          // within the thread instead of answering each message cold
          history: nextMessages.slice(-11, -1),
          // grounds every reply in the learner's actual goal + roadmap
          // state, not just a generic prompt
          context: { goal: state.goal, roadmap: state.roadmap },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Backend returned ${res.status}`)
      }
      if (!res.body) {
        // Environment without streaming fetch support — fall back to
        // reading the whole response at once.
        const data = await res.json()
        setBackendOk(true)
        recordActivity()
        setMessages((m) => [...m, { role: 'assistant', text: data.reply || '(empty reply from backend)' }])
        return
      }

      // Add an empty assistant bubble now, then fill it in as tokens stream
      // in over SSE (data: {...}\n\n lines from server/index.js).
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
            continue // partial chunk split across reads, safe to skip
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
        // If we already added an (empty or partial) streaming bubble for
        // this turn, replace it instead of appending a second one.
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
    } catch {
      // ignore — in-memory state is already cleared either way
    }
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

  const { t } = useApp()

  return (
    <div className="page oracle-page">
      <div className="page-head">
        <div>
          <span className="eyebrow" style={{color:'var(--gold)'}}>AETHER Core Protocol // Live</span>
          <h1 style={{textShadow: '0 0 20px rgba(16,185,129,0.2)'}}>The Oracle</h1>
        </div>
        {messages.length > 1 && (
          <button className="btn btn-ghost" onClick={clearConversation} style={{borderColor:'var(--gold)', color:'var(--gold)'}}>
            [ TERMINATE SESSION ]
          </button>
        )}
      </div>

      <div className="panel" style={{ marginBottom: 20, border: '1px solid var(--line)', background: 'var(--bg-panel)' }}>
        <button className="muted-link" onClick={() => setShowSettings((s) => !s)}>
          <span className={`cam-status cam-${backendOk === false ? 'phone-detected' : 'ready'}`}>
            {backendOk === null && 'SCANNING NETWORK...'}
            {backendOk === true && `UPLINK SECURED: ${endpoint}`}
            {backendOk === false && `CONNECTION FAILED: ${endpoint}`}
          </span>{' '}
          — {showSettings ? 'close config' : 'open config'}
        </button>
        {showSettings && (
          <div style={{ marginTop: 12 }}>
            <p className="task-meta" style={{ marginBottom: 8 }}>
              Configure uplink destination.
            </p>
            <input
              type="text"
              placeholder="/api/mentor"
              value={endpoint}
              onChange={(e) => saveEndpoint(e.target.value)}
              style={{ width: '100%', background:'var(--bg)', border:'1px solid var(--gold)', color:'var(--text)' }}
            />
          </div>
        )}
      </div>

      <div className={`oracle-interface terminal-border ${sending ? 'thinking' : ''}`}>
        <div className="oracle-stream terminal-screen" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`oracle-prose ${m.role}`}>
              <div className="message-label">{m.role === 'assistant' ? 'AETHER_OS>' : 'USER_INPUT>'}</div>
              <div className={`message-content ${m.role === 'assistant' && i === messages.length - 1 && !sending ? 'typewriter-active' : ''}`}>
                {m.text || (sending && i === messages.length - 1 ? 'PROCESSING...' : '')}
              </div>
            </div>
          ))}

          {isFreshConversation && !sending && (
            <div className="mentor-quick-prompts">
              {quickPrompts.map((p) => (
                <button key={p} className="quick-prompt-chip" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
        <form className="oracle-input-form terminal-input-area" onSubmit={handleSubmit}>
          <span style={{color:'var(--gold)', marginRight:'10px'}}>{'>'}</span>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Transmit sequence..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              resizeTextarea()
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-ghost oracle-submit" type="submit" disabled={sending || !input.trim()}>
            TRANSMIT
          </button>
        </form>
      </div>
    </div>
  )
}