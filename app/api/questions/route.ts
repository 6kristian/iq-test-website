import { NextRequest, NextResponse } from 'next/server'
import questionsData from '@/data/questions.json'

// Force dynamic rendering - API routes should never be statically generated
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = parseInt(searchParams.get('count') || '35')
    const seed = searchParams.get('seed') || Math.random().toString()

    // Simple seeded random shuffle
    const shuffled = [...questionsData]
    let seedNum = 0
    for (let i = 0; i < seed.length; i++) {
      seedNum += seed.charCodeAt(i)
    }

    // Fisher-Yates shuffle with seed
    for (let i = shuffled.length - 1; i > 0; i--) {
      seedNum = (seedNum * 9301 + 49297) % 233280
      const j = Math.floor((seedNum / 233280) * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    // Remove correct answer from response (client shouldn't see it)
    const sanitized = selected.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }))

    return NextResponse.json({
      questions: sanitized,
      seed,
      total: sanitized.length,
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

