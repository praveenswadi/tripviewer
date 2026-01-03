import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../../utils/timeline'
import { APP_CONFIG, DEVICE_TYPES } from '../../config/constants'
import './Controls.css'

function Controls({
  isPlaying,
  onPlayPause,
  onExit,
  currentPhoto,
  totalPhotos,
  currentTime,
  totalDuration,
  deviceType,
}) {
  const [visible, setVisible] = useState(true)
  const hideTimerRef = useRef(null)

  // Auto-hide logic for TV
  useEffect(() => {
    if (deviceType !== DEVICE_TYPES.TV) {
      setVisible(true)
      return
    }

    const handleMouseMove = () => {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        if (isPlaying) {
          setVisible(false)
        }
      }, APP_CONFIG.CONTROLS_HIDE_DELAY)
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Initial hide timer
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, APP_CONFIG.CONTROLS_HIDE_DELAY)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hideTimerRef.current)
    }
  }, [deviceType, isPlaying])

  // Show controls when paused
  useEffect(() => {
    if (!isPlaying) {
      setVisible(true)
      clearTimeout(hideTimerRef.current)
    }
  }, [isPlaying])

  const progress = totalPhotos > 0 ? (currentPhoto / totalPhotos) * 100 : 0
  const timeRemaining = formatTime(totalDuration - currentTime)

  return (
    <div
      className={`controls controls--${deviceType} ${
        visible ? 'controls--visible' : 'controls--hidden'
      }`}
    >
      <div className="controls__progress-bar">
        <div
          className="controls__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="controls__bottom">
        <div className="controls__info">
          Photo {currentPhoto} of {totalPhotos} · {timeRemaining} remaining
        </div>

        <div className="controls__buttons">
          <button
            onClick={onPlayPause}
            className="controls__button controls__button--play-pause"
          >
            {isPlaying ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button onClick={onExit} className="controls__button controls__button--exit">
            ✕ Exit
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls

