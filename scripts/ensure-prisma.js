#!/usr/bin/env node

/**
 * Ensure Prisma client is generated before build
 * This script is run as a prebuild step to guarantee Prisma client exists
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const prismaClientPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '.prisma',
  'client',
  'index.js'
)

console.log('Checking Prisma client...')

if (!fs.existsSync(prismaClientPath)) {
  console.log('Prisma client not found. Generating...')
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    })
    console.log('✅ Prisma client generated successfully')
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message)
    process.exit(1)
  }
} else {
  console.log('✅ Prisma client already exists')
}

