import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function FocusMode() {
  const { logTimeSpent } = useApp()
  const navigate = useNavigate()
  
  const [isActive, setIsActive] = useState(false)
  const [minutes, setMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      handleComplete()
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  function handleStart() {
    setIsActive(true)
  }

  function handlePause() {
    setIsActive(false)
  }

  function handleComplete() {
    setIsActive(false)
    const minutesSpent = Math.floor((minutes * 60 - timeLeft) / 60)
    if (minutesSpent > 0) {
      logTimeSpent(minutes, minutesSpent)
    }
    navigate('/dashboard')
  }

  function handleEarlyExit() {
    handleComplete()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="focus-nexus">
      <div className="focus-header">
        <button className="btn btn-ghost" onClick={handleEarlyExit}>
          ← Abort Session
        </button>
        <span className="eyebrow" style={{ color: 'var(--gold)'}}>Deep Work Nexus</span>
      </div>

      <div className="focus-center">
        <div className={`focus-ring-container ${isActive ? 'active' : ''}`}>
          <div className="time-display">{formatTime(timeLeft)}</div>
          <svg className="focus-svg-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" className="bg-ring" />
            <circle 
              cx="50" cy="50" r="48" 
              className="progress-ring" 
              style={{ strokeDasharray: 301.59, strokeDashoffset: isActive ? (301.59 * (1 - timeLeft / (minutes * 60))) : 0 }}
            />
          </svg>
        </div>

        <div className="focus-controls">
          {!isActive && timeLeft === minutes * 60 ? (
            <>
              <div className="time-setter">
                <button className={`btn ${minutes===15 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMinutes(15); setTimeLeft(15 * 60); }}>15m</button>
                <button className={`btn ${minutes===25 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMinutes(25); setTimeLeft(25 * 60); }}>25m</button>
                <button className={`btn ${minutes===60 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMinutes(60); setTimeLeft(60 * 60); }}>60m</button>
              </div>
              <button className="btn btn-primary btn-lg focus-start-btn" onClick={handleStart}>Initiate Protocol</button>
            </>
          ) : isActive ? (
            <button className="btn btn-secondary btn-lg" onClick={handlePause}>Pause Integration</button>
          ) : (
            <div style={{display:'flex', gap:'16px'}}>
              <button className="btn btn-primary btn-lg" onClick={handleStart}>Resume</button>
              <button className="btn btn-ghost btn-lg" onClick={handleComplete}>Complete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
