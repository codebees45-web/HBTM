// Runs only on the AETHER app's own origin (see manifest.json). Bridges
// the extension's stored cross-site activity into the page: the page has
// no chrome.* API access of its own, so it posts a window message and this
// script relays the request to/from the background worker.
//edited
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data?.type !== 'ORBIT_REQUEST_EXTERNAL_ACTIVITY') return

  chrome.runtime.sendMessage({ type: 'ORBIT_REQUEST_ACTIVITY' }, (response) => {
    window.postMessage(
      { type: 'ORBIT_EXTERNAL_ACTIVITY', payload: response?.orbitActivity || {} },
      window.location.origin
    )
  })
})

// Let the page know the extension is installed as soon as this script
// loads, even before it explicitly asks for activity data.
window.postMessage({ type: 'ORBIT_EXTENSION_PRESENT' }, window.location.origin)
