import { useEffect, useRef } from 'react'

/**
 * Hook for touch/swipe controls on mobile and tablet
 * @param {Object} handlers - Object with handler functions
 * @param {Function} handlers.onSwipeLeft - Swipe left (next photo)
 * @param {Function} handlers.onSwipeRight - Swipe right (previous photo)
 * @param {Function} handlers.onTap - Single tap (toggle controls)
 */
export function useTouchControls({ onSwipeLeft, onSwipeRight, onTap }) {
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)

  useEffect(() => {
    const minSwipeDistance = 50 // Minimum distance for swipe

    const handleTouchStart = (e) => {
      touchEndRef.current = null
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      }
    }

    const handleTouchMove = (e) => {
      touchEndRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = () => {
      if (!touchStartRef.current) return

      // Check if it's a tap (no significant movement)
      if (!touchEndRef.current) {
        if (onTap) onTap()
        return
      }

      const deltaX = touchStartRef.current.x - touchEndRef.current.x
      const deltaY = touchStartRef.current.y - touchEndRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Ignore if the touch was held too long (probably a drag/scroll)
      if (deltaTime > 500) {
        return
      }

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swiped left (next)
            if (onSwipeLeft) onSwipeLeft()
          } else {
            // Swiped right (previous)
            if (onSwipeRight) onSwipeRight()
          }
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onTap])
}

