import { useEffect } from 'react'

/**
 * Hook to preload images ahead of current position
 * @param {Array} photos - Array of photo objects
 * @param {number} currentIndex - Current photo index
 * @param {number} preloadCount - Number of photos to preload ahead
 */
export function useImagePreload(photos, currentIndex, preloadCount = 20) {
  useEffect(() => {
    if (!photos || photos.length === 0) {
      return
    }

    const startIndex = currentIndex
    const endIndex = Math.min(currentIndex + preloadCount, photos.length)

    // Preload images
    for (let i = startIndex; i < endIndex; i++) {
      const img = new Image()
      img.src = photos[i].url
    }
  }, [currentIndex, photos, preloadCount])
}

