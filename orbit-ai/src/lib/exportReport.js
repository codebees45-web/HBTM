import { jsPDF } from 'jspdf'
import { BADGES } from '../data/mockData.js'

const GOLD = [217, 164, 65]
const INK = [20, 17, 10]
const MUTED = [110, 110, 110]
const LINE = [225, 220, 208]

function statusLabel(status) {
  if (status === 'completed') return 'Completed'
  if (status === 'active') return 'In progress'
  return 'Locked'
}

/**
 * Builds and downloads a one-page-per-section PDF summarizing the
 * learner's current progress: overall completion, per-milestone detail,
 * badges earned, and time logged. Runs entirely client-side.
 */
export function exportProgressReport(state) {
  const { goal, roadmap, profile, streak, timeSpentLog } = state

  const completedCount = roadmap.filter((m) => m.status === 'completed').length
  const completionPct = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0
  const scoredQuizzes = roadmap.filter((m) => m.quizScore !== null)
  const avgScore = scoredQuizzes.length
    ? Math.round(scoredQuizzes.reduce((sum, m) => sum + m.quizScore, 0) / scoredQuizzes.length)
    : null
  const totalActualMin = timeSpentLog.reduce((sum, t) => sum + (t.actualMin || 0), 0)
  const earnedBadges = BADGES.filter((b) => b.isEarned(state))

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 48
  let y = 56

  function ensureSpace(height) {
    if (y + height > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage()
      y = 56
    }
  }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...INK)
  doc.text('AETHER — Progress Report', marginX, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  const generatedOn = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`${profile?.name || 'Learner'} · Generated ${generatedOn}`, marginX, y)
  y += 8
  doc.setDrawColor(...LINE)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 28

  // Goal
  if (goal?.text) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text('Goal', marginX, y)
    y += 16
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...MUTED)
    const goalLines = doc.splitTextToSize(goal.text, pageWidth - marginX * 2)
    doc.text(goalLines, marginX, y)
    y += goalLines.length * 14 + 18
  }

  // Summary stats
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text('Summary', marginX, y)
  y += 18

  const stats = [
    ['Completion', `${completionPct}%`],
    ['Milestones done', `${completedCount} / ${roadmap.length}`],
    ['Current streak', `${streak}`],
    ['Average quiz score', avgScore !== null ? `${avgScore}%` : '—'],
    ['Time logged', `${totalActualMin} min`],
    ['Badges earned', `${earnedBadges.length} / ${BADGES.length}`],
  ]
  const colWidth = (pageWidth - marginX * 2) / 2
  stats.forEach(([label, value], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = marginX + col * colWidth
    const rowY = y + row * 34
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...INK)
    doc.text(value, x, rowY + 16)
  })
  y += Math.ceil(stats.length / 2) * 34 + 20

  doc.setDrawColor(...LINE)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 28

  // Milestones table
  ensureSpace(60)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text('Milestones', marginX, y)
  y += 20

  const colTitle = marginX
  const colStatus = marginX + 260
  const colScore = marginX + 360
  const colHours = marginX + 440

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('TITLE', colTitle, y)
  doc.text('STATUS', colStatus, y)
  doc.text('SCORE', colScore, y)
  doc.text('TIME', colHours, y)
  y += 6
  doc.setDrawColor(...LINE)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 16

  roadmap.forEach((m) => {
    ensureSpace(28)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    const titleLines = doc.splitTextToSize(m.title, 240)
    doc.text(titleLines, colTitle, y)

    doc.setTextColor(m.status === 'completed' ? GOLD[0] : MUTED[0], m.status === 'completed' ? GOLD[1] : MUTED[1], m.status === 'completed' ? GOLD[2] : MUTED[2])
    doc.text(statusLabel(m.status), colStatus, y)

    doc.setTextColor(...INK)
    doc.text(m.quizScore !== null ? `${m.quizScore}%` : '—', colScore, y)
    doc.text(`${m.engagedMinutes}m`, colHours, y)

    y += Math.max(titleLines.length * 13, 16) + 8
  })

  y += 12
  ensureSpace(80)
  doc.setDrawColor(...LINE)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 28

  // Badges
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text('Badges earned', marginX, y)
  y += 18

  if (earnedBadges.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No badges earned yet.', marginX, y)
    y += 16
  } else {
    earnedBadges.forEach((b) => {
      ensureSpace(18)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text(`•  ${b.label} — ${b.desc}`, marginX, y)
      y += 16
    })
  }

  const filenameSafeGoal = (goal?.domain || 'progress').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  doc.save(`orbit-ai-report-${filenameSafeGoal}.pdf`)
}