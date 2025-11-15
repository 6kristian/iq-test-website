import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateScore } from '@/lib/scoring'
import questionsData from '@/data/questions.json'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      answers,
      totalTime,
      seed,
      questionIds,
    }: {
      answers: Array<{ questionId: string; choice: number; timeTaken: number }>
      totalTime: number
      seed: string
      questionIds: string[]
    } = body

    // Get full question data for scoring
    const questions = questionIds
      .map((id) => questionsData.find((q) => q.id === id))
      .filter((q) => q !== undefined) as Array<{
      id: string
      type: string
      difficulty: string
      correctAnswer: number
    }>

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found' },
        { status: 400 }
      )
    }

    // Calculate score
    const result = calculateScore(questions, answers, totalTime)

    // Save to database (userId is optional for guest users)
    const savedResult = await prisma.testResult.create({
      data: {
        userId: null, // Can be set if user authentication is added
        score: result.iqEstimate,
        percentile: result.percentile,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: totalTime,
        categoryScores: result.categoryBreakdown as any,
      },
    })

    return NextResponse.json({
      id: savedResult.id,
      ...result,
    })
  } catch (error) {
    console.error('Error saving result:', error)
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const whereClause = userId ? { userId: userId } : {}
    
    const results = await prisma.testResult.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

