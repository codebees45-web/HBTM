import mongoose from 'mongoose'

const HabitProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // account's _id.toString(), or 'guest-<uuid>'
    current: { type: mongoose.Schema.Types.Mixed, default: null },
    history: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('HabitProfile', HabitProfileSchema)