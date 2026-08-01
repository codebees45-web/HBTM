import mongoose from 'mongoose'

// Stores the full output of a single AETHER cycle: the named gaps (Gap
// Analysis Agent), the curated resources with their "why" (Curator Agent),
// and the daily/weekly plan (Growth Coach Agent) — kept together since
// they're generated together and always read together by the frontend.
const GrowthPlanSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // account's _id.toString(), or 'guest-<uuid>'
    gaps: { type: [mongoose.Schema.Types.Mixed], default: [] },
    curated: { type: [mongoose.Schema.Types.Mixed], default: [] },
    plan: { type: mongoose.Schema.Types.Mixed, default: null },
    chromaAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Most-recent-first lookups per user (GET /api/AETHER/profile wants the latest one).
GrowthPlanSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('GrowthPlan', GrowthPlanSchema)