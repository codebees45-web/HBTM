import { useEffect, useRef, useState } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Renders Google's own "Continue with Google" button via Google Identity
// Services (https://accounts.google.com/gsi/client, loaded in index.html).
// On success it hands the signed credential (a JWT) up to the caller, which
// sends it to the backend (/api/auth/google) to be verified and exchanged
// for a session token — same shape as the email/password login/register flow.
export default function GoogleSignInButton({ onCredential, text = 'continue_with' }) {
  const wrapRef = useRef(null)
  const divRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) {
      setNotConfigured(true)
      return
    }

    let cancelled = false
    let resizeObserver = null

    // GIS's renderButton only accepts a fixed pixel width (no '100%'), so we
    // measure the wrapping container ourselves and re-render whenever it
    // changes size — otherwise the button stays hardcoded at one width and
    // drifts out of alignment with the rest of the form.
    function currentWidth() {
      const measured = wrapRef.current?.getBoundingClientRect().width
      return Math.max(200, Math.min(400, Math.round(measured || 360)))
    }

    function render() {
      if (cancelled || !window.google?.accounts?.id || !divRef.current) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          setBusy(true)
          try {
            await onCredential(response.credential)
          } finally {
            setBusy(false)
          }
        },
      })
      divRef.current.replaceChildren()
      window.google.accounts.id.renderButton(divRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: currentWidth(),
        text,
      })
    }

    function start() {
      render()
      if (wrapRef.current && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => render())
        resizeObserver.observe(wrapRef.current)
      }
    }

    // The GIS script loads async — poll briefly until it's ready.
    if (window.google?.accounts?.id) {
      start()
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer)
          start()
        }
      }, 100)
      setTimeout(() => clearInterval(timer), 10000)
      return () => clearInterval(timer)
    }

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
    }
  }, [onCredential, text])

  if (notConfigured) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-google"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    )
  }

  return (
    <div className="google-btn-wrap" ref={wrapRef} aria-busy={busy}>
      <div ref={divRef} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.48a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.26a12 12 0 0 0 0 10.76z"/>
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"/>
    </svg>
  )
}