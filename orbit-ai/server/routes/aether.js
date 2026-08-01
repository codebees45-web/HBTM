import { Router } from 'express'
import { identify } from '../middleware/auth.js'
import User from '../models/User.js'
import IdentityProfile from '../models/IdentityProfile.js'
import HabitProfile from '../models/HabitProfile.js'
import GrowthPlan from '../models/GrowthPlan.js'
import { runAETHERCycle } from '../agents/orchestrator.js'

const router = Router()

// POST /api/AETHER/cycle
// Runs one full pass of the 5-agent pipeline for whoever is asking — signed
// in or guest (see middleware/auth.js:identify). The client always sends its
// current goal/roadmap/activityLog/timeSpentLog in the body: guests have no
// server-side User doc to read state from, and authed users get it too so a
// cycle reflects what's actually on screen rather than a possibly-stale
// server sync. If an authed user's body is empty for some reason, we still
// fall back to their last-synced state so nothing breaks for existing callers.
router.post('/cycle', identify, async (req, res) => {
  try {
    let goal, roadmap = [], activityLog = [], timeSpentLog = []

    if (req.body && req.body.goal) {
      ;({ goal, roadmap = [], activityLog = [], timeSpentLog = [] } = req.body)
    } else if (!req.isGuest) {
      const user = await User.findById(req.userId)
      if (!user) return res.status(404).json({ error: 'User not found' })
      ;({ goal, roadmap = [], activityLog = [], timeSpentLog = [] } = user.state || {})
    }

    if (!goal || !goal.text) {
      return res.status(400).json({ error: 'Set a goal (via onboarding) before running AETHER.' })
    }

    const existingIdentity = await IdentityProfile.findOne({ userId: req.userId })

    const result = await runAETHERCycle({
      goal,
      roadmap,
      activityLog,
      timeSpentLog,
      existingIdentityProfile: existingIdentity?.current || null,
      feedbackHistory: existingIdentity?.feedbackHistory || [],
    })

    // Persist Identity Profile (rolling history of past snapshots).
    await IdentityProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: { current: result.identityProfile },
        $push: existingIdentity?.current
          ? { history: { $each: [existingIdentity.current], $slice: -20 } }
          : {},
      },
      { upsert: true, new: true }
    )

    // Persist Habit Profile.
    const existingHabit = await HabitProfile.findOne({ userId: req.userId })
    await HabitProfile.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: { current: result.habitProfile },
        $push: existingHabit?.current
          ? { history: { $each: [existingHabit.current], $slice: -20 } }
          : {},
      },
      { upsert: true, new: true }
    )

    // Store this cycle's growth plan as a new document (we keep every cycle,
    // not just the latest, so progress over time can be shown later).
    const growthPlanDoc = await GrowthPlan.create({
      userId: req.userId,
      gaps: result.gaps,
      curated: result.curated,
      plan: result.growthPlan,
      chromaAvailable: result.chromaAvailable,
    })

    res.json({
      identityProfile: result.identityProfile,
      habitProfile: result.habitProfile,
      gaps: result.gaps,
      curated: result.curated,
      growthPlan: result.growthPlan,
      chromaAvailable: result.chromaAvailable,
      growthPlanId: growthPlanDoc._id,
    })
  } catch (err) {
    console.error('AETHER cycle error:', err)
    res.status(err.status || 500).json({ error: 'AETHER cycle failed', detail: err.message })
  }
})

// GET /api/AETHER/profile
// Returns the latest Identity Profile, Habit Profile, and most recent
// Growth Plan for the signed-in user, without running a new cycle.
router.get('/profile', identify, async (req, res) => {
  try {
    const [identity, habit, latestPlan] = await Promise.all([
      IdentityProfile.findOne({ userId: req.userId }),
      HabitProfile.findOne({ userId: req.userId }),
      GrowthPlan.findOne({ userId: req.userId }).sort({ createdAt: -1 }),
    ])

    res.json({
      identityProfile: identity?.current || null,
      habitProfile: habit?.current || null,
      gaps: latestPlan?.gaps || [],
      curated: latestPlan?.curated || [],
      growthPlan: latestPlan?.plan || null,
      feedbackHistory: identity?.feedbackHistory || [],
      hasRunBefore: Boolean(identity?.current),
    })
  } catch (err) {
    console.error('Get AETHER profile error:', err)
    res.status(500).json({ error: 'Could not load AETHER profile', detail: err.message })
  }
})

// POST /api/AETHER/feedback
// This is the concrete implementation of the feedback loop in §6/§10 of the
// doc: the person's reflection/progress note is appended to their Identity
// Profile's feedback history, which the Identity Agent reads at the start
// of the *next* /cycle call — so the identity model keeps updating from
// outcomes instead of staying static.
router.post('/feedback', identify, async (req, res) => {
  try {
    const { note } = req.body
    if (!note || typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({ error: 'note is required' })
    }

    const identity = await IdentityProfile.findOneAndUpdate(
      { userId: req.userId },
      { $push: { feedbackHistory: { $each: [{ note: note.trim(), at: new Date() }], $slice: -30 } } },
      { upsert: true, new: true }
    )

    res.json({ feedbackHistory: identity.feedbackHistory })
  } catch (err) {
    console.error('AETHER feedback error:', err)
    res.status(500).json({ error: 'Could not save feedback', detail: err.message })
  }
})

export default router