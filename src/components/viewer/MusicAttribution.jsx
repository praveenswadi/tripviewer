import { useState, useEffect, useRef } from 'react'
import { APP_CONFIG } from '../../config/constants'
import './MusicAttribution.css'

/**
 * Music Attribution Component
 * Displays attribution for background music when playing
 * Auto-hides after inactivity, similar to controls
 */
function MusicAttribution({ track, isPlaying, deviceType }) {
  const [visible, setVisible] = useState(true)
  const hideTimerRef = useRef(null)

  // Auto-hide logic - show on mouse movement, hide after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      
      // Auto-hide after 3 seconds of inactivity
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, APP_CONFIG.CONTROLS_HIDE_DELAY)
    }

    const handleTouch = () => {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      
      // Auto-hide after 3 seconds on mobile
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, APP_CONFIG.CONTROLS_HIDE_DELAY)
    }

    // Only listen for mouse movement and touch, NOT keyboard
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', handleTouch)

    // Initial hide timer (3 seconds from page load)
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, APP_CONFIG.CONTROLS_HIDE_DELAY)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouch)
      clearTimeout(hideTimerRef.current)
    }
  }, [])

  if (!track || !isPlaying) {
    return null
  }

  return (
    <div className={`music-attribution music-attribution--${deviceType} ${
      visible ? 'music-attribution--visible' : 'music-attribution--hidden'
    }`}>
      <div className="music-attribution__content">
        <div className="music-attribution__line">
          🎵 "{track.title}" {track.artist}
        </div>
        <div className="music-attribution__line">
          Licensed under Creative Commons: By Attribution 4.0 License
        </div>
        <a 
          href="http://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="music-attribution__link"
        >
          http://creativecommons.org/licenses/by/4.0/
        </a>
      </div>
    </div>
  )
}

export default MusicAttribution

