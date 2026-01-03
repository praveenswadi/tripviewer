import { useState, useEffect } from 'react'
import { APP_CONFIG } from '../../config/constants'
import './Countdown.css'

function Countdown({ onComplete, onCancel }) {
  const [count, setCount] = useState(APP_CONFIG.COUNTDOWN_DURATION)

  useEffect(() => {
    if (count <= 0) {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="countdown">
      <div className="countdown__content">
        <h2 className="countdown__title">Starting slideshow in...</h2>
        <div className="countdown__number">{count}</div>
        <button onClick={onCancel} className="countdown__cancel-button">
          Cancel Auto-play
        </button>
        <p className="countdown__hint">
          Press Space to pause, Arrow keys to navigate, Escape to exit
        </p>
      </div>
    </div>
  )
}

export default Countdown

