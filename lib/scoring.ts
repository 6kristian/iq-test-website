export interface Question {
  id: string
  type: string
  difficulty: string
  correctAnswer: number
}

export interface Answer {
  questionId: string
  choice: number
  timeTaken: number
}

export interface CategoryBreakdown {
  [key: string]: {
    correct: number
    total: number
    percentage: number
  }
}

export interface TestResult {
  rawScore: number
  totalQuestions: number
  correctAnswers: number
  iqEstimate: number
  percentile: number
  categoryBreakdown: CategoryBreakdown
}

// IQ score conversion table (simplified)
// Based on raw score out of total questions
const IQ_CONVERSION: { [key: number]: number } = {
  100: 160, 99: 158, 98: 156, 97: 154, 96: 152, 95: 150,
  94: 148, 93: 146, 92: 144, 91: 142, 90: 140,
  89: 138, 88: 136, 87: 134, 86: 132, 85: 130,
  84: 128, 83: 126, 82: 124, 81: 122, 80: 120,
  79: 118, 78: 116, 77: 114, 76: 112, 75: 110,
  74: 108, 73: 106, 72: 104, 71: 102, 70: 100,
  69: 98, 68: 96, 67: 94, 66: 92, 65: 90,
  64: 88, 63: 86, 62: 84, 61: 82, 60: 80,
  59: 78, 58: 76, 57: 74, 56: 72, 55: 70,
  50: 65, 45: 60, 40: 55, 30: 45, 20: 35, 10: 25, 0: 15
}

// Percentile conversion
const PERCENTILE_CONVERSION: { [key: number]: number } = {
  100: 99.9, 99: 99.5, 98: 98, 97: 97, 96: 96, 95: 95,
  94: 94, 93: 93, 92: 92, 91: 91, 90: 90,
  89: 89, 88: 88, 87: 87, 86: 86, 85: 85,
  84: 84, 83: 83, 82: 82, 81: 81, 80: 80,
  79: 79, 78: 78, 77: 77, 76: 76, 75: 75,
  74: 74, 73: 73, 72: 72, 71: 71, 70: 70,
  69: 69, 68: 68, 67: 67, 66: 66, 65: 65,
  64: 64, 63: 63, 62: 62, 61: 61, 60: 60,
  59: 59, 58: 58, 57: 57, 56: 56, 55: 55,
  50: 50, 45: 45, 40: 40, 30: 30, 20: 20, 10: 10, 0: 1
}

function getClosestKey(score: number, table: { [key: number]: number }): number {
  const keys = Object.keys(table).map(Number).sort((a, b) => b - a)
  for (const key of keys) {
    if (score >= key) return key
  }
  return 0
}

export function calculateScore(
  questions: Question[],
  answers: Answer[],
  totalTime: number
): TestResult {
  let correctAnswers = 0
  const categoryBreakdown: CategoryBreakdown = {}

  // Initialize category breakdown
  questions.forEach((q) => {
    if (!categoryBreakdown[q.type]) {
      categoryBreakdown[q.type] = { correct: 0, total: 0, percentage: 0 }
    }
    categoryBreakdown[q.type].total++
  })

  // Check answers
  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    const isCorrect = answer.choice === question.correctAnswer
    if (isCorrect) {
      correctAnswers++
      categoryBreakdown[question.type].correct++
    }
  })

  // Calculate percentages for each category
  Object.keys(categoryBreakdown).forEach((category) => {
    const cat = categoryBreakdown[category]
    cat.percentage = cat.total > 0 ? (cat.correct / cat.total) * 100 : 0
  })

  const totalQuestions = questions.length
  const rawScore = (correctAnswers / totalQuestions) * 100
  const roundedScore = Math.round(rawScore)

  // Get IQ estimate
  const closestKey = getClosestKey(roundedScore, IQ_CONVERSION)
  const iqEstimate = IQ_CONVERSION[closestKey] || 100

  // Get percentile
  const percentileKey = getClosestKey(roundedScore, PERCENTILE_CONVERSION)
  const percentile = PERCENTILE_CONVERSION[percentileKey] || 50

  return {
    rawScore: roundedScore,
    totalQuestions,
    correctAnswers,
    iqEstimate,
    percentile,
    categoryBreakdown,
  }
}

