import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ICE_SERVERS, signalingUrl } from '../lib/signaling.js'

// This is the page a learner's phone lands on after scanning the QR code
// shown on the assessment screen. It grabs the phone's rear camera and
// streams it, over WebRTC, straight to the desktop assessment tab — no
// account, no app install, just the camera permission prompt.
export default function PhonePairing() {
  const { sessionId } = useParams()
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const wsRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | camera | waiting | connected | error
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setStatus('camera')

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
        pcRef.current = pc
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        pc.onconnectionstatechange = () => {
          if (cancelled) return
          if (pc.connectionState === 'connected') setStatus('connected')
          else if (['failed', 'disconnected'].includes(pc.connectionState)) {
            setStatus('waiting')
          }
        }

        const ws = new WebSocket(signalingUrl(sessionId, 'phone'))
        wsRef.current = ws

        pc.onicecandidate = (e) => {
          if (e.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ice-candidate', candidate: e.candidate }))
          }
        }

        ws.onopen = () => setStatus((s) => (s === 'connected' ? s : 'waiting'))

        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data)
          if (msg.type === 'peer-joined' && msg.role === 'desktop') {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            ws.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }))
          } else if (msg.type === 'answer') {
            await pc.setRemoteDescription(msg.sdp)
          } else if (msg.type === 'ice-candidate' && msg.candidate) {
            try {
              await pc.addIceCandidate(msg.candidate)
            } catch (e) {
              console.warn('Could not add ICE candidate:', e)
            }
          } else if (msg.type === 'peer-left') {
            setStatus('waiting')
          }
        }

        ws.onerror = () => {
          if (!cancelled) {
            setStatus('error')
            setError('Could not reach the signaling server. Is the AETHER backend running?')
          }
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setError(e.message || 'Camera access was denied.')
        }
      }
    }

    start()
    return () => {
      cancelled = true
      wsRef.current?.close()
      pcRef.current?.close()
      const stream = videoRef.current?.srcObject
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [sessionId])

  return (
    <div className="page" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div className="page-head">
        <span className="eyebrow">Second camera</span>
        <h1>Prop this up facing your desk</h1>
      </div>
      <p className="task-meta" style={{ marginBottom: 16 }}>
        {status === 'idle' && 'Requesting camera access…'}
        {status === 'camera' && 'Camera on — connecting to your assessment tab…'}
        {status === 'waiting' && 'Waiting for the assessment tab to connect…'}
        {status === 'connected' && '✅ Connected — this feed is now visible on your assessment screen.'}
        {status === 'error' && (error || 'Something went wrong.')}
      </p>
      <video ref={videoRef} className="cam-preview" muted playsInline style={{ width: '100%', borderRadius: 12 }} />
      <p className="task-meta" style={{ marginTop: 16 }}>
        Keep this tab open for the length of the assessment. Session id: {sessionId}.
      </p>
    </div>
  )
}