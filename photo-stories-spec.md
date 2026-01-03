# Photo Stories App - Complete Specification for Cursor AI

## Project Overview
Build a web application for sharing travel photo stories with family. The app displays photo slideshows with captions, optional audio narration, and background music. Optimized for viewing on Smart TVs (LG WebOS), tablets, and mobile devices.

## Core Requirements

### Target Users
- **Primary viewers**: Elderly parents (tech-comfortable but prefer simplicity)
- **Content creator**: Tech-savvy user who will manage photos and create stories
- **Viewing devices**: LG Smart TV (2025, WebOS), iPad, Android phones

### Key Constraints
- Maximum 20 minutes per trip/story
- 200-300 photos per trip typical
- Photo display: 4-8 seconds each (variable, user-configurable)
- Audio narration: Optional, can span multiple photos
- Background music: Royalty-free, optional

---

## Technical Stack

### Frontend
- **Framework**: Vite + React 18
- **Routing**: React Router v6
- **Styling**: CSS Modules or Tailwind CSS (developer choice)
- **State Management**: React Context or Zustand (for simple state)
- **Build Tool**: Vite

### Hosting
- **Primary**: Vercel (with Cloudflare Pages migration path)
- **Image Storage**: Start with Flickr embedding, move to Cloudflare R2 later
- **Platform-agnostic architecture**: Easy to switch hosting providers

### Authentication
- Simple 6-digit PIN entry
- Device memory (remember TV/browser after first login)
- No complex user accounts needed

---

## Data Structure

### Trip Data Format (JSON)

```json
{
  "id": "mexico-city-2024",
  "title": "Mexico City Adventure",
  "description": "Our amazing trip to Mexico City in December 2024",
  "coverImage": "https://live.staticflickr.com/.../cover.jpg",
  "createdDate": "2024-12-15",
  "totalDuration": 1200,
  
  "photos": [
    {
      "id": "photo-001",
      "url": "https://live.staticflickr.com/.../photo1.jpg",
      "caption": "Arriving at the historic center of Mexico City",
      "timestamp": "2024-12-15T10:30:00Z"
    },
    {
      "id": "photo-002",
      "url": "https://live.staticflickr.com/.../photo2.jpg",
      "caption": "The stunning Palacio de Bellas Artes",
      "timestamp": "2024-12-15T11:15:00Z"
    }
    // ... more photos
  ],
  
  "photoTimeline": {
    "photo-001": { "start": 0, "end": 6 },
    "photo-002": { "start": 6, "end": 12 },
    "photo-003": { "start": 12, "end": 18 }
    // Photo transitions - stored separately from audio
  },
  
  "audioTimeline": {
    "enabled": false,
    "audioUrl": null,
    "segments": []
    // Will be populated later when narration is added
  },
  
  "backgroundMusic": {
    "enabled": true,
    "trackId": "ambient-travel-1",
    "volume": 0.3
  }
}
```

### Trips Index (trips.json)
```json
{
  "trips": [
    {
      "id": "mexico-city-2024",
      "title": "Mexico City Adventure",
      "coverImage": "https://...",
      "photoCount": 250,
      "duration": 1200,
      "hasAudio": false,
      "createdDate": "2024-12-15"
    }
    // More trips will be added
  ]
}
```

---

## Application Architecture

### File Structure
```
photo-stories/
├── public/
│   ├── audio/
│   │   ├── music/              # Royalty-free background music
│   │   └── narration/          # User-recorded narrations (later)
│   └── data/
│       ├── trips.json          # Index of all trips
│       └── trips/
│           └── mexico-city-2024.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── PinAuth.jsx     # PIN entry component
│   │   ├── common/
│   │   │   ├── Layout.jsx      # Main app layout
│   │   │   └── Loading.jsx     # Loading states
│   │   ├── home/
│   │   │   └── TripGrid.jsx    # Grid of trip cards
│   │   └── viewer/
│   │       ├── Slideshow.jsx   # Main slideshow component
│   │       ├── Controls.jsx    # Play/pause/exit controls
│   │       ├── Countdown.jsx   # 5-second autoplay countdown
│   │       └── ProgressBar.jsx # Photo progress indicator
│   ├── hooks/
│   │   ├── useDeviceDetection.js  # Detect TV vs mobile vs tablet
│   │   ├── useKeyboardNav.js      # Handle remote control
│   │   └── useImagePreload.js     # Preload next photos
│   ├── utils/
│   │   ├── platform.js         # Platform-specific config (Vercel/Cloudflare)
│   │   ├── timeline.js         # Timeline calculations
│   │   └── storage.js          # PIN/device storage
│   ├── config/
│   │   └── constants.js        # App constants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── scripts/
│   └── import-flickr.js        # Helper to import from Flickr (future)
├── vercel.json                 # Vercel routing config
├── _redirects                  # Cloudflare routing config (for later)
├── package.json
├── vite.config.js
└── README.md
```

---

## Feature Specifications

### 1. Device Detection & Responsive Design

**Device Categories:**
1. **TV Mode** (≥1920px width OR TV user agent)
   - User agents to detect: `Web0S`, `Tizen`, `SmartTV`, `BRAVIA`
   - Auto-enable full-screen, auto-play mode
   - Large fonts (min 28px for body text)
   - Simplified controls for remote navigation

2. **Tablet Mode** (768px - 1919px)
   - Touch-optimized controls
   - Manual navigation by default
   - Medium font sizes (18-20px)

3. **Mobile Mode** (<768px)
   - Vertical layout
   - Swipe gestures
   - Compact UI
   - Font sizes (16-18px)

**Implementation:**
```javascript
// hooks/useDeviceDetection.js
export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState('desktop');
  
  useEffect(() => {
    const isTVUserAgent = /Web0S|Tizen|SmartTV|BRAVIA/i.test(navigator.userAgent);
    const screenWidth = window.innerWidth;
    
    if (isTVUserAgent || screenWidth >= 1920) {
      setDeviceType('tv');
    } else if (screenWidth >= 768) {
      setDeviceType('tablet');
    } else {
      setDeviceType('mobile');
    }
  }, []);
  
  return deviceType;
}
```

---

### 2. PIN Authentication

**Requirements:**
- 6-digit PIN code
- Simple numeric entry
- Remember device after first login
- No account system needed

**Flow:**
1. User visits site
2. Shows PIN entry screen (large number pad for TV)
3. On correct PIN, stores auth token in localStorage
4. Token expires after 30 days
5. User can access all trips

**PIN Storage:**
- Hardcoded PIN in environment variable: `VITE_APP_PIN=123456`
- In production, can be more sophisticated

**Implementation:**
```javascript
// components/auth/PinAuth.jsx
function PinAuth({ onAuthenticated }) {
  const [pin, setPin] = useState('');
  const correctPin = import.meta.env.VITE_APP_PIN || '123456';
  
  const handleSubmit = () => {
    if (pin === correctPin) {
      localStorage.setItem('auth_token', 'authenticated');
      localStorage.setItem('auth_expiry', Date.now() + 30 * 24 * 60 * 60 * 1000);
      onAuthenticated();
    } else {
      alert('Incorrect PIN');
      setPin('');
    }
  };
  
  // Render large numeric keypad for TV
  // Standard input for mobile/tablet
}
```

---

### 3. Trip Selection (Homepage)

**Layout:**
- Grid of trip cards (2-3 columns on desktop, 1-2 on mobile)
- Each card shows:
  - Cover photo
  - Trip title
  - Photo count
  - Duration
  - Date
- Click card → Navigate to trip viewer

**Implementation:**
```javascript
// components/home/TripGrid.jsx
function TripGrid() {
  const [trips, setTrips] = useState([]);
  
  useEffect(() => {
    fetch('/data/trips.json')
      .then(res => res.json())
      .then(data => setTrips(data.trips));
  }, []);
  
  return (
    <div className="trip-grid">
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
```

---

### 4. Slideshow Viewer - Core Component

**User Flow (TV Mode):**
1. User selects trip from homepage
2. Show 5-second countdown: "Starting in 5... 4... 3... 2... 1..."
3. Display [Cancel Auto-play] button during countdown
4. If not cancelled, auto-play starts:
   - Photos advance based on timeline
   - Background music plays (if enabled)
   - Controls overlay appears on mouse movement, auto-hides after 3 seconds
5. User can:
   - Press Space/Enter: Pause/Resume
   - Press Left/Right arrows: Previous/Next photo
   - Press Escape: Exit to trip selection
   - Move mouse: Show controls

**User Flow (Mobile/Tablet):**
1. User selects trip
2. Manual navigation (swipe or tap arrows)
3. Optional: Toggle auto-play mode

**Photo Timeline Logic:**
```javascript
// utils/timeline.js
export function calculatePhotoTimeline(photos, totalDuration) {
  // Distribute time evenly across all photos
  const baseDuration = totalDuration / photos.length;
  
  let currentTime = 0;
  const timeline = {};
  
  photos.forEach(photo => {
    timeline[photo.id] = {
      start: currentTime,
      end: currentTime + baseDuration
    };
    currentTime += baseDuration;
  });
  
  return timeline;
}

export function getCurrentPhotoIndex(currentTime, photoTimeline, photos) {
  for (let i = 0; i < photos.length; i++) {
    const timing = photoTimeline[photos[i].id];
    if (currentTime >= timing.start && currentTime < timing.end) {
      return i;
    }
  }
  return photos.length - 1; // Last photo
}
```

**Slideshow Component:**
```javascript
// components/viewer/Slideshow.jsx
function Slideshow({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const deviceType = useDeviceDetection();
  
  useEffect(() => {
    // Load trip data
    fetch(`/data/trips/${tripId}.json`)
      .then(res => res.json())
      .then(data => setTrip(data));
  }, [tripId]);
  
  useEffect(() => {
    // Auto-play countdown for TV
    if (deviceType === 'tv' && showCountdown) {
      const timer = setTimeout(() => {
        setShowCountdown(false);
        setIsPlaying(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deviceType, showCountdown]);
  
  useEffect(() => {
    // Playback timer
    if (!isPlaying || !trip) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= trip.totalDuration) {
          setIsPlaying(false);
          return 0; // Loop or stop
        }
        return prev + 0.1; // Update every 100ms
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, trip]);
  
  if (!trip) return <Loading />;
  
  const currentPhotoIndex = getCurrentPhotoIndex(
    currentTime, 
    trip.photoTimeline, 
    trip.photos
  );
  const currentPhoto = trip.photos[currentPhotoIndex];
  
  return (
    <div className={`slideshow slideshow--${deviceType}`}>
      {showCountdown && deviceType === 'tv' ? (
        <Countdown onCancel={() => setShowCountdown(false)} />
      ) : (
        <>
          <img 
            src={currentPhoto.url} 
            alt={currentPhoto.caption}
            className="slideshow__image"
          />
          <div className="slideshow__caption">
            {currentPhoto.caption}
          </div>
          
          <Controls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onExit={() => navigate('/')}
            currentPhoto={currentPhotoIndex + 1}
            totalPhotos={trip.photos.length}
            deviceType={deviceType}
          />
          
          {trip.backgroundMusic.enabled && (
            <audio 
              src={`/audio/music/${trip.backgroundMusic.trackId}.mp3`}
              autoPlay
              loop
              volume={trip.backgroundMusic.volume}
            />
          )}
        </>
      )}
    </div>
  );
}
```

---

### 5. Keyboard Navigation (Remote Control Support)

**Key Mappings:**
- **Space / Enter**: Toggle play/pause
- **Left Arrow**: Previous photo (jump back in timeline)
- **Right Arrow**: Next photo (jump forward in timeline)
- **Escape / Back**: Exit to trip selection
- **Number keys (1-9)**: Jump to trip N (on homepage)

**Implementation:**
```javascript
// hooks/useKeyboardNav.js
export function useKeyboardNav({ 
  onPlayPause, 
  onPrevious, 
  onNext, 
  onExit 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onPrevious, onNext, onExit]);
}
```

---

### 6. Controls Overlay

**Requirements:**
- Auto-hide after 3 seconds of inactivity (TV mode)
- Always visible on mobile/tablet
- Shows:
  - Play/Pause button
  - Exit button
  - Progress: "Photo 12 of 250"
  - Time remaining: "8:32 remaining"
  - Progress bar

**Design (TV Mode):**
```
┌────────────────────────────────────────┐
│                                        │
│         [Large Photo Display]          │
│                                        │
│    Caption text in large readable font│
│                                        │
│  ╔════════════════════════════════╗   │
│  ║ ████████████░░░░░░  Photo 12/250║  │
│  ║ 8:32 remaining                  ║  │
│  ║ [❚❚ Pause]  [✕ Exit]           ║  │
│  ╚════════════════════════════════╝   │
└────────────────────────────────────────┘
```

**Implementation:**
```javascript
// components/viewer/Controls.jsx
function Controls({ 
  isPlaying, 
  onPlayPause, 
  onExit, 
  currentPhoto, 
  totalPhotos,
  currentTime,
  totalDuration,
  deviceType 
}) {
  const [visible, setVisible] = useState(true);
  const hideTimerRef = useRef(null);
  
  // Auto-hide logic for TV
  useEffect(() => {
    if (deviceType !== 'tv') return;
    
    const handleMouseMove = () => {
      setVisible(true);
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 3000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimerRef.current);
    };
  }, [deviceType]);
  
  const progress = (currentPhoto / totalPhotos) * 100;
  const timeRemaining = formatTime(totalDuration - currentTime);
  
  return (
    <div className={`controls ${visible ? 'controls--visible' : 'controls--hidden'}`}>
      <div className="controls__progress-bar">
        <div 
          className="controls__progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="controls__info">
        Photo {currentPhoto} of {totalPhotos} · {timeRemaining} remaining
      </div>
      
      <div className="controls__buttons">
        <button onClick={onPlayPause} className="controls__button--large">
          {isPlaying ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button onClick={onExit} className="controls__button">
          ✕ Exit
        </button>
      </div>
    </div>
  );
}
```

---

### 7. Image Preloading

**Strategy:**
- Preload next 10-20 photos ahead of current position
- Prevents loading delays during slideshow
- Essential for smooth TV experience

**Implementation:**
```javascript
// hooks/useImagePreload.js
export function useImagePreload(photos, currentIndex, preloadCount = 20) {
  useEffect(() => {
    const startIndex = currentIndex;
    const endIndex = Math.min(currentIndex + preloadCount, photos.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const img = new Image();
      img.src = photos[i].url;
    }
  }, [currentIndex, photos, preloadCount]);
}
```

---

### 8. Platform Configuration (Vercel/Cloudflare)

**Goal:** Easy migration between platforms

**Platform Config:**
```javascript
// src/utils/platform.js
const PLATFORM = import.meta.env.VITE_PLATFORM || 'vercel';

const platformConfigs = {
  vercel: {
    redirectsFile: 'vercel.json',
    imageHost: 'flickr', // or 'vercel-blob' later
  },
  cloudflare: {
    redirectsFile: '_redirects',
    imageHost: 'cloudflare-r2',
  }
};

export const config = platformConfigs[PLATFORM];
```

**Build Scripts:**
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:vercel": "VITE_PLATFORM=vercel vite build",
    "build:cloudflare": "VITE_PLATFORM=cloudflare vite build",
    "preview": "vite preview"
  }
}
```

**Routing Configs:**

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**_redirects (Cloudflare Pages):**
```
/*    /index.html   200
```

---

### 9. Styling Guidelines

**Design Principles:**
- Clean, minimal interface
- Focus on photos, not UI chrome
- High contrast text (readable from 10 feet away on TV)
- Large touch/click targets (min 48px for buttons)
- Smooth transitions

**TV-Specific Styling:**
```css
/* Base styles */
.slideshow {
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  position: relative;
}

.slideshow__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slideshow__caption {
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
}

/* TV Mode overrides */
.slideshow--tv .slideshow__caption {
  font-size: 32px;
  bottom: 160px;
  padding: 30px;
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  padding: 20px;
  transition: opacity 0.3s;
}

.controls--hidden {
  opacity: 0;
  pointer-events: none;
}

.controls__button--large {
  min-width: 120px;
  min-height: 60px;
  font-size: 20px;
  border-radius: 8px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

/* TV Mode button sizes */
.slideshow--tv .controls__button--large {
  min-width: 180px;
  min-height: 80px;
  font-size: 28px;
}
```

---

### 10. Background Music

**Royalty-Free Music Tracks:**
Include 3-5 ambient/instrumental tracks similar to Apple Photos defaults:

Suggested sources:
- **Incompetech** (Creative Commons, attribution required)
- **Free Music Archive** (various licenses)
- **YouTube Audio Library** (download and include)

**Track metadata:**
```json
// public/audio/music/tracks.json
{
  "tracks": [
    {
      "id": "ambient-travel-1",
      "title": "Ambient Travel 1",
      "duration": 180,
      "file": "ambient-travel-1.mp3",
      "attribution": "Artist Name - CC BY"
    },
    {
      "id": "gentle-piano",
      "title": "Gentle Piano",
      "duration": 240,
      "file": "gentle-piano.mp3",
      "attribution": "Artist Name - CC BY"
    }
  ]
}
```

**Music Player:**
```javascript
function BackgroundMusic({ trackId, volume = 0.3, isPlaying }) {
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume]);
  
  return (
    <audio
      ref={audioRef}
      src={`/audio/music/${trackId}.mp3`}
      loop
      preload="auto"
    />
  );
}
```

---

## Mexico City Trip - Initial Data

**Sample data to create:**

```json
// public/data/trips.json
{
  "trips": [
    {
      "id": "mexico-city-2024",
      "title": "Mexico City Adventure",
      "description": "Exploring the vibrant streets, historic sites, and culinary delights of Mexico City",
      "coverImage": "https://live.staticflickr.com/65535/53450330389_3c5aee4d64_c.jpg",
      "photoCount": 250,
      "duration": 1200,
      "hasAudio": false,
      "createdDate": "2024-12-15"
    }
  ]
}
```

**Flickr Album:**
- URL: https://www.flickr.com/gp/praveenswadi/6mobW9547j
- Extract photo URLs programmatically or manually for MVP
- For MVP: Create JSON with first 20-30 photos to test

**Photo Timeline Auto-Generation:**
```javascript
// For 250 photos in 20 minutes (1200 seconds)
// Average: 1200 / 250 = 4.8 seconds per photo

// Auto-generate timeline:
const photos = [/* 250 photos from Flickr */];
const totalDuration = 1200;
const timeline = calculatePhotoTimeline(photos, totalDuration);

// Save to mexico-city-2024.json
```

---

## Development Phases

### Phase 1: Foundation (Do First)
1. ✅ Set up Vite + React project
2. ✅ Configure React Router
3. ✅ Add vercel.json for routing
4. ✅ Create basic file structure
5. ✅ Implement device detection hook
6. ✅ Create PIN authentication
7. ✅ Build trip selection homepage

**Deliverable:** Can navigate between homepage and empty trip viewer

### Phase 2: Core Slideshow (Do Second)
1. ✅ Load trip data from JSON
2. ✅ Display photos in sequence
3. ✅ Implement photo timeline logic
4. ✅ Add play/pause functionality
5. ✅ Add keyboard navigation
6. ✅ Implement 5-second countdown for TV
7. ✅ Build controls overlay with auto-hide

**Deliverable:** Working slideshow with manual control

### Phase 3: Auto-Play & Music (Do Third)
1. ✅ Auto-advance photos based on timeline
2. ✅ Integrate background music
3. ✅ Image preloading
4. ✅ Progress indicator
5. ✅ Loop/end behavior

**Deliverable:** Full auto-play experience with music

### Phase 4: Responsive & Polish (Do Fourth)
1. ✅ Mobile layout and touch controls
2. ✅ Tablet layout
3. ✅ TV-optimized styling
4. ✅ Loading states
5. ✅ Error handling
6. ✅ Performance optimization

**Deliverable:** Production-ready viewer

### Phase 5: Content (Do Fifth)
1. ✅ Extract photos from Flickr album
2. ✅ Create mexico-city-2024.json with 250 photos
3. ✅ Add captions
4. ✅ Select background music track
5. ✅ Test on actual LG TV

**Deliverable:** Mexico City trip ready to view

---

## Testing Requirements

### Browser Testing
- ✅ Chrome/Edge (desktop)
- ✅ Safari (desktop & iOS)
- ✅ Firefox
- ✅ LG WebOS Browser (primary target!)
- ✅ Android Chrome

### Device Testing
- ✅ LG Smart TV (2025 model, WebOS)
- ✅ iPad Air
- ✅ Android phone
- ✅ Desktop (1080p, 1440p, 4K)

### Feature Testing
- ✅ PIN authentication works across devices
- ✅ Auto-play countdown can be cancelled
- ✅ Photos advance at correct intervals
- ✅ Background music loops properly
- ✅ Controls overlay shows/hides correctly
- ✅ Keyboard navigation works with TV remote
- ✅ Image preloading prevents stuttering
- ✅ Direct URL navigation works (not 404)

---

## Performance Targets

- **Time to First Photo**: < 2 seconds
- **Photo Transition**: < 200ms
- **Page Load (LG TV)**: < 3 seconds
- **Image Size**: Optimize to ~200-300KB per photo
- **Total Bundle Size**: < 500KB (excluding photos/music)

---

## Future Enhancements (Not in MVP)

- Admin panel for content management
- Visual timeline editor
- Audio narration support
- Multiple audio segments
- Photo reordering
- Duration adjustment UI
- Analytics (view counts, completion rate)
- Share trips via unique URLs
- Download trips for offline viewing
- Chromecast/AirPlay support

---

## Environment Variables

```env
# .env
VITE_APP_PIN=123456
VITE_PLATFORM=vercel
```

---

## Deployment Instructions

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_APP_PIN=123456`
   - `VITE_PLATFORM=vercel`
4. Deploy

### Migration to Cloudflare Pages (Future)

1. Update build script: `npm run build:cloudflare`
2. Deploy to Cloudflare Pages via GitHub integration
3. Set environment variables in Cloudflare dashboard
4. Update DNS if using custom domain

---

## Success Criteria

**MVP is successful when:**
1. ✅ Parents can access site on LG TV by entering PIN
2. ✅ Mexico City trip loads with 250 photos
3. ✅ Auto-play starts after 5-second countdown
4. ✅ Photos advance smoothly at ~5-6 seconds each
5. ✅ Background music plays throughout
6. ✅ TV remote can pause/resume and exit
7. ✅ Total experience is under 20 minutes
8. ✅ Works on iPad and phone as well
9. ✅ No 404 errors on direct URL access or refresh
10. ✅ Parents say "this is wonderful!" 😊

---

## Priority Order for Cursor

**Build in this order:**

1. **Project setup** - Vite, React, Router, basic structure
2. **Device detection** - Hook to identify TV vs mobile
3. **PIN auth** - Simple 6-digit entry
4. **Trip homepage** - Load trips.json, display grid
5. **Basic slideshow** - Display photos in sequence
6. **Photo timeline** - Calculate and advance photos
7. **Controls** - Play/pause/exit with keyboard support
8. **Auto-play countdown** - 5-second countdown for TV
9. **Background music** - Integrate audio player
10. **Responsive styling** - Mobile, tablet, TV layouts
11. **Image preloading** - Smooth transitions
12. **Testing & polish** - Fix bugs, optimize performance

---

## Notes for Cursor AI

- Prioritize TV experience - this is the primary use case
- Keep code simple and maintainable
- Use modern React patterns (hooks, functional components)
- Add helpful comments for future admin panel integration
- Follow accessibility best practices where applicable
- Optimize for performance (image loading, bundle size)
- Make it easy to add more trips in the future

---

## Questions to Resolve During Development

1. Exact photo URLs from Flickr - may need manual extraction for MVP
2. Background music tracks - need to download and include
3. Exact timeline for Mexico City - auto-calculate vs manual adjustment
4. Device memory strategy - localStorage vs cookies
5. Error states - what to show if trip fails to load

---

**Ready to build! Start with Phase 1 and progress sequentially.**
