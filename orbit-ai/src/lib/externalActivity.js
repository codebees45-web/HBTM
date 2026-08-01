// Talks to the AETHER browser extension (see /browser-extension) if it's
// installed. Real cross-site reading time from course-provider pages
// (Coursera, Udemy, Cisco NetAcad) lives in the extension's own storage —
// a webpage fundamentally cannot read another origin's scroll/focus events,
// so a content script bridge is the only legitimate way to get it here.
// Everything degrades cleanly to "not installed" if the extension is absent.

export function isExtensionPresent() {
  return new Promise((resolve) => {
    let done = false
    function onMessage(event) {
      if (event.source !== window) return
      if (event.data?.type === 'ORBIT_EXTENSION_PRESENT') {
        done = true
        window.removeEventListener('message', onMessage)
        resolve(true)
      }
    }
    window.addEventListener('message', onMessage)
    setTimeout(() => {
      if (!done) {
        window.removeEventListener('message', onMessage)
        resolve(false)
      }
    }, 400)
  })
}

// Resolves to { totalSeconds, byDomain } for today, or null if either the
// extension isn't installed or it has no data for today yet.
export function requestTodayExternalActivity() {
  return new Promise((resolve) => {
    let done = false
    function onMessage(event) {
      if (event.source !== window) return
      if (event.data?.type === 'ORBIT_EXTERNAL_ACTIVITY') {
        done = true
        window.removeEventListener('message', onMessage)
        const today = new Date().toISOString().slice(0, 10)
        resolve(event.data.payload?.[today] || null)
      }
    }
    window.addEventListener('message', onMessage)
    window.postMessage({ type: 'ORBIT_REQUEST_EXTERNAL_ACTIVITY' }, window.location.origin)
    setTimeout(() => {
      if (!done) {
        window.removeEventListener('message', onMessage)
        resolve(null)
      }
    }, 800)
  })
}