// Central mock content. Swap this for real API calls once the backend
// (goal parsing, course catalogue, analytics) is ready.

export const COURSE_CATALOGUE = {
  'full stack development': [
    { id: 'c1', title: 'The Web Developer Bootcamp', provider: 'Udemy', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/', estHours: 24 },
    { id: 'c2', title: 'Meta Front-End Developer', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', estHours: 30 },
    { id: 'c3', title: 'Node.js, Express, MongoDB & More', provider: 'Udemy', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', estHours: 20 },
    { id: 'c4', title: 'Version Control with Git', provider: 'Coursera', url: 'https://www.coursera.org/learn/introduction-git-github', estHours: 8 },
  ],
  'aws solutions architect': [
    { id: 'a1', title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', estHours: 6 },
    { id: 'a2', title: 'AWS Certified Solutions Architect - Associate', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/aws-solutions-architect', estHours: 40 },
    { id: 'a3', title: 'Networking Basics', provider: 'Cisco Networking Academy', url: 'https://www.netacad.com/', estHours: 12 },
  ],
  'data science': [
    { id: 'd1', title: 'IBM Data Science Professional Certificate', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/ibm-data-science', estHours: 45 },
    { id: 'd2', title: 'Python for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/python', estHours: 32 },
    { id: 'd3', title: 'Practical Statistics', provider: 'Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability', estHours: 15 },
  ],
  'networking': [
    { id: 'n1', title: 'CCNA: Introduction to Networks', provider: 'Cisco Networking Academy', url: 'https://www.netacad.com/courses/networking/ccna-introduction-networks', estHours: 25 },
    { id: 'n2', title: 'Networking Fundamentals', provider: 'Coursera', url: 'https://www.coursera.org/learn/computer-networking', estHours: 18 },
  ],
}

export function keywordToDomain(goalText) {
  const text = goalText.toLowerCase()
  if (text.includes('full stack') || text.includes('web dev')) return 'full stack development'
  if (text.includes('aws') || text.includes('solutions architect') || text.includes('cloud')) return 'aws solutions architect'
  if (text.includes('data science') || text.includes('machine learning') || text.includes('ml')) return 'data science'
  if (text.includes('network') || text.includes('ccna') || text.includes('cisco')) return 'networking'
  return 'full stack development' // sensible default
}

export function buildRoadmap(domain) {
  const courses = COURSE_CATALOGUE[domain] || COURSE_CATALOGUE['full stack development']
  return courses.map((course, i) => ({
    milestoneId: `m${i + 1}`,
    title: course.title,
    provider: course.provider,
    url: course.url,
    estHours: course.estHours,
    status: i === 0 ? 'active' : 'locked', // locked | active | completed
    engagedMinutes: 0,
    quizScore: null,
  }))
}

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    tone: 'welcome',
    title: 'Your roadmap is ready',
    body: "We've built your first milestone. Start whenever you're ready.",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
]

export function buildInactivityNudge(goalLabel, milestoneTitle) {
  return {
    id: `nudge-${Date.now()}`,
    tone: 'nudge',
    title: "We noticed you've been away",
    body: `To keep your ${goalLabel} prep on track, let's get back to "${milestoneTitle}". Want to pick up where you left off?`,
    read: false,
    createdAt: Date.now(),
  }
}

export function buildRemedialNudge(milestoneTitle) {
  return {
    id: `remedial-${Date.now()}`,
    tone: 'remedial',
    title: 'Added a remedial task',
    body: `Your last assessment score suggests "${milestoneTitle}" needs another pass. We've added a review task before the next milestone unlocks.`,
    read: false,
    createdAt: Date.now(),
  }
}

export const BADGES = [
  {
    id: 'first-steps',
    label: 'First Steps',
    icon: '◎',
    desc: 'Complete your first milestone.',
    isEarned: (s) => s.roadmap.some((m) => m.status === 'completed'),
  },
  {
    id: 'on-a-roll',
    label: 'On a Roll',
    icon: '⟿',
    desc: 'Pass 3 assessments in a row.',
    isEarned: (s) => s.streak >= 3,
  },
  {
    id: 'halfway-there',
    label: 'Halfway There',
    icon: '◈',
    desc: 'Complete 50% of your roadmap.',
    isEarned: (s) => s.roadmap.length > 0 && s.roadmap.filter((m) => m.status === 'completed').length / s.roadmap.length >= 0.5,
  },
  {
    id: 'roadmap-master',
    label: 'Roadmap Master',
    icon: '✦',
    desc: 'Complete every milestone in your roadmap.',
    isEarned: (s) => s.roadmap.length > 0 && s.roadmap.every((m) => m.status === 'completed'),
  },
  {
    id: 'quick-learner',
    label: 'Quick Learner',
    icon: '▣',
    desc: 'Score 90% or higher on an assessment.',
    isEarned: (s) => s.roadmap.some((m) => (m.quizScore ?? 0) >= 90),
  },
  {
    id: 'consistent',
    label: 'Consistent',
    icon: '▤',
    desc: 'Log study time on 5 different days.',
    isEarned: (s) => s.timeSpentLog.filter((t) => t.actualMin > 0).length >= 5,
  },
]

// Stand-in peers for the community leaderboard until real multi-user
// accounts exist. Swap for an API call once the backend supports it.
export const MOCK_PEERS = [
  { id: 'p1', name: 'Ariana Costa', domain: 'full stack development', completed: 4, streak: 4 },
  { id: 'p2', name: 'Dev Patel', domain: 'aws solutions architect', completed: 3, streak: 2 },
  { id: 'p3', name: 'Wei Zhang', domain: 'data science', completed: 3, streak: 5 },
  { id: 'p4', name: 'Sofia Reyes', domain: 'full stack development', completed: 2, streak: 1 },
  { id: 'p5', name: 'Michael Obi', domain: 'networking', completed: 1, streak: 1 },
  { id: 'p6', name: 'Priya Nair', domain: 'aws solutions architect', completed: 2, streak: 3 },
]

export const QUIZ_BANK = [
  { id: 'q1', question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colorful Style Sheets'], answer: 0, category: 'remembering' },
  { id: 'q2', question: 'Which HTTP method is idempotent?', options: ['POST', 'GET', 'PATCH', 'CONNECT'], answer: 1, category: 'remembering' },
  { id: 'q3', question: 'In React, what triggers a re-render?', options: ['Changing a local variable', 'State or props change', 'Refreshing CSS', 'Calling console.log'], answer: 1, category: 'application' },
  { id: 'q4', question: 'What is the default port for HTTPS?', options: ['80', '21', '443', '8080'], answer: 2, category: 'easy' },
  { id: 'q5', question: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1, category: 'easy' },
]
// Builds a roadmap from AI-generated milestones (from /api/generate-roadmap)
// instead of the static COURSE_CATALOGUE. Same shape as buildRoadmap's output
// so the rest of the app (Dashboard, Roadmap, Assessment, etc.) doesn't care
// which source it came from.
export function buildRoadmapFromMilestones(milestones) {
  return milestones.map((m, i) => ({
    milestoneId: `m${i + 1}`,
    title: m.title,
    provider: m.provider,
    description: m.description || '',
    url: `https://www.google.com/search?q=${encodeURIComponent(`${m.title} ${m.provider}`)}`,
    estHours: m.estHours || 8,
    status: i === 0 ? 'active' : 'locked',
    engagedMinutes: 0,
    quizScore: null,
  }))
}