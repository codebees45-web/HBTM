// AETHER orchestrator — the sequential multi-agent pipeline described in
// §6/§9 of the doc, built with LangGraph.js:
//
//   Identity → Habit Intelligence → Gap Analysis → Curator → Growth Coach
//
// LangGraph is used here for exactly the reason the doc gives it (§8): it
// gives each stage an explicit, typed state to read/write instead of
// hand-rolled routing, and it's the natural home for the feedback loop.
//
// Note on the feedback loop (§6, §10): the loop isn't a live edge back to
// "identity" within a single graph run (a person doesn't act on a growth
// plan within the same request). Instead, each cycle starts by loading the
// *stored* Identity/Habit Profiles from Mongo, POST /api/AETHER/feedback
// appends the person's reflections/progress to that stored profile, and the
// next call to runAETHERCycle() re-reads it — so the loop closes across
// cycles, which is how the doc describes it actually working end-to-end.

import { Annotation, StateGraph, START, END } from '@langchain/langgraph'
import { runIdentityAgent } from './identityAgent.js'
import { runHabitAgent } from './habitAgent.js'
import { runGapAnalysisAgent } from './gapAnalysisAgent.js'
import { runCuratorAgent } from './curatorAgent.js'
import { runGrowthCoachAgent } from './growthCoachAgent.js'

const lastWins = (_prev, next) => next

const AETHERState = Annotation.Root({
  // ---- inputs ----
  goal: Annotation({ value: lastWins, default: () => null }),
  activityLog: Annotation({ value: lastWins, default: () => [] }),
  timeSpentLog: Annotation({ value: lastWins, default: () => [] }),
  roadmap: Annotation({ value: lastWins, default: () => [] }),
  existingIdentityProfile: Annotation({ value: lastWins, default: () => null }),
  feedbackHistory: Annotation({ value: lastWins, default: () => [] }),

  // ---- produced by each node, in pipeline order ----
  identityProfile: Annotation({ value: lastWins, default: () => null }),
  habitProfile: Annotation({ value: lastWins, default: () => null }),
  gaps: Annotation({ value: lastWins, default: () => [] }),
  candidateResources: Annotation({ value: lastWins, default: () => [] }),
  chromaAvailable: Annotation({ value: lastWins, default: () => false }),
  curated: Annotation({ value: lastWins, default: () => [] }),
  growthPlan: Annotation({ value: lastWins, default: () => null }),
})

async function identityNode(state) {
  const identityProfile = await runIdentityAgent({
    goal: state.goal,
    existingProfile: state.existingIdentityProfile,
    feedbackHistory: state.feedbackHistory,
  })
  return { identityProfile }
}

async function habitNode(state) {
  const habitProfile = await runHabitAgent({
    activityLog: state.activityLog,
    timeSpentLog: state.timeSpentLog,
    roadmap: state.roadmap,
  })
  return { habitProfile }
}

async function gapAnalysisNode(state) {
  const { gaps, candidateResources, chromaAvailable } = await runGapAnalysisAgent({
    identityProfile: state.identityProfile,
    habitProfile: state.habitProfile,
    goal: state.goal,
  })
  return { gaps, candidateResources, chromaAvailable }
}

async function curatorNode(state) {
  const { curated } = await runCuratorAgent({
    gaps: state.gaps,
    candidateResources: state.candidateResources,
  })
  return { curated }
}

async function growthCoachNode(state) {
  const growthPlan = await runGrowthCoachAgent({
    curated: state.curated,
    habitProfile: state.habitProfile,
  })
  return { growthPlan }
}

const graph = new StateGraph(AETHERState)
  .addNode('identity', identityNode)
  .addNode('habit', habitNode)
  .addNode('gapAnalysis', gapAnalysisNode)
  .addNode('curator', curatorNode)
  .addNode('growthCoach', growthCoachNode)
  .addEdge(START, 'identity')
  .addEdge('identity', 'habit')
  .addEdge('habit', 'gapAnalysis')
  .addEdge('gapAnalysis', 'curator')
  .addEdge('curator', 'growthCoach')
  .addEdge('growthCoach', END)
  .compile()

/**
 * Runs one full AETHER cycle end-to-end.
 * @param {object} input - see AETHERState "inputs" section above
 * @returns {Promise<object>} full final state: identityProfile, habitProfile,
 *          gaps, curated, growthPlan, chromaAvailable
 */
export async function runAETHERCycle(input) {
  return graph.invoke(input)
}