#!/usr/bin/env node

/**
 * Enable music for all trips
 * Usage: node scripts/enable-music-all.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateDataDir = path.join(__dirname, '../private-data/trips');
const publicDataDir = path.join(__dirname, '../public/data/trips');

console.log('🎵 Enabling music for all trips...\n');

// Read all trip files
const files = fs.readdirSync(privateDataDir).filter(f => f.endsWith('.json'));

let updatedCount = 0;

files.forEach(file => {
  const tripPath = path.join(privateDataDir, file);
  const tripData = JSON.parse(fs.readFileSync(tripPath, 'utf-8'));
  
  // Check if music is already configured and enabled
  if (tripData.backgroundMusic?.enabled) {
    console.log(`✓ ${tripData.title || file} - Already has music enabled`);
    return;
  }
  
  // Enable music with default settings
  tripData.backgroundMusic = {
    enabled: true,
    volume: 0.3
  };
  
  // Save to private-data
  fs.writeFileSync(tripPath, JSON.stringify(tripData, null, 2));
  
  // Also update public/data if it exists
  const publicPath = path.join(publicDataDir, file);
  if (fs.existsSync(publicPath)) {
    fs.writeFileSync(publicPath, JSON.stringify(tripData, null, 2));
  }
  
  console.log(`✅ ${tripData.title || file} - Music enabled`);
  updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   Total trips: ${files.length}`);
console.log(`   Updated: ${updatedCount}`);
console.log(`   Already enabled: ${files.length - updatedCount}`);

console.log('\n🎵 All trips now have music enabled!');
console.log('\n📝 Next steps:');
console.log('1. Test locally: npm run test:local');
console.log('2. Deploy to Vercel: vercel --prod');

