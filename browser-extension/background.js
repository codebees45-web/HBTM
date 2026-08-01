// Aggregates cross-site reading time per calendar day, keyed so the bridge
// can hand the web app a simple { [day]: { totalSeconds, byDomain } } shape.
// This is the only place activity from every tracked course site converges.
//edited
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'ORBIT_ACTIVITY') {
    chrome.storage.local.get(['orbitActivity'], (res) => {
      const all = res.orbitActivity || {}
      const day = all[msg.day] || { totalSeconds: 0, byDomain: {} }
      day.totalSeconds += msg.seconds
      day.byDomain[msg.domain] = (day.byDomain[msg.domain] || 0) + msg.seconds
      all[msg.day] = day

      // Keep the last 60 days only so storage doesn't grow forever.
      const days = Object.keys(all).sort()
      while (days.length > 60) delete all[days.shift()]

      chrome.storage.local.set({ orbitActivity: all })
    })
    return false
  }

  if (msg.type === 'ORBIT_REQUEST_ACTIVITY') {
    chrome.storage.local.get(['orbitActivity'], (res) => {
      sendResponse({ orbitActivity: res.orbitActivity || {} })
    })
    return true // keeps the message channel open for the async sendResponse
  }

  return false
})
