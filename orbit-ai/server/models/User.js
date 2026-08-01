import mongoose from 'mongoose'

// Mirrors DEFAULT_STATE in the frontend's AppContext.jsx exactly, so the
// server can store/return the whole blob without either side needing a
// translation layer. If the frontend's state shape changes, this schema's
// `state` field being a loose Mixed type means it won't need a migration —
// just keep the two in sync conceptually.
const StateSchema = new mongoose.Schema(
  {
    goal: { type: mongoose.Schema.Types.Mixed, default: null },
    roadmap: { type: [mongoose.Schema.Types.Mixed], default: [] },
    notifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    streakFreezes: { type: Number, default: 1 },
    freezeLog: { type: [String], default: [] },
    timeSpentLog: { type: [mongoose.Schema.Types.Mixed], default: [] },
    activityLog: { type: [String], default: [] },
    profile: {
      name: { type: String, default: 'Learner' },
      email: { type: String, default: '' },
      dailyGoalMinutes: { type: Number, default: 30 },
      remindersEnabled: { type: Boolean, default: true },
      theme: { type: String, default: 'dark' },
      language: { type: String, default: 'en' },
    },
  },
  { _id: false, minimize: false }
)

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional: accounts created via "Continue with Google" have no password.
    passwordHash: { type: String, required: false },
    googleId: { type: String, required: false, unique: true, sparse: true },
    state: { type: StateSchema, default: () => ({}) },
  },
  { timestamps: true }
)

// Never let the password hash leak into an API response by accident.
UserSchema.methods.toSafeJSON = function toSafeJSON() {
  return { id: this._id.toString(), name: this.name, email: this.email }
}

export default mongoose.model('User', UserSchema)