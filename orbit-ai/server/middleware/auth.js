import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })
}

// Reads "Authorization: Bearer <token>", verifies it, and attaches
// req.userId. Responds 401 on anything missing/invalid/expired rather than
// letting a route crash on a null userId.
export function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server missing JWT_SECRET' })
  }
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Like requireAuth, but never locks a person out: signed-in users are
// identified by their JWT as usual (req.isGuest = false); everyone else is
// identified by a stable per-device ID the client generates once and sends
// as "X-Guest-Id" (req.isGuest = true). This is what lets AETHER — and any
// other route that adopts it — be used by everyone, not just people with an
// account, while still giving each guest their own persisted profile.
export function identify(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (token && JWT_SECRET) {
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      req.userId = payload.sub
      req.isGuest = false
      return next()
    } catch (err) {
      // Expired/invalid token: fall through to guest handling below instead
      // of hard-failing, so a stale token doesn't lock someone out entirely.
    }
  }

  const guestId = req.headers['x-guest-id']
  if (typeof guestId === 'string' && guestId.length >= 8 && guestId.length <= 64) {
    req.userId = `guest-${guestId}`
    req.isGuest = true
    return next()
  }

  return res.status(400).json({ error: 'Missing auth token or X-Guest-Id header' })
}