import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { signToken, requireAuth } from '../middleware/auth.js'

const router = Router()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

function defaultState({ name, email }) {
  return {
    goal: null,
    roadmap: [],
    notifications: [],
    streak: 0,
    xp: 0,
    streakFreezes: 1,
    freezeLog: [],
    timeSpentLog: [],
    activityLog: [],
    profile: {
      name,
      email,
      dailyGoalMinutes: 30,
      remindersEnabled: true,
      theme: 'dark',
      language: 'en',
    },
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      state: defaultState({ name: name.trim(), email: email.toLowerCase().trim() }),
    })

    const token = signToken(user._id.toString())
    res.status(201).json({ token, user: user.toSafeJSON(), state: user.state })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed', detail: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user._id.toString())
    res.json({ token, user: user.toSafeJSON(), state: user.state })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed', detail: err.message })
  }
})

router.post('/google', async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: 'Server missing GOOGLE_CLIENT_ID' })
    }
    const { idToken } = req.body
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email) {
      return res.status(401).json({ error: 'Google account has no email' })
    }

    const email = payload.email.toLowerCase().trim()
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] })

    if (!user) {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        state: defaultState({ name: payload.name || email.split('@')[0], email }),
      })
    } else if (!user.googleId) {
      // Existing password account signing in with Google for the first time —
      // link the two so either method works from here on.
      user.googleId = payload.sub
      await user.save()
    }

    const token = signToken(user._id.toString())
    res.json({ token, user: user.toSafeJSON(), state: user.state })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(401).json({ error: 'Google sign-in failed', detail: err.message })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: user.toSafeJSON(), state: user.state })
  } catch (err) {
    console.error('Session restore error:', err)
    res.status(500).json({ error: 'Could not restore session', detail: err.message })
  }
})

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.passwordHash) {
      // Normal account — must prove they know the current password first.
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' })
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!ok) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }
    }
    // Google-only accounts (no passwordHash yet) can set one directly —
    // that's how they add password sign-in alongside "Continue with Google".

    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ ok: true })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Could not change password', detail: err.message })
  }
})

export default router