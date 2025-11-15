/**
 * Optional script to seed questions into the database
 * Currently questions are stored in JSON, but this can be used
 * if you want to migrate to database storage
 */

import { PrismaClient } from '@prisma/client'
import questionsData from '../data/questions.json'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding questions...')
  
  // Note: This requires the Question model to be in the schema
  // Uncomment and modify if you want to use database storage for questions
  
  // for (const question of questionsData) {
  //   await prisma.question.create({
  //     data: {
  //       id: question.id,
  //       type: question.type,
  //       question: question.question,
  //       imageUrl: null,
  //       options: question.options as any,
  //       correctAnswer: question.correctAnswer,
  //       difficulty: question.difficulty,
  //       explanation: question.explanation || null,
  //     },
  //   })
  // }
  
  console.log('Questions seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

