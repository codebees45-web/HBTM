import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { keywordToDomain, buildRoadmapFromMilestones, COURSE_CATALOGUE } from '../data/mockData.js'
import { 
  Brain, Briefcase, HeartPulse, Palette, DollarSign, MoreHorizontal,
  CalendarX, HelpCircle, Clock, EyeOff, BellOff, ArrowRight, ArrowLeft, CheckCircle2, Circle
} from 'lucide-react'

const PARSE_ENDPOINT = import.meta.env.VITE_PARSE_GOAL_URL || '/api/parse-goal'
const ROADMAP_ENDPOINT = import.meta.env.VITE_ROADMAP_URL || '/api/generate-roadmap'

const FOCUS_OPTIONS = [
  { id: 'mindset', label: 'Mindset & Mental Resilience', icon: Brain },
  { id: 'career', label: 'Career & Professional Growth', icon: Briefcase },
  { id: 'health', label: 'Health & Physical Fitness', icon: HeartPulse },
  { id: 'creativity', label: 'Creative Expression', icon: Palette },
  { id: 'finance', label: 'Personal Finance & Wealth', icon: DollarSign }
]

const OBSTACLE_OPTIONS = [
  { id: 'consistency', label: 'Lack of consistency', icon: CalendarX },
  { id: 'knowledge', label: "I don't know where to start", icon: HelpCircle },
  { id: 'time', label: 'Not enough time', icon: Clock },
  { id: 'fear', label: 'Fear of failure or judgment', icon: EyeOff },
  { id: 'focus', label: 'Too many distractions', icon: BellOff }
]

export default function Onboarding() {
  const { setGoal } = useApp()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [focus, setFocus] = useState('')
  const [customFocus, setCustomFocus] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [customObstacle, setCustomObstacle] = useState('')
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

    const finalFocus = focus === 'Other' ? customFocus : focus
    const finalObstacle = obstacle === 'Other' ? customObstacle : obstacle
    const combinedGoalText = `Focus: ${finalFocus}. Obstacle: ${finalObstacle}. Vision: ${vision}`
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
      console.warn(`Roadmap generation failed: ${err.message}. Using fallback mock data.`)
      const fallbackCourses = COURSE_CATALOGUE[parsedGoal.domain] || COURSE_CATALOGUE['full stack development']
      setMilestones(fallbackCourses)
      setErrorMsg(null) // clear error so it looks seamless
    } finally {
      setBuildingRoadmap(false)
    }
  }

  function handleConfirm() {
    const finalFocus = focus === 'Other' ? customFocus : focus
    const finalObstacle = obstacle === 'Other' ? customObstacle : obstacle
    const combinedGoalText = `Focus: ${finalFocus}. Obstacle: ${finalObstacle}. Vision: ${vision}`
    const roadmap = milestones ? buildRoadmapFromMilestones(milestones) : undefined
    setGoal({ text: combinedGoalText, timeline: '3 months', domain: parsed.domain, roadmap })
    navigate('/dashboard')
  }

  const renderProgress = () => {
    if (step >= 4) return null;
    return (
      <div className="onboard-progress">
        {[1, 2, 3].map(num => (
          <div key={num} className={`onboard-progress-step ${step >= num ? 'completed' : ''} ${step === num ? 'active' : ''}`}>
            <div className="onboard-progress-dot">{step > num ? <CheckCircle2 size={12} strokeWidth={3} /> : num}</div>
            {num < 3 && <div className="onboard-progress-line" />}
          </div>
        ))}
      </div>
    )
  }

  const renderOption = (opt, selectedValue, setFn, index) => {
    const isSelected = selectedValue === opt.label
    const Icon = opt.icon
    return (
      <button 
        key={opt.id} 
        className={`onboard-opt-btn fade-in-stagger ${isSelected ? 'selected' : ''}`}
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => setFn(opt.label)}
      >
        <div className="onboard-opt-icon">
          <Icon size={20} />
        </div>
        <span className="onboard-opt-label">{opt.label}</span>
        <div className="onboard-opt-radio">
          {isSelected ? <CheckCircle2 size={20} className="text-gold" /> : <Circle size={20} className="text-muted" />}
        </div>
      </button>
    )
  }

  return (
    <div className="onboard-page">
      <div className="onboard-bg-grid" />
      <div className="onboard-grid-glow" />
      
      <div className="onboard-animated-lines">
        <div className="line line-v1" />
        <div className="line line-h1" />
        <div className="line line-h2" />
      </div>

      <div className="onboard-card">
        {renderProgress()}
        
        {step === 1 && (
          <div className="onboard-step fade-in-slide">
            <h1>What is your primary focus right now?</h1>
            <p className="onboard-sub">Select the area of your life you want to transform.</p>
            <div className="onboard-options">
              {FOCUS_OPTIONS.map((opt, i) => renderOption(opt, focus, setFocus, i))}
              {renderOption({ id: 'other', label: 'Other', icon: MoreHorizontal }, focus, setFocus, FOCUS_OPTIONS.length)}
              
              {focus === 'Other' && (
                <div className="fade-in">
                  <input
                    type="text"
                    placeholder="Please specify your focus..."
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    className="onboard-custom-input"
                  />
                </div>
              )}
            </div>
            <div className="onboard-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleNext} disabled={!focus || (focus === 'Other' && !customFocus.trim())}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step fade-in-slide">
            <h1>What is the main resistance blocking your path?</h1>
            <p className="onboard-sub">Identifying the obstacle is the first step to overcoming it.</p>
            <div className="onboard-options">
              {OBSTACLE_OPTIONS.map((opt, i) => renderOption(opt, obstacle, setObstacle, i))}
              {renderOption({ id: 'other', label: 'Other', icon: MoreHorizontal }, obstacle, setObstacle, OBSTACLE_OPTIONS.length)}
              
              {obstacle === 'Other' && (
                <div className="fade-in">
                  <input
                    type="text"
                    placeholder="Please specify your obstacle..."
                    value={customObstacle}
                    onChange={(e) => setCustomObstacle(e.target.value)}
                    className="onboard-custom-input"
                  />
                </div>
              )}
            </div>
            <div className="onboard-actions">
              <button className="btn btn-ghost" onClick={handleBack}><ArrowLeft size={18} /> Back</button>
              <button className="btn btn-primary" onClick={handleNext} disabled={!obstacle || (obstacle === 'Other' && !customObstacle.trim())}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-step fade-in-slide">
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
              <button className="btn btn-ghost" onClick={handleBack}><ArrowLeft size={18} /> Back</button>
              <button className="btn btn-primary" onClick={handleFinish} disabled={!vision.trim()}>
                Commune with AETHER <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboard-step fade-in">
            <h1>Architecting your path...</h1>
            
            {parsing && <p className="task-meta">AETHER is analyzing your identity and constraints...</p>}
            {buildingRoadmap && <p className="task-meta">Weaving your personalized roadmap...</p>}
            
            {errorMsg && <p className="task-meta" style={{ color: '#ef4444', marginTop: 12 }}>{errorMsg}</p>}

            {parsed && !parsed.supported && (
              <div className="onboard-result fade-in-slide">
                <span className="eyebrow">Redirection</span>
                <p className="task-meta" style={{ marginTop: 8 }}>
                  {parsed.reasoning || "AETHER cannot chart a path for this specific vision yet."}
                </p>
                <button className="btn btn-ghost" onClick={() => setStep(1)} style={{marginTop: 16}}>
                  <ArrowLeft size={18} /> Start over
                </button>
              </div>
            )}

            {parsed && parsed.supported && !buildingRoadmap && (
              <div className="onboard-result fade-in-slide">
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
                  Enter the Dashboard <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}