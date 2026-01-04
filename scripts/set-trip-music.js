#!/usr/bin/env node

/**
 * Set or update background music for a trip
 * Usage: node scripts/set-trip-music.js <trip-id> <track-id> [enabled]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse arguments
const [tripId, trackId, enabled = 'true'] = process.argv.slice(2);

if (!tripId || !trackId) {
  console.error('❌ Usage: node scripts/set-trip-music.js <trip-id> <track-id> [enabled]');
  console.error('\nExample:');
  console.error('  node scripts/set-trip-music.js mexico-city-2024 carefree true');
  console.error('\nAvailable tracks:');
  
  // Show available tracks
  const tracksPath = path.join(__dirname, '../public/audio/music/tracks.json');
  if (fs.existsSync(tracksPath)) {
    const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf-8'));
    tracks.tracks.forEach(track => {
      console.error(`  - ${track.id}: ${track.title} (${track.mood}) - ${track.description}`);
    });
  }
  process.exit(1);
}

// Paths
const privateDataPath = path.join(__dirname, '../private-data/trips', `${tripId}.json`);
const publicDataPath = path.join(__dirname, '../public/data/trips', `${tripId}.json`);

// Check if trip exists
if (!fs.existsSync(privateDataPath)) {
  console.error(`❌ Trip not found: ${tripId}`);
  console.error(`   Looking for: ${privateDataPath}`);
  process.exit(1);
}

// Verify track exists
const tracksPath = path.join(__dirname, '../public/audio/music/tracks.json');
const tracks = JSON.parse(fs.readFileSync(tracksPath, 'utf-8'));
const track = tracks.tracks.find(t => t.id === trackId);

if (!track) {
  console.error(`❌ Track not found: ${trackId}`);
  console.error('\nAvailable tracks:');
  tracks.tracks.forEach(t => {
    console.error(`  - ${t.id}: ${t.title}`);
  });
  process.exit(1);
}

// Load trip data
const tripData = JSON.parse(fs.readFileSync(privateDataPath, 'utf-8'));

// Update music configuration
tripData.backgroundMusic = {
  enabled: enabled === 'true',
  trackId: trackId,
  volume: 0.3
};

// Save to private-data
fs.writeFileSync(privateDataPath, JSON.stringify(tripData, null, 2));
console.log(`✅ Updated ${tripId} with music: ${track.title}`);
console.log(`   Track: ${trackId}`);
console.log(`   Enabled: ${enabled}`);

// Also update public/data if it exists
if (fs.existsSync(publicDataPath)) {
  fs.writeFileSync(publicDataPath, JSON.stringify(tripData, null, 2));
  console.log(`✅ Synced to public/data/`);
}

console.log('\n📝 Next steps:');
console.log('1. Make sure the music file exists: public/audio/music/' + track.file);
console.log('2. Test locally: npm run test:local');
console.log('3. Deploy to Vercel: vercel --prod');

