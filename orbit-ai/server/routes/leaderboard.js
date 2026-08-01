import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Requires auth just so we're not exposing every learner's name/progress to
// an anonymous caller — any logged-in learner can see the board, same as
// the old mock version showed everyone the same fixed list.
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find({ 'state.goal': { $ne: null } }).select('state _id')

    const board = users.map((u) => {
      const roadmap = u.state?.roadmap || []
      const completed = roadmap.filter((m) => m.status === 'completed').length
      return {
        id: u._id.toString(),
        name: u.state?.profile?.name || 'Learner',
        domain: u.state?.goal?.domain || 'unknown',
        completed,
        streak: u.state?.streak || 0,
        isYou: u._id.toString() === req.userId,
      }
    })

    board.sort((a, b) => b.completed - a.completed || b.streak - a.streak)

    res.json({ board })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Could not load leaderboard', detail: err.message })
  }
})

export default router