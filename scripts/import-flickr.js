#!/usr/bin/env node

/**
 * Flickr Album Importer
 * 
 * Fetches photos from a Flickr album and generates trip JSON files
 * 
 * Usage:
 *   node scripts/import-flickr.js <album_url> <trip_id> [options]
 * 
 * Example:
 *   node scripts/import-flickr.js "https://www.flickr.com/gp/praveenswadi/6mobW9547j" mexico-city-2024
 * 
 * Environment Variables:
 *   FLICKR_API_KEY - Your Flickr API key (get from https://www.flickr.com/services/apps/create/)
 */

// Load environment variables from .env file
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const FLICKR_API_KEY = process.env.FLICKR_API_KEY || ''
const FLICKR_API_SECRET = process.env.FLICKR_API_SECRET || ''
const FLICKR_API_BASE = 'https://api.flickr.com/services/rest/'

// Parse command line arguments
const args = process.argv.slice(2)
const albumUrl = args[0]
const tripId = args[1]
const tripTitle = args[2] || 'Photo Trip'
const tripDescription = args[3] || ''
const photoDuration = parseInt(args[4] || '5') // seconds per photo

if (!albumUrl || !tripId) {
  console.error('Usage: node scripts/import-flickr.js <album_url> <trip_id> [title] [description] [duration_per_photo]')
  console.error('\nExample:')
  console.error('  node scripts/import-flickr.js "https://www.flickr.com/gp/user/albumid" mexico-city-2024 "Mexico City" "Our trip" 5')
  console.error('\nEnvironment Variables:')
  console.error('  FLICKR_API_KEY - Required. Get from https://www.flickr.com/services/apps/create/')
  console.error('  FLICKR_API_SECRET - Optional for public albums, required for private')
  process.exit(1)
}

if (!FLICKR_API_KEY) {
  console.error('ERROR: FLICKR_API_KEY environment variable not set!')
  console.error('\nGet your API credentials from: https://www.flickr.com/services/apps/create/')
  console.error('Then set them:')
  console.error('  export FLICKR_API_KEY=your_key_here')
  console.error('  export FLICKR_API_SECRET=your_secret_here')
  process.exit(1)
}

// Note: API Secret is optional for public photo reading
// but required for authenticated operations
if (!FLICKR_API_SECRET) {
  console.warn('\n⚠️  Warning: FLICKR_API_SECRET not set.')
  console.warn('For public albums, the API Key alone may work.')
  console.warn('If you get authentication errors, set the secret:\n')
  console.warn('  export FLICKR_API_SECRET=your_secret_here\n')
}

/**
 * Extract photoset ID and user ID from Flickr album URL
 */
function parseFlickrUrl(url) {
  // Flickr album URLs can be:
  // https://www.flickr.com/photos/user/albums/72157720123456789 (public)
  // https://www.flickr.com/gp/user/albumid (guest pass - private)
  
  const patterns = [
    /flickr\.com\/photos\/([^\/]+)\/albums\/(\d+)/,
    /flickr\.com\/gp\/([^\/]+)\/([^\/\?]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const isGuestPass = url.includes('/gp/')
      return {
        userId: match[1],
        photosetId: match[2],
        isGuestPass: isGuestPass
      }
    }
  }
  
  throw new Error('Could not parse Flickr album URL. Supported formats:\n' +
    '  - https://www.flickr.com/photos/username/albums/12345\n' +
    '  - https://www.flickr.com/gp/username/albumid')
}

/**
 * Resolve Flickr username to user NSID
 */
async function getUserNSID(username) {
  const params = new URLSearchParams({
    method: 'flickr.people.findByUsername',
    api_key: FLICKR_API_KEY,
    username: username,
    format: 'json',
    nojsoncallback: '1'
  })
  
  const url = `${FLICKR_API_BASE}?${params}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Flickr API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.stat !== 'ok') {
    throw new Error(`Could not find Flickr user "${username}": ${data.message || 'Unknown error'}`)
  }
  
  return data.user.nsid
}

/**
 * Fetch photos from Flickr album using API
 */
async function fetchFlickrPhotos(photosetId, userId, isGuestPass = false) {
  // Always try to resolve username to NSID first (handles both usernames and NSIDs)
  let userNSID = userId
  
  // If userId doesn't look like an NSID (format: 12345678@N01), try to resolve it
  if (!userId.includes('@')) {
    console.log('   Resolving username to user ID...')
    try {
      userNSID = await getUserNSID(userId)
      console.log(`   Resolved to NSID: ${userNSID}`)
    } catch (error) {
      console.error(`   ⚠️  Could not resolve username. Trying with provided ID...`)
      userNSID = userId // Fallback to original
    }
  }
  
  const params = new URLSearchParams({
    method: 'flickr.photosets.getPhotos',
    api_key: FLICKR_API_KEY,
    photoset_id: photosetId,
    user_id: userNSID,
    extras: 'description,date_taken,url_o,url_k,url_h,url_l,url_c',
    format: 'json',
    nojsoncallback: '1'
  })
  
  const url = `${FLICKR_API_BASE}?${params}`
  
  console.log('Fetching photos from Flickr...')
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Flickr API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.stat !== 'ok') {
    let errorMsg = data.message || 'Unknown error'
    
    if (isGuestPass) {
      errorMsg += '\n\n💡 This is a private album with a guest pass. Options:\n' +
        '   1. Make the album PUBLIC in Flickr settings (easiest)\n' +
        '   2. Use OAuth authentication (complex - requires user approval)\n' +
        '   3. Manually download photos and use local files\n\n' +
        '   To make album public:\n' +
        '   - Go to https://www.flickr.com/photos/organize\n' +
        '   - Select the album\n' +
        '   - Click "Privacy" → "Public"\n' +
        '   - Then use the public album URL instead'
    }
    
    throw new Error(`Flickr API error: ${errorMsg}`)
  }
  
  return data.photoset.photo
}

/**
 * Get best available photo URL from Flickr photo object
 */
function getBestPhotoUrl(photo) {
  // Try URLs in order of preference (highest quality first)
  if (photo.url_o) return photo.url_o // Original
  if (photo.url_k) return photo.url_k // 2048px
  if (photo.url_h) return photo.url_h // 1600px
  if (photo.url_l) return photo.url_l // 1024px
  if (photo.url_c) return photo.url_c // 800px
  
  // Fallback: construct URL manually
  return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`
}

/**
 * Generate trip JSON from Flickr photos
 */
function generateTripJson(photos, tripId, tripTitle, tripDescription, photoDuration) {
  const totalDuration = photos.length * photoDuration
  const coverImage = photos.length > 0 ? getBestPhotoUrl(photos[0]) : ''
  
  const tripPhotos = photos.map((photo, index) => ({
    id: `photo-${String(index + 1).padStart(3, '0')}`,
    url: getBestPhotoUrl(photo),
    caption: photo.title || `Photo ${index + 1}`,
    timestamp: photo.datetaken || new Date().toISOString()
  }))
  
  return {
    id: tripId,
    title: tripTitle,
    description: tripDescription,
    coverImage: coverImage,
    createdDate: new Date().toISOString().split('T')[0],
    totalDuration: totalDuration,
    photos: tripPhotos,
    photoTimeline: {},
    audioTimeline: {
      enabled: false,
      audioUrl: null,
      segments: []
    },
    backgroundMusic: {
      enabled: false,
      trackId: 'ambient-travel-1',
      volume: 0.3
    }
  }
}

/**
 * Update trips index
 */
function updateTripsIndex(tripData, dataDir) {
  const indexPath = path.join(dataDir, 'trips.json')
  let index = { trips: [] }
  
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  }
  
  // Remove existing entry with same ID
  index.trips = index.trips.filter(t => t.id !== tripData.id)
  
  // Add new entry
  index.trips.push({
    id: tripData.id,
    title: tripData.title,
    description: tripData.description,
    coverImage: tripData.coverImage,
    photoCount: tripData.photos.length,
    duration: tripData.totalDuration,
    hasAudio: tripData.audioTimeline.enabled,
    createdDate: tripData.createdDate
  })
  
  return index
}

/**
 * Main import function
 */
async function importFlickrAlbum() {
  try {
    console.log('\n🎨 Flickr Album Importer')
    console.log('========================\n')
    
    // Parse URL
    console.log('📍 Parsing Flickr URL...')
    const { userId, photosetId, isGuestPass } = parseFlickrUrl(albumUrl)
    console.log(`   User: ${userId}`)
    console.log(`   Album: ${photosetId}`)
    if (isGuestPass) {
      console.log(`   ⚠️  Guest Pass URL (Private Album)\n`)
    } else {
      console.log()
    }
    
    // Fetch photos
    const photos = await fetchFlickrPhotos(photosetId, userId, isGuestPass)
    console.log(`✅ Found ${photos.length} photos\n`)
    
    if (photos.length === 0) {
      console.error('❌ No photos found in album')
      process.exit(1)
    }
    
    // Generate trip JSON
    console.log('📝 Generating trip data...')
    const tripData = generateTripJson(photos, tripId, tripTitle, tripDescription, photoDuration)
    console.log(`   Trip ID: ${tripId}`)
    console.log(`   Title: ${tripTitle}`)
    console.log(`   Photos: ${tripData.photos.length}`)
    console.log(`   Duration: ${Math.floor(tripData.totalDuration / 60)}m ${tripData.totalDuration % 60}s\n`)
    
    // Determine output directory (use private-data by default)
    const dataDir = path.join(path.dirname(__dirname), 'private-data')
    const tripsDir = path.join(dataDir, 'trips')
    
    // Create directories if they don't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(tripsDir)) {
      fs.mkdirSync(tripsDir, { recursive: true })
    }
    
    // Write trip JSON
    const tripPath = path.join(tripsDir, `${tripId}.json`)
    fs.writeFileSync(tripPath, JSON.stringify(tripData, null, 2))
    console.log(`✅ Saved trip data: ${tripPath}`)
    
    // Update index
    const index = updateTripsIndex(tripData, dataDir)
    const indexPath = path.join(dataDir, 'trips.json')
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
    console.log(`✅ Updated trips index: ${indexPath}`)
    
    console.log('\n🎉 Import complete!\n')
    console.log('Next steps:')
    console.log('1. Review the generated files in private-data/')
    console.log('2. Copy to public/data/ when ready to use')
    console.log('3. Start dev server: npm run dev')
    console.log('4. Open http://localhost:3000\n')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nStack trace:', error.stack)
    process.exit(1)
  }
}

// Run import
importFlickrAlbum()

