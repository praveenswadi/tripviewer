#!/usr/bin/env node

/**
 * Flickr Album Scraper (Works with Private Albums!)
 * 
 * Scrapes photos directly from Flickr guest pass URLs
 * No API key needed! Works with private albums.
 * 
 * Usage:
 *   node scripts/import-flickr-scrape.js <guest_pass_url> <trip_id> [title] [description] [duration_per_photo]
 * 
 * Example:
 *   node scripts/import-flickr-scrape.js "https://www.flickr.com/gp/user/album" mexico-city-2024 "Mexico City" "Trip description" 5
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse command line arguments
const args = process.argv.slice(2)
const guestPassUrl = args[0]
const tripId = args[1]
const tripTitle = args[2] || 'Photo Trip'
const tripDescription = args[3] || ''
const photoDuration = parseInt(args[4] || '5')
const DEBUG = process.env.DEBUG === 'true' || args.includes('--debug')

if (!guestPassUrl || !tripId) {
  console.error('Usage: node scripts/import-flickr-scrape.js <guest_pass_url> <trip_id> [title] [description] [duration_per_photo]')
  console.error('\nExample:')
  console.error('  node scripts/import-flickr-scrape.js "https://www.flickr.com/gp/user/album" mexico-city-2024 "Mexico City" "Trip" 5')
  console.error('\n✨ This works with PRIVATE albums via guest pass!')
  console.error('   No API key needed!')
  process.exit(1)
}

/**
 * Fetch and parse Flickr guest pass page using real browser
 */
async function scrapeFlickrGuestPass(url) {
  console.log('🌐 Launching browser...')
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    console.log('📡 Loading guest pass page...')
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    })
    
    // Wait for initial content
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('📄 Collecting photos from all pages...')
    
    const allPhotos = []
    let pageNum = 1
    let hasNextPage = true
    
    while (hasNextPage && pageNum <= 50) { // Safety limit of 50 pages
      console.log(`   📄 Processing page ${pageNum}...`)
      
      // Scroll THOROUGHLY to load ALL lazy images on current page
      let previousCount = 0
      let currentCount = 0
      let scrolls = 0
      let unchangedCount = 0 // Track how many times count hasn't changed
      const maxUnchanged = 3 // Give it 3 chances even if count doesn't change
      const maxScrolls = 20 // More generous scroll limit
      
      console.log(`      Scrolling to load all images (this may take a minute)...`)
      
      do {
        previousCount = currentCount
        
        // Scroll to bottom
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })
        
        // Wait longer for images to load (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        currentCount = await page.evaluate(() => {
          // Count photo-link elements (includes both photos and videos)
          return document.querySelectorAll('.photo-link, a[data-track="photo-click"]').length
        })
        
        scrolls++
        
        if (currentCount === previousCount) {
          unchangedCount++
        } else {
          unchangedCount = 0 // Reset if we got new images
        }
        
        console.log(`         Scroll ${scrolls}: ${currentCount} images (${currentCount - previousCount} new)`)
        
      } while (unchangedCount < maxUnchanged && scrolls < maxScrolls)
      
      console.log(`      ✓ Finished scrolling page ${pageNum}: ${currentCount} total images loaded`)
      
      // Save HTML for debug if requested
      if (DEBUG) {
        const html = await page.content()
        const debugPath = `/tmp/flickr-page-${pageNum}.html`
        fs.writeFileSync(debugPath, html)
        console.log(`      💾 Debug: Saved HTML to ${debugPath}`)
      }
      
      // Extract photos AND videos from current page
      const pagePhotos = await page.evaluate(() => {
        const photoData = []
        const seen = new Set()
        
        // First, find all VIDEO elements
        const videos = document.querySelectorAll('video[src*="staticflickr"]')
        videos.forEach(video => {
          const videoSrc = video.getAttribute('src') || ''
          const posterSrc = video.getAttribute('poster') || ''
          
          // Extract from poster: //live.staticflickr.com/{server}/{id}_{secret}_{size}.jpg
          const posterMatch = posterSrc.match(/staticflickr\.com\/(\d+)\/(\d+)_([a-z0-9]+)(?:_[a-z])?\.(?:jpg|png|gif)/i)
          
          if (posterMatch && videoSrc && !seen.has(posterMatch[2])) {
            const videoId = posterMatch[2]
            const server = posterMatch[1]
            const secret = posterMatch[3]
            
            seen.add(videoId)
            
            // Get title
            const title = video.getAttribute('title') || 
                         video.closest('a')?.getAttribute('title') ||
                         `Video ${photoData.length + 1}`
            
            // Ensure URLs have https://
            const fullPosterUrl = posterSrc.startsWith('http') 
              ? posterSrc 
              : `https:${posterSrc}`
            const fullVideoUrl = videoSrc.startsWith('http') 
              ? videoSrc 
              : `https:${videoSrc}`
            
            photoData.push({
              id: videoId,
              secret: secret,
              server: server,
              title: title.trim(),
              type: 'video',
              thumbnailUrl: fullPosterUrl,
              videoUrl: fullVideoUrl,
              farm: 0
            })
          }
        })
        
        // Then, find all PHOTO images (that aren't video thumbnails)
        const images = document.querySelectorAll('img[src*="staticflickr"]')
        images.forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || ''
          
          // Extract server, id, secret from image URL
          // Pattern: https://live.staticflickr.com/{server}/{id}_{secret}[_{size}].jpg
          const imgMatch = src.match(/staticflickr\.com\/(\d+)\/(\d+)_([a-z0-9]+)(?:_[a-z])?\.(?:jpg|png|gif)/i)
          
          if (imgMatch && !seen.has(imgMatch[2])) {
            const photoId = imgMatch[2]
            const server = imgMatch[1]
            const secret = imgMatch[3]
            
            seen.add(photoId)
            
            // Get title from alt or title attribute or nearby link
            const title = img.getAttribute('alt') || 
                         img.getAttribute('title') || 
                         img.closest('a')?.getAttribute('title') ||
                         `Photo ${photoData.length + 1}`
            
            photoData.push({
              id: photoId,
              secret: secret,
              server: server,
              title: title.trim(),
              type: 'photo',
              farm: 0
            })
          }
        })
        
        return photoData
      })
      
      // Add unique photos to collection
      const existingIds = new Set(allPhotos.map(p => p.id))
      const newPhotos = pagePhotos.filter(p => !existingIds.has(p.id))
      const duplicates = pagePhotos.filter(p => existingIds.has(p.id))
      allPhotos.push(...newPhotos)
      
      console.log(`      Found ${pagePhotos.length} photos (${newPhotos.length} new, ${duplicates.length} duplicates, total: ${allPhotos.length})`)
      
      if (DEBUG) {
        console.log(`      📋 Photo IDs on this page:`)
        pagePhotos.forEach((p, i) => {
          const status = existingIds.has(p.id) ? '(dup)' : '(new)'
          console.log(`         ${i + 1}. ${p.id} ${status} - ${p.title.substring(0, 50)}`)
        })
      }
      
      // Check for "Next" button/link
      const nextButton = await page.evaluate(() => {
        // Find all links
        const allLinks = Array.from(document.querySelectorAll('a'))
        
        // Look for "Next" link
        const nextLink = allLinks.find(link => {
          const text = link.textContent.toLowerCase().trim()
          const rel = link.getAttribute('rel')
          const className = link.className
          
          return (
            (text === 'next' || text.includes('next')) ||
            rel === 'next' ||
            className.includes('Next') ||
            className.includes('next')
          ) && !className.includes('disabled')
        })
        
        return nextLink ? nextLink.href : null
      })
      
      if (nextButton) {
        console.log(`      → Going to next page...`)
        await page.goto(nextButton, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        pageNum++
      } else {
        console.log(`      ✓ No more pages`)
        hasNextPage = false
      }
    }
    
    console.log(`✅ Collected ${allPhotos.length} photos from ${pageNum} page(s)`)
    
    if (DEBUG) {
      console.log(`\n📊 Debug Summary:`)
      console.log(`   Total unique photos: ${allPhotos.length}`)
      console.log(`   Pages processed: ${pageNum}`)
      console.log(`   HTML files saved to: /tmp/flickr-page-*.html`)
    }
    
    await browser.close()
    return allPhotos
    
    // This code is now handled above in the pagination loop
    // Should not reach here
    throw new Error('Unexpected code path')
    
  } catch (error) {
    await browser.close()
    throw error
  }
}

/**
 * Fallback: Extract photos from HTML
 */
function extractPhotosFromHTML(html) {
  const photos = []
  
  // Look for image URLs in the HTML
  const imgPattern = /https:\/\/live\.staticflickr\.com\/(\d+)\/(\d+)_([a-z0-9]+)_[a-z]\.jpg/g
  let match
  
  const seen = new Set()
  
  while ((match = imgPattern.exec(html)) !== null) {
    const photoId = match[2]
    if (!seen.has(photoId)) {
      seen.add(photoId)
      photos.push({
        id: photoId,
        secret: match[3],
        server: match[1],
        title: `Photo ${photos.length + 1}`,
        farm: 0
      })
    }
  }
  
  return photos
}

/**
 * Normalize photo/video data structure
 */
function normalizePhotoData(photos) {
  return photos.map((photo, index) => {
    const base = {
      id: photo.id || `photo-${index}`,
      title: photo.title || `${photo.type === 'video' ? 'Video' : 'Photo'} ${index + 1}`,
      secret: photo.secret || '',
      server: photo.server || '',
      farm: photo.farm || 0,
      datetaken: photo.datetaken || new Date().toISOString(),
      type: photo.type || 'photo'
    }
    
    // Preserve video-specific fields
    if (photo.type === 'video') {
      base.thumbnailUrl = photo.thumbnailUrl
      base.videoUrl = photo.videoUrl
    }
    
    return base
  })
}

/**
 * Construct photo URL from Flickr photo data
 * Size suffixes: _b (1024), _h (1600), _k (2048), _o (original)
 */
function constructPhotoUrl(photo, size = 'b') {
  // https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg
  return `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${size}.jpg`
}

/**
 * Try to fetch larger size, fall back to smaller if not available
 */
async function getBestPhotoUrl(photo) {
  const sizes = ['k', 'h', 'b'] // 2048, 1600, 1024
  
  for (const size of sizes) {
    const url = constructPhotoUrl(photo, size)
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        return url
      }
    } catch (e) {
      // Try next size
    }
  }
  
  // Fallback to default size
  return constructPhotoUrl(photo, 'b')
}

/**
 * Generate trip JSON from scraped photos (and videos)
 */
function generateTripJson(photos, tripId, tripTitle, tripDescription, photoDuration) {
  const totalDuration = photos.length * photoDuration
  
  // Use first photo (not video) for cover, or fallback to first item
  const firstPhoto = photos.find(p => p.type !== 'video') || photos[0]
  const coverImage = firstPhoto ? constructPhotoUrl(firstPhoto, 'b') : ''
  
  const tripPhotos = photos.map((photo, index) => {
    const baseItem = {
      id: `photo-${String(index + 1).padStart(3, '0')}`,
      caption: photo.title || `${photo.type === 'video' ? 'Video' : 'Photo'} ${index + 1}`,
      timestamp: photo.datetaken || new Date().toISOString()
    }
    
    // Add type and URLs based on whether it's a photo or video
    if (photo.type === 'video') {
      return {
        ...baseItem,
        type: 'video',
        url: photo.thumbnailUrl || constructPhotoUrl(photo, 'b'), // Thumbnail for display
        thumbnailUrl: photo.thumbnailUrl || constructPhotoUrl(photo, 'b'),
        videoUrl: photo.videoUrl
      }
    } else {
      return {
        ...baseItem,
        type: 'photo',
        url: constructPhotoUrl(photo, 'b') // Use 1024px version
      }
    }
  })
  
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
 * Main scraper function
 */
async function scrapeAndImport() {
  try {
    console.log('\n🎨 Flickr Album Scraper (Private Albums Supported!)')
    console.log('===================================================\n')
    
    console.log('📍 Guest Pass URL:', guestPassUrl)
    console.log('📝 Trip ID:', tripId)
    console.log('🎬 Title:', tripTitle)
    console.log()
    
    // Scrape photos (and videos) from guest pass page
    const rawPhotos = await scrapeFlickrGuestPass(guestPassUrl)
    const photos = normalizePhotoData(rawPhotos)
    
    const photoCount = photos.filter(p => p.type !== 'video').length
    const videoCount = photos.filter(p => p.type === 'video').length
    console.log(`✅ Found ${photos.length} items (${photoCount} photos, ${videoCount} videos)\n`)
    
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
    
    // Determine output directory
    const dataDir = path.join(path.dirname(__dirname), 'private-data')
    const tripsDir = path.join(dataDir, 'trips')
    
    // Create directories
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
    console.log('1. Review: cat private-data/trips/' + tripId + '.json')
    console.log('2. Test locally: cp -r private-data/* public/data/ && npm run dev')
    console.log('3. Deploy (see DEPLOYMENT.md)\n')
    
    console.log('✨ Note: This works with PRIVATE albums! No API key needed!\n')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\nStack trace:', error.stack)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure the guest pass URL is valid')
    console.error('2. Try opening the URL in a browser to verify it works')
    console.error('3. Check if Flickr changed their page structure')
    console.error('4. See PRIVATE_ALBUMS_GUIDE.md for alternatives\n')
    process.exit(1)
  }
}

// Run scraper
scrapeAndImport()

