import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { keywordToDomain, buildRoadmapFromMilestones } from '../data/mockData.js'

const TIMELINES = ['4 weeks', '8 weeks', '12 weeks', '6 months']
const SKILL_LEVELS = ['Complete beginner', 'Some basics', 'Comfortable, need structure']
const PARSE_ENDPOINT = import.meta.env.VITE_PARSE_GOAL_URL || '/api/parse-goal'
const ROADMAP_ENDPOINT = import.meta.env.VITE_ROADMAP_URL || '/api/generate-roadmap'

export default function Onboarding() {
  const { setGoal } = useApp()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [level, setLevel] = useState(SKILL_LEVELS[0])
  const [timeline, setTimeline] = useState(TIMELINES[1])
  const [parsing, setParsing] = useState(false)
  const [buildingRoadmap, setBuildingRoadmap] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [milestones, setMilestones] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [roadmapError, setRoadmapError] = useState(null)

  async function handleParse(e) {
    e.preventDefault()
    if (!text.trim()) return
    setParsing(true)
    setParsed(null)
    setMilestones(null)
    setParseError(null)
    setRoadmapError(null)

    let parsedGoal
    try {
      const res = await fetch(PARSE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      const data = await res.json()
      parsedGoal = {
        domain: data.domain,
        level,
        timeline,
        modelTimeline: data.timeline || null,
        skillGaps: data.skillGaps || [],
        reasoning: data.reasoning || '',
      }
    } catch (err) {
      // Never let onboarding get stuck just because the backend is down —
      // fall back to local keyword matching, but say so plainly.
      setParseError(err.message)
      parsedGoal = {
        domain: keywordToDomain(text),
        level,
        timeline,
        modelTimeline: null,
        skillGaps: [],
        reasoning: '',
      }
    }

    setParsed(parsedGoal)
    setParsing(false)

    // Immediately follow up with the AI-generated roadmap for this goal.
    setBuildingRoadmap(true)
    try {
      const res = await fetch(ROADMAP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: text,
          domain: parsedGoal.domain,
          level,
          timeline,
          skillGaps: parsedGoal.skillGaps,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server returned ${res.status}`)
      }
      const data = await res.json()
      setMilestones(data.milestones)
    } catch (err) {
      // Fall back to null — handleConfirm falls back to the static
      // catalogue-based roadmap if this is missing.
      setRoadmapError(err.message)
      setMilestones(null)
    } finally {
      setBuildingRoadmap(false)
    }
  }

  function handleConfirm() {
    const roadmap = milestones ? buildRoadmapFromMilestones(milestones) : undefined
    setGoal({ text, timeline, domain: parsed.domain, roadmap })
    navigate('/dashboard')
  }

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <span className="eyebrow">Step 1 of 1</span>
        <h1>What are you trying to achieve?</h1>
        <p className="onboard-sub">
          Say it in your own words. ORBIT AI will pull out the domain, your
          current level, and a realistic plan.
        </p>

        <form onSubmit={handleParse} className="onboard-form">
          <label htmlFor="goal-text">Your goal</label>
          <textarea
            id="goal-text"
            rows={3}
            placeholder='e.g. "Pass the AWS Solutions Architect exam" or "Become job-ready in full stack development"'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="onboard-row">
            <div className="onboard-field">
              <label htmlFor="level">Current level</label>
              <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="onboard-field">
              <label htmlFor="timeline">Timeline</label>
              <select id="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)}>
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={parsing || buildingRoadmap || !text.trim()}>
            {parsing ? 'Parsing your goal…' : buildingRoadmap ? 'Building your roadmap…' : 'Parse my goal →'}
          </button>
        </form>

        {parseError && (
          <p className="task-meta" style={{ marginTop: 12, color: '#E8B355' }}>
            Couldn't reach the goal-parsing backend ({parseError}) — used local
            keyword matching instead. Start the server (see server/README.md)
            for real parsing.
          </p>
        )}

        {roadmapError && (
          <p className="task-meta" style={{ marginTop: 12, color: '#E8B355' }}>
            Couldn't reach the roadmap-generation backend ({roadmapError}) —
            you'll get the standard catalogue-based roadmap for this domain instead.
          </p>
        )}

        {parsed && (
          <div className="onboard-result">
            <span className="eyebrow">Parsed intent</span>
            <ul>
              <li><strong>Domain:</strong> {parsed.domain}</li>
              <li><strong>Level:</strong> {parsed.level}</li>
              <li><strong>Timeline:</strong> {parsed.timeline}</li>
              {parsed.modelTimeline && (
                <li><strong>Model's read on pace:</strong> {parsed.modelTimeline}</li>
              )}
            </ul>
            {parsed.skillGaps.length > 0 && (
              <>
                <strong style={{ display: 'block', marginTop: 10 }}>Likely skill gaps</strong>
                <ul>
                  {parsed.skillGaps.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </>
            )}
            {parsed.reasoning && (
              <p className="task-meta" style={{ marginTop: 8 }}>{parsed.reasoning}</p>
            )}

            {buildingRoadmap && (
              <p className="task-meta" style={{ marginTop: 12 }}>Building your personalized roadmap…</p>
            )}

            {milestones && (
              <>
                <strong style={{ display: 'block', marginTop: 16 }}>Your AI-generated roadmap</strong>
                <ul>
                  {milestones.map((m, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      <strong>{m.title}</strong> — {m.provider} (~{m.estHours}h)
                      {m.description && <div className="task-meta">{m.description}</div>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={buildingRoadmap}
              style={{ marginTop: 14 }}
            >
              Build my roadmap →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}