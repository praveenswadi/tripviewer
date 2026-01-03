# Photo Stories - Quick Start Guide for Cursor

## Immediate Setup Commands

```bash
# Create new project
npm create vite@latest photo-stories -- --template react
cd photo-stories

# Install dependencies
npm install react-router-dom

# Create directory structure
mkdir -p src/{components/{auth,common,home,viewer},hooks,utils,config}
mkdir -p public/{audio/music,data/trips}

# Start development
npm run dev
```

## First Files to Create

### 1. vercel.json (Root)
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

### 2. .env (Root)
```env
VITE_APP_PIN=123456
VITE_PLATFORM=vercel
```

### 3. public/data/trips.json
```json
{
  "trips": [
    {
      "id": "mexico-city-2024",
      "title": "Mexico City Adventure",
      "coverImage": "https://live.staticflickr.com/65535/53450330389_3c5aee4d64_c.jpg",
      "photoCount": 250,
      "duration": 1200,
      "hasAudio": false,
      "createdDate": "2024-12-15"
    }
  ]
}
```

### 4. src/hooks/useDeviceDetection.js
```javascript
import { useState, useEffect } from 'react';

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
    
    // Listen for resize
    const handleResize = () => {
      const width = window.innerWidth;
      if (isTVUserAgent || width >= 1920) setDeviceType('tv');
      else if (width >= 768) setDeviceType('tablet');
      else setDeviceType('mobile');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return deviceType;
}
```

### 5. src/App.jsx
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PinAuth from './components/auth/PinAuth';
import Home from './components/home/Home';
import Slideshow from './components/viewer/Slideshow';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('auth_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
    }
  }, []);
  
  if (!isAuthenticated) {
    return <PinAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip/:tripId" element={<Slideshow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Checklist for First Working Version

- [ ] Project created and running (`npm run dev`)
- [ ] vercel.json added for routing
- [ ] PIN auth works (hardcoded 123456)
- [ ] Home page loads trips from trips.json
- [ ] Can click trip and navigate to /trip/mexico-city-2024
- [ ] Basic photo display works
- [ ] Can see device detection in console

## Testing the Routing Fix

After deploying to Vercel:
1. Visit: `https://your-app.vercel.app/trip/mexico-city-2024` directly
2. Should NOT get 404
3. Refresh page - should still work
4. This confirms the vercel.json fix is working

## Mexico City Data - Quick Sample

For initial testing, create a minimal dataset:

### public/data/trips/mexico-city-2024.json (Sample with 5 photos)
```json
{
  "id": "mexico-city-2024",
  "title": "Mexico City Adventure",
  "totalDuration": 30,
  "photos": [
    {
      "id": "photo-001",
      "url": "https://live.staticflickr.com/65535/53450330389_3c5aee4d64_c.jpg",
      "caption": "Historic center of Mexico City"
    },
    {
      "id": "photo-002", 
      "url": "https://live.staticflickr.com/65535/53450455500_c977af2bcb_c.jpg",
      "caption": "Beautiful architecture"
    },
    {
      "id": "photo-003",
      "url": "https://live.staticflickr.com/65535/53450330374_f2631e5bf8_c.jpg",
      "caption": "Street scenes"
    },
    {
      "id": "photo-004",
      "url": "https://live.staticflickr.com/65535/53449144342_ef3e1e7278_c.jpg",
      "caption": "Local culture"
    },
    {
      "id": "photo-005",
      "url": "https://live.staticflickr.com/65535/53450330344_b5fb8a1e6c_c.jpg",
      "caption": "Sunset views"
    }
  ],
  "photoTimeline": {
    "photo-001": { "start": 0, "end": 6 },
    "photo-002": { "start": 6, "end": 12 },
    "photo-003": { "start": 12, "end": 18 },
    "photo-004": { "start": 18, "end": 24 },
    "photo-005": { "start": 24, "end": 30 }
  },
  "backgroundMusic": {
    "enabled": false
  }
}
```

## Key Development Tips

1. **Start Simple**: Get basic photo display working first, then add auto-play
2. **Test TV Early**: Use Chrome DevTools device emulation at 1920x1080
3. **Console Log Device Type**: Make sure detection works correctly
4. **Flickr URLs**: Use the `_c.jpg` size (800px) for good quality/performance balance
5. **Build Incrementally**: Don't try to implement everything at once

## Common Issues & Solutions

### Issue: 404 on direct URL access
**Solution**: Make sure vercel.json is in root and deployed

### Issue: Photos not loading
**Solution**: Check Flickr URLs are accessible (right-click → Open in new tab)

### Issue: Device detection not working
**Solution**: Check user agent and window.innerWidth in console

### Issue: PIN not working
**Solution**: Check localStorage in DevTools → Application tab

## Timeline Auto-Generation Script

Use this to quickly generate photo timelines:

```javascript
// utils/timeline.js
export function generateTimeline(photoCount, totalDuration) {
  const duration = totalDuration / photoCount;
  const timeline = {};
  
  for (let i = 0; i < photoCount; i++) {
    const photoId = `photo-${String(i + 1).padStart(3, '0')}`;
    timeline[photoId] = {
      start: i * duration,
      end: (i + 1) * duration
    };
  }
  
  return timeline;
}

// Usage:
// const timeline = generateTimeline(250, 1200);
// Copy to JSON file
```

## Next Steps After MVP Works

1. Add more photos to Mexico City (up to 250)
2. Add background music
3. Implement auto-play countdown
4. Polish TV remote control support
5. Test on actual LG TV
6. Optimize image loading
7. Add more trips

## Performance Checklist

- [ ] Images lazy load
- [ ] Next 10-20 photos preloaded
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90
- [ ] Works smoothly at 1920x1080 on TV

## Ready to Code!

Focus on getting the core slideshow working first. Everything else is enhancement.

**First goal**: Show photos advancing every 6 seconds with manual pause/play control.
