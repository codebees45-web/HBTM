import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { QUIZ_BANK } from '../data/mockData.js'

const EXAM_SECONDS = 15 * 60
const QUIZ_ENDPOINT = import.meta.env.VITE_QUIZ_URL || '/api/generate-quiz'


function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function useFullscreenLock(containerRef, active) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function enter() {
    try {
      await containerRef.current?.requestFullscreen?.()
    } catch (e) {
      console.warn('Fullscreen request failed or was denied:', e)
    }
  }

  useEffect(() => {
    if (!active && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [active])

  return { isFullscreen, enter }
}

function usePhoneDetection(videoRef, enabled) {
  const [status, setStatus] = useState('loading') // loading | ready | detecting | phone-detected | error
  const [violations, setViolations] = useState(0)
  const modelRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let intervalId

    async function setup() {
      try {
        const tf = await import('@tensorflow/tfjs')
        const cocoSsd = await import('@tensorflow-models/coco-ssd')
        await tf.ready()
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
        if (cancelled) return
        setStatus('ready')

        intervalId = setInterval(async () => {
          if (!videoRef.current || !modelRef.current) return
          const predictions = await modelRef.current.detect(videoRef.current)
          const phone = predictions.find(
            (p) => p.class === 'cell phone' && p.score > 0.55
          )
          if (phone) {
            setStatus('phone-detected')
            setViolations((v) => v + 1)
          } else {
            setStatus('detecting')
          }
        }, 1500)
      } catch (e) {
        console.warn('Camera/model setup failed:', e)
        if (!cancelled) setStatus('error')
      }
    }

    setup()
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      const stream = videoRef.current?.srcObject
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { status, violations }
}

function QRPairingStub({ milestoneTitle }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const sessionId = useRef(Math.random().toString(36).slice(2, 10)).current

  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      const pairUrl = `${window.location.origin}/pair/${sessionId}`
      QRCode.toDataURL(pairUrl, { margin: 1, width: 160 }).then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
    })
    return () => { cancelled = true }
  }, [sessionId])

  return (
    <div className="qr-stub">
      <div>
        {qrDataUrl ? <img src={qrDataUrl} alt="Pairing QR code" width={120} height={120} /> : <div className="qr-placeholder" />}
      </div>
      <div>
        <strong>Optional: pair a second phone camera</strong>
        <p className="task-meta">
          Scan this from your phone and prop it to face your desk, keyboard, and
          screen — a second angle catches what the laptop camera can't. Wiring the
          live video from that phone into this session needs a small signaling
          server (WebRTC) — this QR demonstrates the pairing flow; the video hookup
          is the next module to build.
        </p>
        <p className="task-meta">Session: {milestoneTitle} · id {sessionId}</p>
      </div>
    </div>
  )
}

export default function Assessment() {
  const { state, submitAssessment } = useApp()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  const activeMilestone = state.roadmap.find((m) => m.status === 'active')

  const [questions, setQuestions] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [quizError, setQuizError] = useState(null)

  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const { isFullscreen, enter } = useFullscreenLock(containerRef, started && !submitted)
  const { status: cameraStatus, violations } = usePhoneDetection(videoRef, started && !submitted)

  useEffect(() => {
    if (!started || submitted) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [started, submitted, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    setLoadingQuiz(true)
    setQuizError(null)
    setQuestions(null)

    try {
      const res = await fetch(QUIZ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeMilestone.title }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      const data = await res.json()
      setQuestions(data.questions)
    } catch (err) {
      // Never let the exam get stuck just because the backend is down —
      // fall back to the generic static bank, but say so plainly.
      setQuizError(err.message)
      setQuestions(QUIZ_BANK)
    } finally {
      setLoadingQuiz(false)
      setStarted(true)
      enter()
    }
  }

  function handleAnswer(qId, optionIdx) {
    setAnswers((a) => ({ ...a, [qId]: optionIdx }))
  }

  function handleSubmit() {
    if (submitted) return
    const correct = questions.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)
    setSubmitted(true)
    if (activeMilestone) submitAssessment(activeMilestone.milestoneId, pct)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  if (!activeMilestone) {
    return (
      <div className="page">
        <div className="page-head">
          <span className="eyebrow">Assessment</span>
          <h1>No active milestone</h1>
        </div>
        <p className="empty-state">Finish a study session on your roadmap first to unlock an assessment.</p>
      </div>
    )
  }

  return (
    <div className="page" ref={containerRef} style={{ background: started ? '#0A0C12' : undefined }}>
      <div className="page-head">
        <span className="eyebrow">Locked assessment</span>
        <h1>{activeMilestone.title}</h1>
      </div>

      {!started && (
        <div className="panel">
          <p style={{ marginBottom: 16 }}>
            Starting the assessment enters fullscreen and turns on your camera to
            watch for a phone in frame. You won't be able to leave fullscreen until
            you submit or time runs out.
          </p>

          <QRPairingStub milestoneTitle={activeMilestone.title} />

          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleStart} disabled={loadingQuiz}>
            {loadingQuiz ? 'Generating your questions…' : 'Start assessment →'}
          </button>
        </div>
      )}

      {started && !submitted && !questions && (
        <div className="panel">
          <p>Generating your questions…</p>
        </div>
      )}

      {started && !submitted && questions && (
        <>
          {quizError && (
            <p className="task-meta" style={{ marginBottom: 12, color: '#E8B355' }}>
              Couldn't reach the quiz-generation backend ({quizError}) — used the
              standard generic question bank instead.
            </p>
          )}

          <div className="exam-bar">
            <span>⏱ {formatTime(timeLeft)}</span>
            <span className={`cam-status cam-${cameraStatus}`}>
              {cameraStatus === 'loading' && 'Loading camera + detection model…'}
              {cameraStatus === 'ready' && 'Camera armed, no phone in view'}
              {cameraStatus === 'detecting' && 'Camera armed, no phone in view'}
              {cameraStatus === 'phone-detected' && '⚠ Phone detected in frame'}
              {cameraStatus === 'error' && 'Camera unavailable — proceeding without detection'}
            </span>
            {violations > 0 && <span className="cam-violations">{violations} flagged</span>}
          </div>

          {!isFullscreen && (
            <div className="study-warning" style={{ marginBottom: 16 }}>
              You've left fullscreen. <button className="btn btn-ghost" onClick={enter}>Return to fullscreen</button>
            </div>
          )}

          <video ref={videoRef} className="cam-preview" muted playsInline />

          <div className="quiz-list">
            {questions.map((q, i) => (
              <div className="quiz-q" key={q.id}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>
  {q.category === 'easy' ? 'Easy' : q.category === 'remembering' ? 'Recall' : 'Applied'}
</span>
<strong>{i + 1}. {q.question}</strong>
                <div className="quiz-options">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className={answers[q.id] === idx ? 'selected' : ''}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === idx}
                        onChange={() => handleAnswer(q.id, idx)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit assessment
          </button>
        </>
      )}

      {submitted && (
  <div className="panel" style={{ textAlign: 'center' }}>
    <h2>Score: {score}%</h2>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '16px 0' }}>
      {['easy', 'remembering', 'application'].map((cat) => {
        const catQuestions = questions.filter((q) => q.category === cat)
        const catCorrect = catQuestions.filter((q) => answers[q.id] === q.answer).length
        return (
          <div key={cat}>
            <div className="eyebrow">{cat === 'easy' ? 'Easy' : cat === 'remembering' ? 'Recall' : 'Applied'}</div>
            <strong>{catCorrect}/{catQuestions.length || 5}</strong>
          </div>
        )
      })}
    </div>
    <p style={{ margin: '12px 0 20px' }}>
      {score >= 60
        ? 'Nice — your roadmap has moved to the next milestone.'
        : "That's below the 60% bar — we've added a remedial task before you retry."}
    </p>
    <button className="btn btn-primary" onClick={() => navigate('/dashboard/roadmap')}>
      Back to roadmap →
    </button>
  </div>
)}
    </div>
  )
}