import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../../utils/timeline'
import { APP_CONFIG, DEVICE_TYPES } from '../../config/constants'
import './Controls.css'

function Controls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onExit,
  currentPhoto,
  totalPhotos,
  currentTime,
  totalDuration,
  deviceType,
}) {
  const [visible, setVisible] = useState(true)
  const hideTimerRef = useRef(null)

  // Auto-hide logic - show controls only on mouse movement or touch
  useEffect(() => {
    const handleMouseMove = () => {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      
      // Auto-hide after 3 seconds of inactivity (always, regardless of play/pause)
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, APP_CONFIG.CONTROLS_HIDE_DELAY)
    }

    const handleTouch = () => {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      
      // Auto-hide after 3 seconds on mobile (always)
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

  const progress = totalPhotos > 0 ? (currentPhoto / totalPhotos) * 100 : 0
  const timeRemaining = formatTime(totalDuration - currentTime)

  return (
    <div
      className={`controls controls--${deviceType} ${
        visible ? 'controls--visible' : 'controls--hidden'
      }`}
    >
      {/* Thin progress bar at very bottom */}
      <div className="controls__progress-bar">
        <div
          className="controls__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info corners */}
      <div className="controls__info-left">
        {currentPhoto} of {totalPhotos}
      </div>

      <div className="controls__info-right">
        {timeRemaining}
      </div>

      {/* Center buttons - always visible */}
      <div className="controls__center">
        <button
          onClick={onPrevious}
          className="controls__button controls__button--nav"
          title="Previous Photo"
        >
          ← Prev
        </button>
        <button
          onClick={onPlayPause}
          className="controls__button controls__button--play-pause"
        >
          {isPlaying ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button
          onClick={onNext}
          className="controls__button controls__button--nav"
          title="Next Photo"
        >
          Next →
        </button>
        <button 
          onClick={onExit} 
          className="controls__button controls__button--exit"
          title="Exit"
        >
          ✕ Exit
        </button>
      </div>
    </div>
  )
}

export default Controls
