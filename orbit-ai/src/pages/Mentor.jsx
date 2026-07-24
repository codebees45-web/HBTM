import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const ENDPOINT_STORAGE_KEY = 'orbit-ai-mentor-endpoint'
const DEFAULT_ENDPOINT = import.meta.env.VITE_MENTOR_URL || '/api/mentor'

// Used only if the backend is unreachable, so the chat still responds
// instead of hanging or dying silently.
const OFFLINE_FALLBACK =
  "I can't reach the mentor backend right now, so I can't give you a real answer to that. Check that the server is running (see server/README) and try again."

export default function Mentor() {
  const { state } = useApp()
  const [endpoint, setEndpoint] = useState(
    () => localStorage.getItem(ENDPOINT_STORAGE_KEY) || DEFAULT_ENDPOINT
  )
  const [showSettings, setShowSettings] = useState(false)
  const [backendOk, setBackendOk] = useState(null) // null=unknown, true/false
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! Ask me anything about ${state.goal?.domain || 'your roadmap'} and I'll help you work through it.` },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          // last 10 turns of real conversation, so the mentor has memory
          // within the session instead of answering each message cold
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
      const data = await res.json()
      setBackendOk(true)
      setMessages((m) => [...m, { role: 'assistant', text: data.reply || '(empty reply from backend)' }])
    } catch (err) {
      setBackendOk(false)
      setMessages((m) => [...m, { role: 'assistant', text: `${OFFLINE_FALLBACK} (${err.message})` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">AI Mentor</span>
        <h1>Ask a question, get unstuck</h1>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <button className="muted-link" onClick={() => setShowSettings((s) => !s)}>
          <span className={`cam-status cam-${backendOk === false ? 'phone-detected' : 'ready'}`}>
            {backendOk === null && 'Checking mentor backend…'}
            {backendOk === true && `Backend connected: ${endpoint}`}
            {backendOk === false && `Backend unreachable: ${endpoint}`}
          </span>{' '}
          — {showSettings ? 'hide' : 'edit'}
        </button>
        {showSettings && (
          <div style={{ marginTop: 12 }}>
            <p className="task-meta" style={{ marginBottom: 8 }}>
              Defaults to <code>/api/mentor</code>, proxied in dev to the
              Express server in <code>/server</code> (see <code>server/README.md</code>).
              Point this at a deployed backend URL in production, or set{' '}
              <code>VITE_MENTOR_URL</code> at build time instead.
            </p>
            <input
              type="text"
              placeholder="/api/mentor"
              value={endpoint}
              onChange={(e) => saveEndpoint(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <div className="mentor-chat">
        <div className="mentor-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`mentor-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {sending && <div className="mentor-bubble assistant">Thinking…</div>}
        </div>
        <form className="mentor-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Ask about a concept, error, or what to do next…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}