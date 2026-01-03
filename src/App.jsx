import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PinAuth from './components/auth/PinAuth'
import HomePage from './components/home/HomePage'
import Slideshow from './components/viewer/Slideshow'
import ErrorBoundary from './components/common/ErrorBoundary'
import { isAuthenticated } from './utils/storage'

function App() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuth(isAuthenticated())
    setLoading(false)
  }, [])

  const handleAuthenticated = () => {
    setIsAuth(true)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuth) {
    return <PinAuth onAuthenticated={handleAuthenticated} />
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:tripId" element={<Slideshow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App

