// Pushes AETHER's existing course catalogue (src/data/mockData.js) into the
// Chroma sidecar's "resources" collection, so the Gap Analysis Agent has a
// real library to semantically search against from day one.
//
// This deliberately reuses COURSE_CATALOGUE instead of a separate seed list
// — those are the same real, working links already shown on the Roadmap
// page, so a curated resource and a roadmap milestone can point at the same
// course without the two ever drifting apart.
//
// Run from server/:
//   node seed/seedResources.js
//
// Requires the sidecar running (see /chroma-sidecar/README.md) and
// CHROMA_SIDECAR_URL set (defaults to http://localhost:8000).

import 'dotenv/config'
import { COURSE_CATALOGUE } from '../../src/data/mockData.js'
import { upsertResources, chromaHealth } from '../chroma/chromaClient.js'

async function main() {
  const ok = await chromaHealth()
  if (!ok) {
    console.error(
      '❌ Chroma sidecar is not reachable. Start it first — see /chroma-sidecar/README.md.'
    )
    process.exit(1)
  }

  const items = []
  for (const [domain, courses] of Object.entries(COURSE_CATALOGUE)) {
    for (const course of courses) {
      items.push({
        id: `${domain}:${course.id}`,
        // What gets embedded — title + provider gives the embedding model
        // enough signal to match against a Gap Analysis search query.
        document: `${course.title} — ${course.provider} (${domain})`,
        metadata: {
          title: course.title,
          provider: course.provider,
          url: course.url,
          domain,
          estHours: course.estHours,
          type: 'course',
        },
      })
    }
  }

  await upsertResources('resources', items)
  console.log(`✅ Seeded ${items.length} resources across ${Object.keys(COURSE_CATALOGUE).length} domains.`)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})