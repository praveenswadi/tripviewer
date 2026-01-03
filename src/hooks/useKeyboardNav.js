import { useEffect } from 'react'

/**
 * Hook for keyboard navigation (remote control support)
 * @param {Object} handlers - Object with handler functions
 * @param {Function} handlers.onPlayPause - Toggle play/pause
 * @param {Function} handlers.onPrevious - Go to previous photo
 * @param {Function} handlers.onNext - Go to next photo
 * @param {Function} handlers.onExit - Exit to trip selection
 */
export function useKeyboardNav({ onPlayPause, onPrevious, onNext, onExit }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (onPlayPause) onPlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (onPrevious) onPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (onNext) onNext()
          break
        case 'Escape':
          e.preventDefault()
          if (onExit) onExit()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPlayPause, onPrevious, onNext, onExit])
}

