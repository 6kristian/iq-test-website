import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Lazy import to avoid build-time errors
    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.testResult.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    // Parse JSON strings back to objects
    const parsedResult = {
      ...result,
      categoryScores: result.categoryScores ? JSON.parse(result.categoryScores) : {},
    }

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}

