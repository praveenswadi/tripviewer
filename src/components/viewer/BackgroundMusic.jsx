import { useRef, useEffect, useState } from 'react'
import { generatePlaylist, getCurrentTrack } from '../../utils/musicPlaylist'

/**
 * BackgroundMusic component
 * Plays multiple background music tracks sequentially during slideshow
 */
function BackgroundMusic({ 
  volume = 0.3, 
  isPlaying, 
  enabled = true,
  currentTime = 0,
  totalDuration = 0,
  onTrackChange = null
}) {
  const audioRef = useRef(null)
  const [allTracks, setAllTracks] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [currentTrackInfo, setCurrentTrackInfo] = useState(null)

  // Load all available tracks
  useEffect(() => {
    fetch('/audio/music/tracks.json')
      .then(res => res.json())
      .then(data => {
        setAllTracks(data.tracks || [])
      })
      .catch(err => {
        console.error('Error loading tracks:', err)
      })
  }, [])

  // Generate playlist when tracks are loaded
  useEffect(() => {
    if (allTracks.length === 0 || totalDuration === 0) return
    
    const generatedPlaylist = generatePlaylist(allTracks, totalDuration)
    setPlaylist(generatedPlaylist)
    
    console.log('🎵 Generated playlist:', generatedPlaylist.map(t => t.title).join(' → '))
  }, [allTracks, totalDuration])

  // Update current track based on slideshow time
  useEffect(() => {
    if (playlist.length === 0) return
    
    const trackInfo = getCurrentTrack(playlist, currentTime)
    
    if (trackInfo && trackInfo.track.id !== currentTrackInfo?.track?.id) {
      setCurrentTrackInfo(trackInfo)
      
      // Notify parent of track change for attribution
      if (onTrackChange) {
        onTrackChange(trackInfo.track)
      }
      
      console.log(`🎵 Now playing: ${trackInfo.track.title}`)
    }
  }, [currentTime, playlist, onTrackChange, currentTrackInfo])

  // Control playback
  useEffect(() => {
    if (!audioRef.current || !enabled || !currentTrackInfo) return

    audioRef.current.volume = volume

    if (isPlaying) {
      // Calculate where we should be in the current track
      const trackElapsedTime = currentTime - currentTrackInfo.trackStartTime
      
      // Only seek if we're off by more than 1 second
      if (Math.abs(audioRef.current.currentTime - trackElapsedTime) > 1) {
        audioRef.current.currentTime = trackElapsedTime
      }
      
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, enabled, volume, currentTime, currentTrackInfo])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current && enabled) {
      audioRef.current.volume = volume
    }
  }, [volume, enabled])

  if (!enabled || !currentTrackInfo) {
    return null
  }

  return (
    <audio
      ref={audioRef}
      src={`/audio/music/${currentTrackInfo.track.file}`}
      preload="auto"
      style={{ display: 'none' }}
    />
  )
}

export default BackgroundMusic
