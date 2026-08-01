import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { QUIZ_BANK } from '../data/mockData.js'

const QUIZ_ENDPOINT = import.meta.env.VITE_QUIZ_URL || '/api/generate-quiz'

export default function Assessment() {
  const { state, submitAssessment } = useApp()
  const navigate = useNavigate()

  const activeMilestone = state.roadmap.find((m) => m.status === 'active')

  const [questions, setQuestions] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [quizError, setQuizError] = useState(null)

  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

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
      setQuizError(err.message)
      setQuestions(QUIZ_BANK)
    } finally {
      setLoadingQuiz(false)
      setStarted(true)
    }
  }

  function handleAnswer(qId, optionIdx) {
    setAnswers((a) => ({ ...a, [qId]: optionIdx }))
  }

  function handleSubmit() {
    if (submitted) return
    const currentQuestions = questions || QUIZ_BANK
    const correct = currentQuestions.filter((q) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / currentQuestions.length) * 100)
    setScore(pct)
    setSubmitted(true)
    if (activeMilestone) submitAssessment(activeMilestone.milestoneId, pct)
  }

  function handleSubmitClick() {
    const currentQuestions = questions || QUIZ_BANK
    const unansweredCount = currentQuestions.filter((q) => answers[q.id] === undefined).length
    if (unansweredCount > 0) {
      const proceed = window.confirm(
        `You still have ${unansweredCount} unanswered reflection prompt${unansweredCount === 1 ? '' : 's'}. Continue anyway?`
      )
      if (!proceed) return
    }
    handleSubmit()
  }

  if (!activeMilestone) {
    return (
      <div className="page">
        <div className="page-head">
          <span className="eyebrow">Integration Check-in</span>
          <h1>No active milestone</h1>
        </div>
        <p className="empty-state">Engage in a deep dive on your curated path first to unlock a reflection.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Integration Check-in</span>
        <h1>{activeMilestone.title}</h1>
      </div>

      {!started && (
        <div className="panel">
          <p style={{ marginBottom: 16 }}>
            This check-in is an opportunity to reflect on what you've learned and how you plan to integrate it into your habits and identity. There is no timer and no wrong way to reflect.
          </p>
          <button className="btn btn-primary" onClick={handleStart} disabled={loadingQuiz}>
            {loadingQuiz ? 'Preparing your reflection…' : 'Begin Reflection →'}
          </button>
        </div>
      )}

      {started && !submitted && !questions && (
        <div className="panel">
          <p>Preparing your reflection…</p>
        </div>
      )}

      {started && !submitted && questions && (
        <>
          {quizError && (
            <p className="task-meta" style={{ marginBottom: 12, color: '#E8B355' }}>
              Used standard local reflection prompts.
            </p>
          )}

          <div className="exam-bar">
            <span className="quiz-progress">{Object.keys(answers).length} / {questions.length} answered</span>
          </div>

          <div className="quiz-list">
            {questions.map((q, i) => (
              <div className={`quiz-q${answers[q.id] === undefined ? ' unanswered' : ''}`} key={q.id}>
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

          <button className="btn btn-primary" onClick={handleSubmitClick}>
            Complete Reflection
          </button>
        </>
      )}

      {submitted && (
        <div className="panel" style={{ textAlign: 'center' }}>
          <h2>Integration score: {score}%</h2>
          <p style={{ margin: '12px 0 20px' }}>
            {score >= 60
              ? 'Excellent reflection. You are ready to move forward on your journey.'
              : 'Consider spending a bit more time integrating these concepts before moving on.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/roadmap')}>
            Return to Curated Path →
          </button>
        </div>
      )}
    </div>
  )
}