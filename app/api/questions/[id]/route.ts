import { NextRequest, NextResponse } from 'next/server'
import questionsData from '@/data/questions.json'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = questionsData.find((q) => q.id === params.id)
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Remove correct answer
    const sanitized = {
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
    }

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

