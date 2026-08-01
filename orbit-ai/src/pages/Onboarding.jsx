import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { keywordToDomain, buildRoadmapFromMilestones } from '../data/mockData.js'

const PARSE_ENDPOINT = import.meta.env.VITE_PARSE_GOAL_URL || '/api/parse-goal'
const ROADMAP_ENDPOINT = import.meta.env.VITE_ROADMAP_URL || '/api/generate-roadmap'

const FOCUS_OPTIONS = [
  { id: 'mindset', label: 'Mindset & Mental Resilience' },
  { id: 'career', label: 'Career & Professional Growth' },
  { id: 'health', label: 'Health & Physical Fitness' },
  { id: 'creativity', label: 'Creative Expression' },
  { id: 'finance', label: 'Personal Finance & Wealth' }
]

const OBSTACLE_OPTIONS = [
  { id: 'consistency', label: 'Lack of consistency' },
  { id: 'knowledge', label: "I don't know where to start" },
  { id: 'time', label: 'Not enough time' },
  { id: 'fear', label: 'Fear of failure or judgment' },
  { id: 'focus', label: 'Too many distractions' }
]

export default function Onboarding() {
  const { setGoal } = useApp()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [focus, setFocus] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [vision, setVision] = useState('')
  
  const [parsing, setParsing] = useState(false)
  const [buildingRoadmap, setBuildingRoadmap] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [milestones, setMilestones] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => Math.max(1, s - 1))

  async function handleFinish(e) {
    if (e) e.preventDefault()
    if (!vision.trim()) return
    
    setStep(4) // Loading state
    setParsing(true)
    setErrorMsg(null)

    const combinedGoalText = `Focus: ${focus}. Obstacle: ${obstacle}. Vision: ${vision}`
    let parsedGoal

    try {
      const res = await fetch(PARSE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedGoalText, level: 'Beginner/Intermediate' }),
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      
      parsedGoal = {
        domain: data.domain,
        supported: data.supported !== false,
        supportedDomains: data.supportedDomains || [],
        level: 'Intermediate',
        timeline: '3 months',
        modelTimeline: data.timeline || null,
        skillGaps: data.skillGaps || [],
        reasoning: data.reasoning || '',
      }
    } catch (err) {
      setErrorMsg(`Goal parsing failed: ${err.message}. Using fallback.`)
      parsedGoal = {
        domain: keywordToDomain(vision),
        supported: true,
        supportedDomains: [],
        level: 'Intermediate',
        timeline: '3 months',
        modelTimeline: null,
        skillGaps: [],
        reasoning: '',
      }
    }

    setParsed(parsedGoal)
    setParsing(false)

    if (!parsedGoal.supported) return

    setBuildingRoadmap(true)
    try {
      const res = await fetch(ROADMAP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: combinedGoalText,
          domain: parsedGoal.domain,
          level: 'Intermediate',
          timeline: '3 months',
          skillGaps: parsedGoal.skillGaps,
        }),
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      setMilestones(data.milestones)
    } catch (err) {
      setErrorMsg(`Roadmap generation failed: ${err.message}.`)
      setMilestones(null)
    } finally {
      setBuildingRoadmap(false)
    }
  }

  function handleConfirm() {
    const combinedGoalText = `Focus: ${focus}. Obstacle: ${obstacle}. Vision: ${vision}`
    const roadmap = milestones ? buildRoadmapFromMilestones(milestones) : undefined
    setGoal({ text: combinedGoalText, timeline: '3 months', domain: parsed.domain, roadmap })
    navigate('/dashboard')
  }

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        {step < 4 && <span className="eyebrow">Step {step} of 3</span>}
        
        {step === 1 && (
          <div className="onboard-step fade-in">
            <h1>What is your primary focus right now?</h1>
            <p className="onboard-sub">Select the area of your life you want to transform.</p>
            <div className="onboard-options">
              {FOCUS_OPTIONS.map(opt => (
                <button 
                  key={opt.id} 
                  className={`onboard-opt-btn ${focus === opt.label ? 'selected' : ''}`}
                  onClick={() => setFocus(opt.label)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="onboard-actions">
              <button className="btn btn-primary" onClick={handleNext} disabled={!focus}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step fade-in">
            <h1>What is the main resistance blocking your path?</h1>
            <p className="onboard-sub">Identifying the obstacle is the first step to overcoming it.</p>
            <div className="onboard-options">
              {OBSTACLE_OPTIONS.map(opt => (
                <button 
                  key={opt.id} 
                  className={`onboard-opt-btn ${obstacle === opt.label ? 'selected' : ''}`}
                  onClick={() => setObstacle(opt.label)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="onboard-actions">
              <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={!obstacle}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-step fade-in">
            <h1>Describe the future self you are trying to become.</h1>
            <p className="onboard-sub">Be specific. AETHER will use this to architect your path.</p>
            <textarea
              rows={4}
              placeholder='e.g. "I want to be a confident public speaker who can lead a team effortlessly."'
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="onboard-textarea"
            />
            <div className="onboard-actions">
              <button className="btn btn-ghost" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={handleFinish} disabled={!vision.trim()}>Commune with AETHER →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboard-step fade-in">
            <h1>Architecting your path...</h1>
            
            {parsing && <p className="task-meta">AETHER is analyzing your identity and constraints...</p>}
            {buildingRoadmap && <p className="task-meta">Weaving your personalized roadmap...</p>}
            
            {errorMsg && <p className="task-meta" style={{ color: 'var(--gold)', marginTop: 12 }}>{errorMsg}</p>}

            {parsed && !parsed.supported && (
              <div className="onboard-result">
                <span className="eyebrow">Redirection</span>
                <p className="task-meta" style={{ marginTop: 8 }}>
                  {parsed.reasoning || "AETHER cannot chart a path for this specific vision yet."}
                </p>
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{marginTop: 16}}>Start over</button>
              </div>
            )}

            {parsed && parsed.supported && !buildingRoadmap && (
              <div className="onboard-result fade-in">
                <span className="eyebrow">Path Forged</span>
                
                {parsed.skillGaps.length > 0 && (
                  <div style={{marginTop: 16}}>
                    <strong>Core Focus Areas:</strong>
                    <ul className="meta-list">
                      {parsed.skillGaps.map(g => <li key={g}>{g}</li>)}
                    </ul>
                  </div>
                )}

                {milestones && (
                  <div style={{marginTop: 16}}>
                    <strong>Your Journey:</strong>
                    <ul className="meta-list">
                      {milestones.map((m, i) => (
                        <li key={i}><strong>{m.title}</strong> <span style={{opacity:0.7}}>({m.provider})</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="btn btn-primary" onClick={handleConfirm} style={{ marginTop: 24, width: '100%' }}>
                  Enter the Dashboard →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}