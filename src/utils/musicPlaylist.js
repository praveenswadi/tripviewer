/**
 * Music Playlist Manager
 * Creates a smart playlist that plays multiple tracks sequentially
 * without repeating until all tracks have been played
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate a playlist that covers the entire slideshow duration
 * @param {Array} tracks - All available tracks
 * @param {number} totalDuration - Total slideshow duration in seconds
 * @returns {Array} - Array of track IDs in play order
 */
export function generatePlaylist(tracks, totalDuration) {
  if (!tracks || tracks.length === 0) return []
  
  // Create random order
  const shuffledTracks = shuffleArray(tracks)
  
  // Calculate total duration of one complete cycle
  const cycleDuration = shuffledTracks.reduce((sum, track) => sum + track.duration, 0)
  
  // Calculate how many complete cycles we need
  const completeCycles = Math.floor(totalDuration / cycleDuration)
  const remainingTime = totalDuration - (completeCycles * cycleDuration)
  
  // Build playlist
  const playlist = []
  
  // Add complete cycles
  for (let i = 0; i < completeCycles; i++) {
    playlist.push(...shuffledTracks)
  }
  
  // Add partial cycle to cover remaining time
  let accumulatedTime = 0
  for (const track of shuffledTracks) {
    if (accumulatedTime >= remainingTime) break
    playlist.push(track)
    accumulatedTime += track.duration
  }
  
  // If playlist is still empty, add at least one track
  if (playlist.length === 0) {
    playlist.push(shuffledTracks[0])
  }
  
  return playlist
}

/**
 * Get the current track that should be playing at a given time
 * @param {Array} playlist - Array of tracks in play order
 * @param {number} currentTime - Current playback time in seconds
 * @returns {Object} - { track, trackIndex, trackStartTime }
 */
export function getCurrentTrack(playlist, currentTime) {
  if (!playlist || playlist.length === 0) return null
  
  let accumulatedTime = 0
  
  for (let i = 0; i < playlist.length; i++) {
    const track = playlist[i]
    const trackEndTime = accumulatedTime + track.duration
    
    if (currentTime >= accumulatedTime && currentTime < trackEndTime) {
      return {
        track,
        trackIndex: i,
        trackStartTime: accumulatedTime,
        trackElapsedTime: currentTime - accumulatedTime
      }
    }
    
    accumulatedTime = trackEndTime
  }
  
  // If we've gone past all tracks, return the last one
  const lastTrack = playlist[playlist.length - 1]
  return {
    track: lastTrack,
    trackIndex: playlist.length - 1,
    trackStartTime: accumulatedTime - lastTrack.duration,
    trackElapsedTime: lastTrack.duration
  }
}

