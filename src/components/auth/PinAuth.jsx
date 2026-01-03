import { useState } from 'react'
import { setAuthentication } from '../../utils/storage'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import { DEVICE_TYPES } from '../../config/constants'
import './PinAuth.css'

function PinAuth({ onAuthenticated }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const deviceType = useDeviceDetection()
  const correctPin = import.meta.env.VITE_APP_PIN || '123456'

  const handlePinInput = (digit) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')

      // Auto-submit when 6 digits entered
      if (newPin.length === 6) {
        setTimeout(() => handleSubmit(newPin), 300)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleSubmit = (pinToCheck = pin) => {
    if (pinToCheck === correctPin) {
      setAuthentication()
      onAuthenticated()
    } else {
      setError('Incorrect PIN. Please try again.')
      setPin('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handlePinInput(e.key)
    } else if (e.key === 'Backspace') {
      handleBackspace()
    } else if (e.key === 'Enter' && pin.length === 6) {
      handleSubmit()
    }
  }

  const isTVMode = deviceType === DEVICE_TYPES.TV

  return (
    <div className={`pin-auth pin-auth--${deviceType}`}>
      <div className="pin-auth__container">
        <h1 className="pin-auth__title">Welcome to Photo Stories</h1>
        <p className="pin-auth__subtitle">Enter your 6-digit PIN to continue</p>

        <div className="pin-auth__display">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`pin-auth__digit ${i < pin.length ? 'pin-auth__digit--filled' : ''}`}
            >
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>

        {error && <div className="pin-auth__error">{error}</div>}

        {/* Numeric keypad for TV/tablet, or keyboard input for mobile */}
        <div className="pin-auth__keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="pin-auth__key"
              onClick={() => handlePinInput(num.toString())}
              tabIndex={0}
            >
              {num}
            </button>
          ))}
          <button
            className="pin-auth__key pin-auth__key--backspace"
            onClick={handleBackspace}
            tabIndex={0}
          >
            ⌫
          </button>
          <button
            className="pin-auth__key"
            onClick={() => handlePinInput('0')}
            tabIndex={0}
          >
            0
          </button>
          <button
            className="pin-auth__key pin-auth__key--submit"
            onClick={() => handleSubmit()}
            disabled={pin.length !== 6}
            tabIndex={0}
          >
            ✓
          </button>
        </div>

        {/* Hidden input for keyboard entry on mobile */}
        {!isTVMode && (
          <input
            type="tel"
            inputMode="numeric"
            maxLength="6"
            className="pin-auth__hidden-input"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={handleKeyPress}
            autoFocus
            placeholder="Enter PIN"
          />
        )}
      </div>
    </div>
  )
}

export default PinAuth

