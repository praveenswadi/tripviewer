import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import TripCard from './TripCard'
import Loading from '../common/Loading'
import { DATA_PATHS } from '../../config/constants'
import './HomePage.css'

function HomePage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const deviceType = useDeviceDetection()
  const navigate = useNavigate()

  useEffect(() => {
    // Load trips from JSON
    fetch(DATA_PATHS.TRIPS_INDEX)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load trips')
        }
        return res.json()
      })
      .then((data) => {
        setTrips(data.trips || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading trips:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // Keyboard navigation for trip selection
    const handleKeyDown = (e) => {
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= trips.length) {
        const trip = trips[num - 1]
        navigate(`/trip/${trip.id}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [trips, navigate])

  if (loading) {
    return (
      <div className="home-page">
        <Loading message="Loading trips..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error">
          <h2>Error Loading Trips</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="home-page">
        <div className="empty-state">
          <h2>No Trips Yet</h2>
          <p>Add your first photo story to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`home-page home-page--${deviceType}`}>
      <header className="home-page__header">
        <h1 className="home-page__title">Photo Stories</h1>
        <p className="home-page__subtitle">Select a trip to view</p>
      </header>

      <div className="trip-grid">
        {trips.map((trip, index) => (
          <TripCard
            key={trip.id}
            trip={trip}
            number={index + 1}
            deviceType={deviceType}
          />
        ))}
      </div>
    </div>
  )
}

export default HomePage

