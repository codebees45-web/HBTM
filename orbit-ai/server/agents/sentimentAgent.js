import { callGroqJson } from './groqClient.js'

const SYSTEM_PROMPT = `You are the Sentiment Analysis Agent inside AETHER, an agentic personal-growth platform.
Your job is to read the user's recent Daily Journal entries alongside their concrete completion metrics (how many tasks/milestones they completed and how much time they spent working) to determine their overall emotional and mental state.

You are the first step in the pipeline. Your output will guide the Identity and Habit agents.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "dominantEmotion": string,       // e.g., "Motivated", "Burned Out", "Frustrated", "Determined"
  "motivationLevel": number,       // 1 to 10 scale (1 = completely disengaged/burned out, 10 = peak flow state)
  "emotionalBlockers": string[],   // what mental or emotional barriers are holding them back? (e.g. "Imposter syndrome", "Fatigue", "Distraction")
  "sentimentSummary": string       // 2-3 sentences summarizing their emotional state combining their words (journal) and actions (task completion).
}`

/**
 * @param {object} params
 * @param {Array<{id:number, date:string, content:string}>} params.journalEntries
 * @param {Array<string>} params.activityLog
 * @param {Array<object>} params.roadmap
 * @param {Array<{day:string, plannedMin:number, actualMin:number}>} params.timeSpentLog
 * @returns {Promise<object>} Sentiment Profile
 */
export async function runSentimentAgent({ journalEntries = [], activityLog = [], roadmap = [], timeSpentLog = [] }) {
  const completedTasks = roadmap.filter(m => m.status === 'completed').length;
  const totalTasks = roadmap.length;
  
  const userParts = [
    '--- Task Completion Metrics ---',
    `Total milestones completed: ${completedTasks} out of ${totalTasks}`,
    `Days active (recently): ${activityLog.slice(-14).length} days in the last 2 weeks`,
    `Recent Time Spent Log: ${JSON.stringify(timeSpentLog.slice(-7))}`,
    '',
    '--- Recent Daily Journal Entries ---',
    journalEntries.length === 0 
      ? 'No journal entries provided.'
      : journalEntries.slice(-5).map(j => `[${j.date}] ${j.content}`).join('\n')
  ]

  const sentimentProfile = await callGroqJson({
    system: SYSTEM_PROMPT,
    user: userParts.join('\n'),
    max_tokens: 400,
  })

  return {
    ...sentimentProfile,
    updatedAt: new Date().toISOString(),
  }
}
