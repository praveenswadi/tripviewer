import { APP_CONFIG } from '../config/constants'

/**
 * Store authentication token with expiry
 */
export function setAuthentication() {
  const expiryTime = Date.now() + APP_CONFIG.AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  localStorage.setItem(APP_CONFIG.AUTH_TOKEN_KEY, 'authenticated')
  localStorage.setItem(APP_CONFIG.AUTH_EXPIRY_KEY, expiryTime.toString())
}

/**
 * Check if user is authenticated and token hasn't expired
 */
export function isAuthenticated() {
  const token = localStorage.getItem(APP_CONFIG.AUTH_TOKEN_KEY)
  const expiry = localStorage.getItem(APP_CONFIG.AUTH_EXPIRY_KEY)

  if (!token || !expiry) {
    return false
  }

  const now = Date.now()
  const expiryTime = parseInt(expiry, 10)

  if (now > expiryTime) {
    // Token expired, clear storage
    clearAuthentication()
    return false
  }

  return true
}

/**
 * Clear authentication data
 */
export function clearAuthentication() {
  localStorage.removeItem(APP_CONFIG.AUTH_TOKEN_KEY)
  localStorage.removeItem(APP_CONFIG.AUTH_EXPIRY_KEY)
}

