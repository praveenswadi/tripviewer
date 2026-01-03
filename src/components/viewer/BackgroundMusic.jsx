import { useRef, useEffect } from 'react'

/**
 * BackgroundMusic component
 * Plays background music during slideshow with fade in/out
 */
function BackgroundMusic({ trackId, volume = 0.3, isPlaying, enabled = true }) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!audioRef.current || !enabled) return

    audioRef.current.volume = volume

    if (isPlaying) {
      // Fade in and play
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err)
      })
    } else {
      // Pause (fade out handled by browser)
      audioRef.current.pause()
    }
  }, [isPlaying, enabled, volume])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current && enabled) {
      audioRef.current.volume = volume
    }
  }, [volume, enabled])

  if (!enabled || !trackId) {
    return null
  }

  return (
    <audio
      ref={audioRef}
      src={`/audio/music/${trackId}.mp3`}
      loop
      preload="auto"
      style={{ display: 'none' }}
    />
  )
}

export default BackgroundMusic

