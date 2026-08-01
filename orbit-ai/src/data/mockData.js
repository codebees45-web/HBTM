// Central mock content. Swap this for real API calls once the backend
// (goal parsing, course catalogue, analytics) is ready.

// --- Gamification: XP, levels, and freeze-aware day streaks --------------
// Simple linear leveling: each level needs 100 more XP than the last
// (level 1: 0-99, level 2: 100-199, ...).
const XP_PER_LEVEL = 100

export function levelFromXp(xp) {
  const safeXp = Number(xp) || 0;
  return {
    level: Math.floor(safeXp / XP_PER_LEVEL) + 1,
    currentTierXp: safeXp % XP_PER_LEVEL,
    nextTierXp: XP_PER_LEVEL
  }
}

export function xpIntoLevel(xp) {
  return (xp || 0) % XP_PER_LEVEL
}

export function xpForNextLevel() {
  return XP_PER_LEVEL
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Walks backward day-by-day from today. A day counts toward the streak if
// it's in activityLog (real study activity) OR freezeLog (a streak freeze
// was spent to cover it). Stops at the first day that's neither.
export function computeDayStreak(activityLog = [], freezeLog = []) {
  const covered = new Set([...activityLog, ...freezeLog])
  let count = 0
  const cursor = new Date()
  // If today has no activity/freeze yet, don't break the streak on today —
  // start checking from yesterday instead, same as most habit trackers.
  if (!covered.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (covered.has(dateKey(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
}

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
  'programming languages': [
    { id: 'p1', title: 'Java Programming Masterclass', provider: 'Udemy', url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/', estHours: 40 },
    { id: 'p2', title: 'Python for Everybody', provider: 'Coursera', url: 'https://www.coursera.org/specializations/python', estHours: 32 },
    { id: 'p3', title: 'Data Structures & Algorithms', provider: 'Coursera', url: 'https://www.coursera.org/specializations/data-structures-algorithms', estHours: 25 },
  ],
  'entrepreneurship & startups': [
    { id: 'e1', title: 'How to Start a Startup', provider: 'Y Combinator / Stanford (free)', url: 'https://www.ycombinator.com/library/how-to-start-a-startup', estHours: 12 },
    { id: 'e2', title: 'Y Combinator Startup School', provider: 'Y Combinator', url: 'https://www.startupschool.org/', estHours: 20 },
    { id: 'e3', title: 'Entrepreneurship Specialization', provider: 'Coursera (Wharton)', url: 'https://www.coursera.org/specializations/wharton-entrepreneurship', estHours: 25 },
    { id: 'e4', title: 'The Lean Startup — core method', provider: 'Book + practice', url: 'https://theleanstartup.com/', estHours: 10 },
  ],
  'business & marketing': [
    { id: 'b1', title: 'Google Digital Marketing & E-commerce', provider: 'Coursera / Google Career Certificates', url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce', estHours: 35 },
    { id: 'b2', title: 'Foundations of Marketing', provider: 'Coursera (IE Business School)', url: 'https://www.coursera.org/learn/foundations-of-marketing', estHours: 15 },
    { id: 'b3', title: 'Business Strategy Specialization', provider: 'Coursera', url: 'https://www.coursera.org/specializations/business-strategy', estHours: 20 },
  ],
  'personal finance & investing': [
    { id: 'f1', title: 'Financial Markets', provider: 'Coursera (Yale)', url: 'https://www.coursera.org/learn/financial-markets-global', estHours: 18 },
    { id: 'f2', title: 'Personal & Family Financial Planning', provider: 'Coursera', url: 'https://www.coursera.org/learn/personal-family-financial-planning', estHours: 12 },
    { id: 'f3', title: 'Investing 101 — building a first portfolio', provider: 'Self-directed + practice', url: 'https://www.investor.gov/introduction-investing', estHours: 10 },
  ],
  'career & professional skills': [
    { id: 'k1', title: 'Google Project Management Certificate', provider: 'Coursera / Google Career Certificates', url: 'https://www.coursera.org/professional-certificates/google-project-management', estHours: 30 },
    { id: 'k2', title: 'High-Performance Collaboration: Leadership', provider: 'Coursera', url: 'https://www.coursera.org/learn/leading-teams', estHours: 12 },
    { id: 'k3', title: 'Successful Negotiation', provider: 'Coursera', url: 'https://www.coursera.org/learn/negotiation-skills', estHours: 10 },
  ],
  'creative & design skills': [
    { id: 'r1', title: 'Google UX Design Certificate', provider: 'Coursera / Google Career Certificates', url: 'https://www.coursera.org/professional-certificates/google-ux-design', estHours: 35 },
    { id: 'r2', title: 'Graphic Design Specialization', provider: 'Coursera (CalArts)', url: 'https://www.coursera.org/specializations/graphic-design', estHours: 25 },
    { id: 'r3', title: 'Video & Content Creation Basics', provider: 'Self-directed + practice', url: 'https://www.coursera.org/', estHours: 10 },
  ],
  'health & fitness': [
    { id: 'h1', title: 'Science of Exercise', provider: 'Coursera (Univ. of Colorado)', url: 'https://www.coursera.org/learn/science-of-exercise', estHours: 10 },
    { id: 'h2', title: 'Foundations of a Structured Training Plan', provider: 'Self-directed + practice', url: 'https://www.coursera.org/', estHours: 8 },
  ],
  'academic & exam prep': [
    { id: 'x1', title: 'Structured Exam Prep Plan', provider: 'Khan Academy / official exam guide', url: 'https://www.khanacademy.org/', estHours: 20 },
    { id: 'x2', title: 'Timed Practice Tests', provider: 'Self-directed + practice', url: 'https://www.khanacademy.org/', estHours: 12 },
  ],
  'personal development': [
    { id: 'z1', title: 'Learning How to Learn', provider: 'Coursera', url: 'https://www.coursera.org/learn/learning-how-to-learn', estHours: 8 },
    { id: 'z2', title: 'Goal-setting and habit design', provider: 'Self-directed + practice', url: 'https://www.coursera.org/', estHours: 6 },
  ],
};

export function keywordToDomain(goalText) {
  const text = goalText.toLowerCase();
  if (text.includes('full stack') || text.includes('web dev')) return 'full stack development';
  if (text.includes('aws') || text.includes('solutions architect') || text.includes('cloud')) return 'aws solutions architect';
  if (text.includes('data science') || text.includes('machine learning') || text.includes(' ml')) return 'data science';
  if (text.includes('network') || text.includes('ccna') || text.includes('cisco')) return 'networking';
  if (text.includes('java') || text.includes('python') || text.includes('c++') || text.includes('golang') || text.includes('rust') || text.includes('learn a language') || text.includes('programming language')) return 'programming languages';
  if (text.includes('startup') || text.includes('entrepreneur') || text.includes('found a company') || text.includes('start a business') || text.includes('start my own') || text.includes('launch my') || text.includes('mvp') || text.includes('fundrais') || text.includes('pitch deck')) return 'entrepreneurship & startups';
  if (text.includes('market') || text.includes('sales') || text.includes('brand') || text.includes('business strategy') || text.includes('e-commerce') || text.includes('ecommerce')) return 'business & marketing';
  if (text.includes('invest') || text.includes('budget') || text.includes('financ') || text.includes('stock') || text.includes('retirement') || text.includes('saving money')) return 'personal finance & investing';
  if (text.includes('promot') || text.includes('manager') || text.includes('leadership') || text.includes('project management') || text.includes('negotiat') || text.includes('career change') || text.includes('switch career') || text.includes('job-ready') || text.includes('job ready') || text.includes('interview')) return 'career & professional skills';
  if (text.includes('design') || text.includes('ux') || text.includes('ui ') || text.includes('graphic') || text.includes('video edit') || text.includes('content creat') || text.includes('writing') || text.includes('photograph')) return 'creative & design skills';
  if (text.includes('fitness') || text.includes('workout') || text.includes('exercise') || text.includes('gym') || text.includes('weight loss') || text.includes('marathon')) return 'health & fitness';
  if (text.includes('exam') || text.includes('sat') || text.includes('gre') || text.includes('gmat') || text.includes('board exam') || text.includes('entrance test')) return 'academic & exam prep';
  return 'personal development'; // generous catch-all instead of forcing a tech default
}

export function buildRoadmap(domain) {
  const courses = COURSE_CATALOGUE[domain] || COURSE_CATALOGUE['full stack development'];
  return courses.map((course, i) => ({
    milestoneId: `m${i + 1}`,
    title: course.title,
    provider: course.provider,
    url: course.url,
    estHours: course.estHours,
    status: i === 0 ? 'active' : 'locked', // locked | active | completed
    engagedMinutes: 0,
    quizScore: null,
    dueDate: null,
    notes: '',
  }));
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
];

export function buildInactivityNudge(goalLabel, milestoneTitle) {
  return {
    id: `nudge-${Date.now()}`,
    tone: 'nudge',
    title: "We noticed you've been away",
    body: `To keep your ${goalLabel} prep on track, let's get back to "${milestoneTitle}". Want to pick up where you left off?`,
    read: false,
    createdAt: Date.now(),
  };
}

export function buildRemedialNudge(milestoneTitle) {
  return {
    id: `remedial-${Date.now()}`,
    tone: 'remedial',
    title: 'Added a remedial task',
    body: `Your last assessment score suggests "${milestoneTitle}" needs another pass. We've added a review task before the next milestone unlocks.`,
    read: false,
    createdAt: Date.now(),
  };
}

export function buildDueDateReminder(milestoneTitle, status) {
  return {
    id: `due-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tone: status === 'overdue' ? 'remedial' : 'nudge',
    title: status === 'overdue' ? 'Milestone overdue' : 'Milestone due soon',
    body:
      status === 'overdue'
        ? `"${milestoneTitle}" is past its due date. Reschedule it or make time to finish it up.`
        : `"${milestoneTitle}" is due within the next 3 days.`,
    read: false,
    createdAt: Date.now(),
  };
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
  {
    id: 'level-5',
    label: 'Level 5',
    icon: '⬢',
    desc: 'Reach level 5 by earning XP.',
    isEarned: (s) => levelFromXp(s.xp) >= 5,
  },
  {
    id: 'streak-saver',
    label: 'Streak Saver',
    icon: '❄',
    desc: 'Use a streak freeze to protect your streak.',
    isEarned: (s) => (s.freezeLog || []).length > 0,
  },
];

// Stand-in peers for the community leaderboard until real multi-user
// accounts exist. Swap for an API call once the backend supports it.
export const MOCK_PEERS = [
  { id: 'p1', name: 'Ariana Costa', domain: 'full stack development', completed: 4, streak: 4 },
  { id: 'p2', name: 'Dev Patel', domain: 'aws solutions architect', completed: 3, streak: 2 },
  { id: 'p3', name: 'Wei Zhang', domain: 'data science', completed: 3, streak: 5 },
  { id: 'p4', name: 'Sofia Reyes', domain: 'full stack development', completed: 2, streak: 1 },
  { id: 'p5', name: 'Michael Obi', domain: 'networking', completed: 1, streak: 1 },
  { id: 'p6', name: 'Priya Nair', domain: 'aws solutions architect', completed: 2, streak: 3 },
  { id: 'p7', name: 'Lucas Ferreira', domain: 'entrepreneurship & startups', completed: 3, streak: 6 },
  { id: 'p8', name: 'Amara Okafor', domain: 'personal finance & investing', completed: 2, streak: 4 },
];

export const QUIZ_BANK = [
  { id: 'q1', question: 'How easily can you summarize the core concept you just explored?', options: ['I can teach it to someone else', 'I understand it but need my notes', 'I still have some major gaps', 'It hasn’t clicked yet'], answer: 0, category: 'remembering' },
  { id: 'q2', question: 'Where does this new habit or skill fit into your daily routine?', options: ['I haven’t thought about it yet', 'Morning routine', 'During my commute or breaks', 'Evening wind-down'], answer: 1, category: 'application' },
  { id: 'q3', question: 'What is the biggest source of friction preventing you from integrating this?', options: ['Lack of time', 'Lack of energy/focus', 'Fear of failure', 'I don’t feel any friction'], answer: 3, category: 'application' },
  { id: 'q4', question: 'How does mastering this step change your identity or self-image?', options: ['It’s a minor stepping stone', 'It proves I can be disciplined', 'It directly aligns with my future self', 'I’m not sure yet'], answer: 2, category: 'application' },
  { id: 'q5', question: 'Are you ready to move on to the next milestone?', options: ['Yes, let’s go', 'I want to review this one more time', 'I need a break first', 'I need to ask the Mentor a question'], answer: 0, category: 'easy' },
];

// Builds a roadmap from AI-generated milestones (from /api/generate-roadmap)
// instead of the static COURSE_CATALOGUE.
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
  }));
}