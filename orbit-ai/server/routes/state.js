import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ state: user.state })
  } catch (err) {
    console.error('Get state error:', err)
    res.status(500).json({ error: 'Could not load state', detail: err.message })
  }
})

// The frontend sends its whole local state blob on every debounced save —
// simplest possible sync model, no per-field diffing. Good enough at this
// scale; swap for targeted updates if payload size ever becomes an issue.
router.put('/', requireAuth, async (req, res) => {
  try {
    const { state } = req.body
    if (!state || typeof state !== 'object') {
      return res.status(400).json({ error: 'state object is required' })
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { state } },
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ state: user.state })
  } catch (err) {
    console.error('Save state error:', err)
    res.status(500).json({ error: 'Could not save state', detail: err.message })
  }
})

export default router