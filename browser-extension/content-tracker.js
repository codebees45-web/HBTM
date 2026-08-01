// Runs only on the course-provider domains listed in manifest.json. This is
// the real version of the "reading vs. scrolling" detector the in-app
// StudySession panel approximates locally — here it's watching actual
// scroll position and tab focus on the course site itself.
//edited  edited
const TICK_MS = 5000
const FLUSH_MS = 30000
// Per-tick scroll distance beyond which we call it "scrolling past", not
// "reading" — mirrors the threshold used by the in-app study panel.
const FAST_SCROLL_PX = 900

let lastScrollY = window.scrollY
let readingSeconds = 0

function isActivelyReading() {
  if (document.visibilityState !== 'visible' || !document.hasFocus()) return false
  const delta = Math.abs(window.scrollY - lastScrollY)
  lastScrollY = window.scrollY
  return delta < FAST_SCROLL_PX
}

function tick() {
  if (isActivelyReading()) {
    readingSeconds += TICK_MS / 1000
  }
}

function flush() {
  if (readingSeconds <= 0) return
  const seconds = Math.round(readingSeconds)
  readingSeconds = 0
  try {
    chrome.runtime.sendMessage({
      type: 'ORBIT_ACTIVITY',
      domain: window.location.hostname,
      seconds,
      day: new Date().toISOString().slice(0, 10),
    })
  } catch (e) {
    // Extension context can be invalidated (e.g. reload) mid-page-life —
    // don't let that throw and break the host page.
    console.warn('AETHER tracker: could not report activity', e)
  }
}

const tickTimer = setInterval(tick, TICK_MS)
const flushTimer = setInterval(flush, FLUSH_MS)

window.addEventListener('pagehide', flush)
window.addEventListener('beforeunload', flush)
window.addEventListener('unload', () => {
  clearInterval(tickTimer)
  clearInterval(flushTimer)
})
