'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleStart = () => {
    router.push('/test')
  }

  return (
    <div className="min-h-screen bg-gradient-blue-purple flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-lg"
        >
          IQ Test
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl md:text-2xl text-white/90 mb-8"
        >
          Measure Your Intelligence
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <div className="grid md:grid-cols-3 gap-6 text-white mb-8">
            <div>
              <div className="text-3xl font-bold mb-2">30-40</div>
              <div className="text-sm opacity-90">Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">~30 min</div>
              <div className="text-sm opacity-90">Time Limit</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5</div>
              <div className="text-sm opacity-90">Categories</div>
            </div>
          </div>

          <div className="text-left text-white/80 space-y-2 mb-6">
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Pattern Recognition
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Logic & Reasoning
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Spatial Reasoning
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Mathematical Reasoning
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Memory Tests
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={handleStart}
          className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
        >
          {isHovered ? '🚀 Start Test' : 'Start Your IQ Test'}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-white/70 mt-6 text-sm"
        >
          No account required • Instant results • Free to use
        </motion.p>
      </motion.div>
    </div>
  )
}

