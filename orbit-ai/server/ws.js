import { WebSocketServer } from 'ws'

// In-memory session rooms: sessionId -> { desktop: WebSocket|null, phone: WebSocket|null }
// Sessions are ephemeral (one assessment sitting) so there's no need to
// persist this anywhere — it lives only as long as the process does.
const rooms = new Map()

function getRoom(sessionId) {
  let room = rooms.get(sessionId)
  if (!room) {
    room = { desktop: null, phone: null }
    rooms.set(sessionId, room)
  }
  return room
}

function cleanupIfEmpty(sessionId) {
  const room = rooms.get(sessionId)
  if (room && !room.desktop && !room.phone) rooms.delete(sessionId)
}

// Minimal signaling relay for the assessment second-camera pairing flow.
// Both peers connect to /ws/pair?session=<id>&role=desktop|phone. Whatever
// one side sends (offer/answer/ice-candidate) is forwarded verbatim to the
// other side of the same session — this server never inspects, validates,
// or stores the SDP/ICE payloads, it's a dumb relay. Actual media (the
// camera video) never touches this server; it flows peer-to-peer.
export function attachSignaling(server) {
  const wss = new WebSocketServer({ server, path: '/ws/pair' })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const sessionId = url.searchParams.get('session')
    const role = url.searchParams.get('role')

    if (!sessionId || (role !== 'desktop' && role !== 'phone')) {
      ws.close(1008, 'session and role (desktop|phone) query params are required')
      return
    }

    const room = getRoom(sessionId)
    const otherRole = role === 'desktop' ? 'phone' : 'desktop'

    // Replace any stale connection for this role (e.g. a refreshed tab)
    // rather than rejecting the new one.
    if (room[role] && room[role] !== ws) {
      try {
        room[role].close(1000, 'replaced by a new connection')
      } catch {
        // already closed — nothing to do
      }
    }
    room[role] = ws

    const peer = room[otherRole]
    if (peer && peer.readyState === peer.OPEN) {
      peer.send(JSON.stringify({ type: 'peer-joined', role }))
      ws.send(JSON.stringify({ type: 'peer-joined', role: otherRole }))
    }

    ws.on('message', (data) => {
      const peer = room[otherRole]
      if (peer && peer.readyState === peer.OPEN) {
        peer.send(data.toString())
      }
    })

    ws.on('close', () => {
      if (room[role] === ws) room[role] = null
      const peer = room[otherRole]
      if (peer && peer.readyState === peer.OPEN) {
        peer.send(JSON.stringify({ type: 'peer-left', role }))
      }
      cleanupIfEmpty(sessionId)
    })

    ws.on('error', (err) => {
      console.warn(`Signaling socket error (session ${sessionId}, role ${role}):`, err.message)
    })
  })

  return wss
}