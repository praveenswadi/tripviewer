// App configuration constants

export const APP_CONFIG = {
  // Authentication
  AUTH_TOKEN_KEY: 'auth_token',
  AUTH_EXPIRY_KEY: 'auth_expiry',
  AUTH_EXPIRY_DAYS: 30,
  
  // Device breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1920,
  },
  
  // TV User Agents
  TV_USER_AGENTS: ['Web0S', 'webOS', 'Tizen', 'SmartTV', 'BRAVIA'],
  
  // Slideshow settings
  DEFAULT_PHOTO_DURATION: 5, // seconds
  COUNTDOWN_DURATION: 5, // seconds for auto-play countdown
  CONTROLS_HIDE_DELAY: 3000, // ms
  PRELOAD_COUNT: 20, // number of photos to preload ahead
  
  // Audio settings
  DEFAULT_MUSIC_VOLUME: 0.3,
}

export const DEVICE_TYPES = {
  TV: 'tv',
  TABLET: 'tablet',
  MOBILE: 'mobile',
}

export const DATA_PATHS = {
  TRIPS_INDEX: '/data/trips.json',
  TRIPS_DIR: '/data/trips/',
}

