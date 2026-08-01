import mongoose from 'mongoose'

// One document per user. `current` is what the Identity Agent reads/writes
// each cycle; `feedbackHistory` is what POST /api/AETHER/feedback appends to
// — this is the concrete storage for the "feedback loop" in §6/§10 of the
// doc: outcomes flow back into the identity model instead of disappearing.
const IdentityProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // account's _id.toString(), or 'guest-<uuid>'
    current: { type: mongoose.Schema.Types.Mixed, default: null },
    history: { type: [mongoose.Schema.Types.Mixed], default: [] }, // past `current` snapshots
    feedbackHistory: {
      type: [
        new mongoose.Schema(
          { note: String, at: { type: Date, default: Date.now } },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
)

export default mongoose.model('IdentityProfile', IdentityProfileSchema)