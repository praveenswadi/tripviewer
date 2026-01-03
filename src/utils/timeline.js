/**
 * Calculate photo timeline - distributes total duration evenly across photos
 * @param {Array} photos - Array of photo objects
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Object} Timeline object with photo IDs as keys
 */
export function calculatePhotoTimeline(photos, totalDuration) {
  if (!photos || photos.length === 0) {
    return {}
  }

  const baseDuration = totalDuration / photos.length
  let currentTime = 0
  const timeline = {}

  photos.forEach((photo) => {
    timeline[photo.id] = {
      start: currentTime,
      end: currentTime + baseDuration,
      duration: baseDuration,
    }
    currentTime += baseDuration
  })

  return timeline
}

/**
 * Get current photo index based on current time
 * @param {number} currentTime - Current playback time in seconds
 * @param {Object} photoTimeline - Timeline object
 * @param {Array} photos - Array of photo objects
 * @returns {number} Current photo index
 */
export function getCurrentPhotoIndex(currentTime, photoTimeline, photos) {
  if (!photos || photos.length === 0) {
    return 0
  }

  for (let i = 0; i < photos.length; i++) {
    const timing = photoTimeline[photos[i].id]
    if (timing && currentTime >= timing.start && currentTime < timing.end) {
      return i
    }
  }

  // If we're past the end, return the last photo
  return photos.length - 1
}

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get time for a specific photo index
 * @param {number} photoIndex - Photo index
 * @param {Object} photoTimeline - Timeline object
 * @param {Array} photos - Array of photo objects
 * @returns {number} Start time for the photo
 */
export function getPhotoStartTime(photoIndex, photoTimeline, photos) {
  if (!photos || photoIndex < 0 || photoIndex >= photos.length) {
    return 0
  }

  const photo = photos[photoIndex]
  const timing = photoTimeline[photo.id]
  return timing ? timing.start : 0
}

