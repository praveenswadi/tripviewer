import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import { useKeyboardNav } from '../../hooks/useKeyboardNav'
import { useImagePreload } from '../../hooks/useImagePreload'
import { useTouchControls } from '../../hooks/useTouchControls'
import {
  calculatePhotoTimeline,
  getCurrentPhotoIndex,
  getPhotoStartTime,
} from '../../utils/timeline'
import { DATA_PATHS, DEVICE_TYPES, APP_CONFIG } from '../../config/constants'
import Countdown from './Countdown'
import Controls from './Controls'
import BackgroundMusic from './BackgroundMusic'
import Loading from '../common/Loading'
import './Slideshow.css'

function Slideshow() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const deviceType = useDeviceDetection()

  // State
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCountdown, setShowCountdown] = useState(true)
  const [photoTimeline, setPhotoTimeline] = useState({})

  // Load trip data
  useEffect(() => {
    setLoading(true)
    fetch(`${DATA_PATHS.TRIPS_DIR}${tripId}.json`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Trip not found')
        }
        return res.json()
      })
      .then((data) => {
        setTrip(data)

        // Calculate photo timeline if not provided
        const timeline =
          Object.keys(data.photoTimeline || {}).length > 0
            ? data.photoTimeline
            : calculatePhotoTimeline(data.photos, data.totalDuration)

        setPhotoTimeline(timeline)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading trip:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [tripId])

  // Auto-play countdown for TV
  useEffect(() => {
    if (deviceType === DEVICE_TYPES.TV && showCountdown && !loading && trip) {
      // Countdown component will handle the timer
      return
    }

    // For non-TV devices, skip countdown
    if (deviceType !== DEVICE_TYPES.TV && showCountdown && !loading && trip) {
      setShowCountdown(false)
    }
  }, [deviceType, showCountdown, loading, trip])

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !trip) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= trip.totalDuration) {
          // End of slideshow - loop or stop
          setIsPlaying(false)
          return 0
        }
        return prev + 0.1 // Update every 100ms
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, trip])

  // Get current photo
  const currentPhotoIndex =
    trip && trip.photos
      ? getCurrentPhotoIndex(currentTime, photoTimeline, trip.photos)
      : 0
  const currentPhoto = trip?.photos?.[currentPhotoIndex]

  // Preload images
  useImagePreload(trip?.photos || [], currentPhotoIndex, APP_CONFIG.PRELOAD_COUNT)

  // Handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (!trip || !trip.photos) return
    const prevIndex = Math.max(0, currentPhotoIndex - 1)
    const newTime = getPhotoStartTime(prevIndex, photoTimeline, trip.photos)
    setCurrentTime(newTime)
  }

  const handleNext = () => {
    if (!trip || !trip.photos) return
    const nextIndex = Math.min(trip.photos.length - 1, currentPhotoIndex + 1)
    const newTime = getPhotoStartTime(nextIndex, photoTimeline, trip.photos)
    setCurrentTime(newTime)
  }

  const handleExit = () => {
    navigate('/')
  }

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    setIsPlaying(true)
  }

  const handleCancelCountdown = () => {
    setShowCountdown(false)
  }

  // Keyboard navigation
  useKeyboardNav({
    onPlayPause: handlePlayPause,
    onPrevious: handlePrevious,
    onNext: handleNext,
    onExit: handleExit,
  })

  // Touch controls for mobile/tablet
  useTouchControls({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    onTap: handlePlayPause,
  })

  // Loading state
  if (loading) {
    return (
      <div className="slideshow">
        <Loading message="Loading trip..." />
      </div>
    )
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="slideshow">
        <div className="slideshow__error">
          <h2>Error Loading Trip</h2>
          <p>{error || 'Trip not found'}</p>
          <button onClick={handleExit} className="slideshow__error-button">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // No photos
  if (!trip.photos || trip.photos.length === 0) {
    return (
      <div className="slideshow">
        <div className="slideshow__error">
          <h2>No Photos</h2>
          <p>This trip doesn't have any photos yet.</p>
          <button onClick={handleExit} className="slideshow__error-button">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`slideshow slideshow--${deviceType}`}>
      {/* Countdown overlay (TV only) */}
      {showCountdown && deviceType === DEVICE_TYPES.TV && (
        <Countdown
          onComplete={handleCountdownComplete}
          onCancel={handleCancelCountdown}
        />
      )}

      {/* Photo display */}
      {!showCountdown && currentPhoto && (
        <>
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption}
            className="slideshow__image"
            key={currentPhoto.id}
          />

          {/* Caption */}
          {currentPhoto.caption && (
            <div className="slideshow__caption">{currentPhoto.caption}</div>
          )}

          {/* Controls overlay */}
          <Controls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onExit={handleExit}
            currentPhoto={currentPhotoIndex + 1}
            totalPhotos={trip.photos.length}
            currentTime={currentTime}
            totalDuration={trip.totalDuration}
            deviceType={deviceType}
          />

          {/* Background music */}
          {trip.backgroundMusic && (
            <BackgroundMusic
              trackId={trip.backgroundMusic.trackId}
              volume={trip.backgroundMusic.volume || APP_CONFIG.DEFAULT_MUSIC_VOLUME}
              isPlaying={isPlaying}
              enabled={trip.backgroundMusic.enabled}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Slideshow
