'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import { calculateResultFromLocal } from '@/lib/utils'

interface TestResult {
  id?: string
  rawScore: number
  totalQuestions: number
  correctAnswers: number
  iqEstimate: number
  percentile: number
  categoryBreakdown: {
    [key: string]: {
      correct: number
      total: number
      percentage: number
    }
  }
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResult = async () => {
      const id = searchParams.get('id')
      
      if (id) {
        try {
          const response = await fetch(`/api/results/${id}`)
          if (response.ok) {
            const data = await response.json()
            // Convert database format to display format
            // categoryScores is already parsed by the API route
            setResult({
              id: data.id,
              rawScore: (data.correctAnswers / data.totalQuestions) * 100,
              totalQuestions: data.totalQuestions,
              correctAnswers: data.correctAnswers,
              iqEstimate: data.score,
              percentile: data.percentile,
              categoryBreakdown: typeof data.categoryScores === 'string' 
                ? JSON.parse(data.categoryScores) 
                : (data.categoryScores || {}),
            })
          }
        } catch (error) {
          console.error('Error loading result:', error)
        }
      } else {
        // Try to load from localStorage
        const localData = localStorage.getItem('testResult')
        if (localData) {
          try {
            const parsed = JSON.parse(localData)
            const calculated = calculateResultFromLocal(parsed)
            if (calculated) {
              setResult(calculated)
            }
          } catch (error) {
            console.error('Error calculating local result:', error)
          }
        }
      }
      setIsLoading(false)
    }

    loadResult()
  }, [searchParams])

  const handleDownloadPDF = () => {
    if (!result) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Title
    doc.setFontSize(24)
    doc.text('IQ Test Results', pageWidth / 2, 30, { align: 'center' })

    // Score
    doc.setFontSize(48)
    doc.text(result.iqEstimate.toString(), pageWidth / 2, 60, { align: 'center' })
    doc.setFontSize(16)
    doc.text(`Percentile: ${result.percentile.toFixed(1)}th`, pageWidth / 2, 75, {
      align: 'center',
    })

    // Details
    let yPos = 100
    doc.setFontSize(14)
    doc.text(`Correct Answers: ${result.correctAnswers} / ${result.totalQuestions}`, 20, yPos)
    yPos += 15
    doc.text(`Raw Score: ${result.rawScore.toFixed(1)}%`, 20, yPos)

    // Category breakdown
    if (result.categoryBreakdown && Object.keys(result.categoryBreakdown).length > 0) {
      yPos += 25
      doc.setFontSize(16)
      doc.text('Category Breakdown', 20, yPos)
      yPos += 15

      Object.entries(result.categoryBreakdown).forEach(([category, data]) => {
        if (yPos > pageHeight - 30) {
          doc.addPage()
          yPos = 20
        }
        doc.setFontSize(12)
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
        doc.text(
          `${categoryName}: ${data.correct}/${data.total} (${data.percentage.toFixed(1)}%)`,
          20,
          yPos
        )
        yPos += 15
      })
    }

    // Footer
    doc.setFontSize(10)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    doc.save('iq-test-results.pdf')
  }

  const handleSaveToLocal = () => {
    if (!result) return
    const data = {
      ...result,
      timestamp: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('savedResults') || '[]')
    existing.push(data)
    localStorage.setItem('savedResults', JSON.stringify(existing))
    alert('Result saved to local storage!')
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pattern: 'bg-blue-500',
      logic: 'bg-purple-500',
      spatial: 'bg-green-500',
      math: 'bg-yellow-500',
      memory: 'bg-pink-500',
    }
    return colors[category] || 'bg-gray-500'
  }

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 99) return 'Exceptional'
    if (percentile >= 95) return 'Very Superior'
    if (percentile >= 90) return 'Superior'
    if (percentile >= 75) return 'Above Average'
    if (percentile >= 50) return 'Average'
    if (percentile >= 25) return 'Below Average'
    return 'Low'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-2xl"
        >
          Loading results...
        </motion.div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center">
        <div className="text-white text-2xl">No results found</div>
      </div>
    )
  }

  const categories = Object.entries(result.categoryBreakdown || {})

  return (
    <div className="min-h-screen bg-gradient-blue-purple py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          {/* Score Display */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-8xl md:text-9xl font-bold bg-gradient-blue-purple bg-clip-text text-transparent mb-4"
            >
              {result.iqEstimate}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl text-gray-600 mb-2"
            >
              {getPercentileLabel(result.percentile)} Intelligence
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-500"
            >
              {result.percentile.toFixed(1)}th Percentile
            </motion.p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {result.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {result.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {result.rawScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Raw Score</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {categories.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Category Performance
              </h3>
              <div className="space-y-4">
                {categories.map(([category, data]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700 capitalize">
                        {category}
                      </span>
                      <span className="text-gray-600">
                        {data.correct}/{data.total} ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.percentage}%` }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className={`h-full ${getCategoryColor(category)} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {categories.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div>
                <h4 className="text-xl font-bold text-green-600 mb-4">Strengths</h4>
                <ul className="space-y-2">
                  {categories
                    .filter(([_, data]) => data.percentage >= 70)
                    .map(([category, data]) => (
                      <li key={category} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="capitalize">{category}</span>
                        <span className="text-gray-500">
                          ({data.percentage.toFixed(0)}%)
                        </span>
                      </li>
                    ))}
                  {categories.filter(([_, data]) => data.percentage >= 70).length === 0 && (
                    <li className="text-gray-500">No categories above 70%</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-600 mb-4">Areas to Improve</h4>
                <ul className="space-y-2">
                  {categories
                    .filter(([_, data]) => data.percentage < 60)
                    .map(([category, data]) => (
                      <li key={category} className="flex items-center gap-2">
                        <span className="text-red-500">→</span>
                        <span className="capitalize">{category}</span>
                        <span className="text-gray-500">
                          ({data.percentage.toFixed(0)}%)
                        </span>
                      </li>
                    ))}
                  {categories.filter(([_, data]) => data.percentage < 60).length === 0 && (
                    <li className="text-gray-500">All categories above 60%</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="bg-gradient-blue-purple text-white px-8 py-4 rounded-full font-bold shadow-lg"
            >
              Download PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveToLocal}
              className="bg-gray-200 text-gray-800 px-8 py-4 rounded-full font-bold"
            >
              Save Locally
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/test')}
              className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-lg"
            >
              Retake Test
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="bg-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold"
            >
              Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white text-2xl"
          >
            Loading results...
          </motion.div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}

