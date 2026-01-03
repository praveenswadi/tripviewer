#!/usr/bin/env node

/**
 * Test Environment Variables
 * Quick script to verify your .env file is loaded correctly
 */

import dotenv from 'dotenv'
dotenv.config()

console.log('\n🧪 Testing Environment Variables')
console.log('================================\n')

const requiredVars = {
  'FLICKR_API_KEY': process.env.FLICKR_API_KEY,
  'FLICKR_API_SECRET': process.env.FLICKR_API_SECRET,
  'VITE_APP_PIN': process.env.VITE_APP_PIN,
}

let allGood = true

for (const [name, value] of Object.entries(requiredVars)) {
  if (value) {
    // Show partial value for security
    const masked = value.length > 10 
      ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}`
      : `${value.substring(0, 3)}...`
    console.log(`✅ ${name}: ${masked}`)
  } else {
    console.log(`❌ ${name}: NOT SET`)
    allGood = false
  }
}

console.log('\n')

if (allGood) {
  console.log('🎉 All environment variables are set correctly!')
  console.log('\nYou can now run:')
  console.log('  npm run import:flickr "https://flickr.com/..." trip-id')
} else {
  console.log('❌ Some environment variables are missing!')
  console.log('\nTo fix:')
  console.log('1. Make sure .env file exists in project root')
  console.log('2. Run: npm run setup')
  console.log('3. Or manually create .env with:')
  console.log('   FLICKR_API_KEY=your_key')
  console.log('   FLICKR_API_SECRET=your_secret')
  console.log('   VITE_APP_PIN=123456')
  console.log('\nSee: WHERE_TO_STORE_SECRETS.md for help')
}

console.log('\n')

