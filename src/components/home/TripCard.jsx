import { useNavigate } from 'react-router-dom'
import './TripCard.css'

function TripCard({ trip, number, deviceType }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/trip/${trip.id}`)
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`trip-card trip-card--${deviceType}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Keyboard shortcut hint */}
      {deviceType === 'tv' && (
        <div className="trip-card__number">{number}</div>
      )}

      <div className="trip-card__image-container">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="trip-card__image"
          loading="lazy"
        />
        <div className="trip-card__overlay">
          <span className="trip-card__play-icon">▶</span>
        </div>
      </div>

      <div className="trip-card__content">
        <h3 className="trip-card__title">{trip.title}</h3>
        
        {trip.description && (
          <p className="trip-card__description">{trip.description}</p>
        )}

        <div className="trip-card__meta">
          <span className="trip-card__meta-item">
            📷 {trip.photoCount} photos
          </span>
          <span className="trip-card__meta-item">
            ⏱️ {formatDuration(trip.duration)}
          </span>
          {trip.hasAudio && (
            <span className="trip-card__meta-item">🎙️ Narrated</span>
          )}
        </div>

        <div className="trip-card__date">{formatDate(trip.createdDate)}</div>
      </div>
    </div>
  )
}

export default TripCard

