// Thin HTTP client for the ChromaDB sidecar (see /chroma-sidecar at the
// project root). Node talks to it over plain HTTP instead of embedding
// Chroma in-process, since Chroma's real client is Python — see the
// sidecar's own README for why and how to run it.

const BASE_URL = process.env.CHROMA_SIDECAR_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.error || `Chroma sidecar returned ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export async function chromaHealth() {
  try {
    await request('/health')
    return true
  } catch {
    return false
  }
}

/**
 * Upserts resources into a Chroma collection. Each item's `document` is what
 * gets embedded; `metadata` is returned alongside on query (title, url, etc).
 * @param {string} collection
 * @param {Array<{id:string, document:string, metadata:object}>} items
 */
export async function upsertResources(collection, items) {
  return request(`/collections/${encodeURIComponent(collection)}/upsert`, {
    method: 'POST',
    body: JSON.stringify({
      ids: items.map((i) => i.id),
      documents: items.map((i) => i.document),
      metadatas: items.map((i) => i.metadata),
    }),
  })
}

/**
 * Semantic search against a Chroma collection.
 * @param {string} collection
 * @param {string} queryText
 * @param {number} nResults
 * @param {object|null} where - optional metadata filter, e.g. { domain: 'data science' }
 * @returns {Promise<Array<{id:string, document:string, metadata:object, distance:number}>>}
 */
export async function queryResources(collection, queryText, nResults = 5, where = null) {
  const data = await request(`/collections/${encodeURIComponent(collection)}/query`, {
    method: 'POST',
    body: JSON.stringify({ query_text: queryText, n_results: nResults, where }),
  })
  return data.results || []
}