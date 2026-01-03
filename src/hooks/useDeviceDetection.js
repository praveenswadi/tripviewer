import { useState, useEffect } from 'react'
import { APP_CONFIG, DEVICE_TYPES } from '../config/constants'

/**
 * Hook to detect device type (TV, tablet, or mobile)
 * TV is detected by user agent or screen width >= 1920px
 * Tablet is 768px - 1919px
 * Mobile is < 768px
 */
export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES.MOBILE)

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent
      const screenWidth = window.innerWidth

      // Check for TV user agents
      const isTVUserAgent = APP_CONFIG.TV_USER_AGENTS.some(agent =>
        new RegExp(agent, 'i').test(userAgent)
      )

      if (isTVUserAgent || screenWidth >= APP_CONFIG.BREAKPOINTS.TABLET) {
        setDeviceType(DEVICE_TYPES.TV)
      } else if (screenWidth >= APP_CONFIG.BREAKPOINTS.MOBILE) {
        setDeviceType(DEVICE_TYPES.TABLET)
      } else {
        setDeviceType(DEVICE_TYPES.MOBILE)
      }
    }

    detectDevice()

    // Re-detect on window resize
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  return deviceType
}

