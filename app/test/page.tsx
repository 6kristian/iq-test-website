'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import questionsData from '@/data/questions.json'

interface Question {
  id: string
  type: string
  question: string
  options: string[]
  difficulty: string
}

interface Answer {
  questionId: string
  choice: number
  timeTaken: number
}

export default function TestPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60) // 30 minutes total
  const [isLoading, setIsLoading] = useState(true)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Anti-cheat: Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      setWarnings((prev) => [...prev, 'Copying is disabled during the test'])
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      setWarnings((prev) => [...prev, 'Pasting is disabled during the test'])
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
        setWarnings((prev) => [...prev, 'Developer tools are disabled'])
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1)
        setWarnings((prev) => [
          ...prev,
          `Warning: Tab switch detected (${tabSwitches + 1})`,
        ])
      }
    }

    const handleBlur = () => {
      setWarnings((prev) => [...prev, 'Warning: Window lost focus'])
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [tabSwitches])

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const count = 35 // 30-40 questions
        const seed = Math.random().toString()
        const response = await fetch(`/api/questions?count=${count}&seed=${seed}`)
        const data = await response.json()
        setQuestions(data.questions)
        setIsLoading(false)
        setStartTime(Date.now())
        setQuestionStartTime(Date.now())
      } catch (error) {
        console.error('Error loading questions:', error)
        router.push('/')
      }
    }

    loadQuestions()
  }, [router])

  // Timer countdown
  useEffect(() => {
    if (isLoading || questions.length === 0) return

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLoading, questions.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
  }

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
    const currentQuestion = questions[currentIndex]

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        choice: selectedAnswer,
        timeTaken,
      },
    ])

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setQuestionStartTime(Date.now())
    } else {
      handleFinish()
    }
  }, [selectedAnswer, currentIndex, questions, questionStartTime])

  const handleFinish = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Add final answer if selected
    if (selectedAnswer !== null && currentIndex < questions.length) {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
      const currentQuestion = questions[currentIndex]
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          choice: selectedAnswer,
          timeTaken,
        },
      ])
    }

    // Wait a bit for state to update, then submit
    setTimeout(async () => {
      const totalTime = Math.floor((Date.now() - startTime) / 1000)
      const questionIds = questions.map((q) => q.id)
      const finalAnswers = answers

      // Add current answer if not already added
      if (
        selectedAnswer !== null &&
        currentIndex < questions.length &&
        !finalAnswers.some((a) => a.questionId === questions[currentIndex].id)
      ) {
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
        finalAnswers.push({
          questionId: questions[currentIndex].id,
          choice: selectedAnswer,
          timeTaken,
        })
      }

      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: finalAnswers,
            totalTime,
            seed: 'test',
            questionIds,
          }),
        })

        const result = await response.json()
        router.push(`/results?id=${result.id}`)
      } catch (error) {
        console.error('Error submitting test:', error)
        // Still navigate to results with local data
        const resultData = {
          answers: finalAnswers,
          totalTime,
          questionIds,
        }
        localStorage.setItem('testResult', JSON.stringify(resultData))
        router.push('/results')
      }
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-2xl"
        >
          Loading questions...
        </motion.div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center">
        <div className="text-white text-2xl">No questions available</div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-blue-purple test-mode">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold">
            Question {currentIndex + 1} / {questions.length}
          </div>
          <div className="text-white font-bold text-xl">{formatTime(timeRemaining)}</div>
        </div>
        <div className="max-w-4xl mx-auto mt-2">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mt-4 px-4"
          >
            <div className="bg-yellow-500/90 text-white p-3 rounded-lg">
              {warnings[warnings.length - 1]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-lg text-gray-700">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className={`px-8 py-3 rounded-full font-bold text-lg ${
                  selectedAnswer === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-blue-purple text-white shadow-lg'
                }`}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

