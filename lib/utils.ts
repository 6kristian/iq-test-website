import questionsData from '@/data/questions.json'
import { calculateScore } from './scoring'

export interface LocalTestData {
  answers: Array<{ questionId: string; choice: number; timeTaken: number }>
  totalTime: number
  questionIds: string[]
}

export function calculateResultFromLocal(data: LocalTestData) {
  const questions = data.questionIds
    .map((id) => questionsData.find((q) => q.id === id))
    .filter((q) => q !== undefined) as Array<{
    id: string
    type: string
    difficulty: string
    correctAnswer: number
  }>

  if (questions.length === 0) {
    return null
  }

  return calculateScore(questions, data.answers, data.totalTime)
}

