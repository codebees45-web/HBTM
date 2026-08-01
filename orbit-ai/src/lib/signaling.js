// Shared helpers for the assessment second-camera WebRTC pairing flow.
// Both the phone-side (PhonePairing.jsx) and desktop-side (Assessment.jsx)
// peers use these to reach the same signaling server and room.

export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function signalingUrl(sessionId, role) {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/ws/pair?session=${encodeURIComponent(sessionId)}&role=${role}`
}