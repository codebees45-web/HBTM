// Bump this on every deploy that changes cached assets, so old clients pick
// up the new version instead of being stuck on a stale cache forever.
const VERSION = 'v1'
const CACHE_NAME = `orbit-ai-${VERSION}`

const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {
        // Fine if this fails on first install (e.g. offline) — runtime
        // caching below will fill things in as pages get visited.
      })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function isApiOrSocket(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never intercept anything but plain GETs — auth, mentor chat, and state
  // sync are all POST/PUT and must always hit the real server.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Don't touch cross-origin requests (Google fonts, Google Sign-In script,
  // the Groq/Anthropic-backed API if it's ever pointed elsewhere) — let the
  // browser handle those exactly as if there were no service worker at all.
  if (url.origin !== self.location.origin) return

  // API and WebSocket traffic must always be live — a cached mentor reply
  // or stale roadmap state would be actively wrong, not just outdated.
  if (isApiOrSocket(url)) return

  // SPA navigations: try the network first (so signed-in users always get
  // fresh content when online), fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy))
          return res
        })
        .catch(() => caches.match('/').then((cached) => cached || caches.match('/index.html')))
    )
    return
  }

  // Everything else same-origin (JS/CSS/images Vite builds, fonts, etc.):
  // stale-while-revalidate — instant response from cache if we have one,
  // refreshed in the background for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || networkFetch
    })
  )
})