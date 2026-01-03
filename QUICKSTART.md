# Photo Stories - Quick Start Guide

## 🎉 What's Been Built

A complete, production-ready photo stories viewer with:

- ✅ **Phase 1 - Foundation**: Project setup, device detection, PIN auth, trip selection
- ✅ **Phase 2 - Core Slideshow**: Photo viewer, timeline, controls, keyboard navigation
- ✅ **Phase 3 - Auto-Play & Music**: Background music, auto-advance, image preloading
- ✅ **Phase 4 - Responsive & Polish**: Touch controls, error handling, loading states

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Default PIN

The default PIN is: **123456**

You can change it in `.env` file or by setting `VITE_APP_PIN` environment variable.

## 📱 Test on Different Devices

### Desktop/Laptop
- Open `http://localhost:3000` in your browser
- Use keyboard shortcuts:
  - **Space/Enter**: Play/Pause
  - **Left/Right**: Navigate photos
  - **Escape**: Exit to home

### Mobile/Tablet
- Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Open `http://YOUR_IP:3000` on your mobile device
- Use touch controls:
  - **Swipe left/right**: Navigate photos
  - **Tap**: Toggle controls

### Smart TV (LG WebOS)
- Open TV browser
- Navigate to `http://YOUR_IP:3000`
- Use remote control:
  - **OK/Enter**: Play/Pause
  - **Arrow keys**: Navigate
  - **Back**: Exit

## 🎨 Current Features

### Implemented
- ✅ PIN authentication with device memory
- ✅ Device detection (TV/Tablet/Mobile)
- ✅ Trip selection grid
- ✅ Photo slideshow with auto-play
- ✅ 5-second countdown for TV
- ✅ Keyboard navigation (remote control support)
- ✅ Touch/swipe controls for mobile
- ✅ Controls overlay with auto-hide (TV)
- ✅ Progress bar and time remaining
- ✅ Background music support
- ✅ Image preloading
- ✅ Responsive design for all devices
- ✅ Error boundaries
- ✅ Loading states

### Sample Data Included
- Mexico City trip with 10 sample photos
- Photos are placeholder URLs (you'll need to replace with real Flickr URLs)

## 📝 Next Steps

### Add Real Photos

1. Get your Flickr album photos
2. Update `/public/data/trips/mexico-city-2024.json` with real photo URLs
3. Update photo count in `/public/data/trips.json`

Example photo object:
```json
{
  "id": "photo-001",
  "url": "https://live.staticflickr.com/...",
  "caption": "Your caption here",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### Add Background Music

1. Download royalty-free music (see `/public/audio/music/README.md`)
2. Convert to MP3 and place in `/public/audio/music/`
3. Update trip JSON:
```json
{
  "backgroundMusic": {
    "enabled": true,
    "trackId": "ambient-travel-1",
    "volume": 0.3
  }
}
```

### Add More Trips

1. Create new JSON file in `/public/data/trips/`
2. Add entry to `/public/data/trips.json`
3. Follow the data structure from `mexico-city-2024.json`

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Vercel

Set these in your Vercel project settings:
- `VITE_APP_PIN`: Your 6-digit PIN
- `VITE_PLATFORM`: `vercel`

### Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Build settings:
   - Build command: `npm run build:cloudflare`
   - Output directory: `dist`
4. Set environment variables:
   - `VITE_APP_PIN`: Your PIN
   - `VITE_PLATFORM`: `cloudflare`

## 🎯 Key Files Reference

### Configuration
- `/vite.config.js` - Vite configuration
- `/vercel.json` - Vercel routing
- `/_redirects` - Cloudflare Pages routing
- `/src/config/constants.js` - App constants

### Data
- `/public/data/trips.json` - Trip index
- `/public/data/trips/*.json` - Individual trip data

### Components
- `/src/components/auth/PinAuth.jsx` - PIN authentication
- `/src/components/home/HomePage.jsx` - Trip selection
- `/src/components/viewer/Slideshow.jsx` - Main slideshow
- `/src/components/viewer/Controls.jsx` - Playback controls
- `/src/components/viewer/Countdown.jsx` - Auto-play countdown

### Hooks
- `/src/hooks/useDeviceDetection.js` - Detect TV/tablet/mobile
- `/src/hooks/useKeyboardNav.js` - Remote control support
- `/src/hooks/useTouchControls.js` - Swipe gestures
- `/src/hooks/useImagePreload.js` - Preload photos

### Utilities
- `/src/utils/timeline.js` - Photo timeline calculations
- `/src/utils/storage.js` - Auth persistence

## 🐛 Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Photos not loading
- Check that URLs in trip JSON are valid
- Open browser console for error messages
- Verify Flickr URLs are accessible

### PIN not working
- Check `.env` file exists
- Verify `VITE_APP_PIN` is set correctly
- Clear browser localStorage and try again

### TV not detecting properly
- Check if TV user agent is in `APP_CONFIG.TV_USER_AGENTS`
- Manually test by resizing browser to > 1920px width

## 📊 Performance Tips

1. **Optimize Images**: Keep photos under 300KB each
2. **Preload Count**: Adjust `PRELOAD_COUNT` in constants.js (default: 20)
3. **Photo Duration**: Balance between quality viewing time and total duration
4. **Music Files**: Use 128kbps MP3s, keep under 5MB

## 🎓 Learning Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [Flickr API](https://www.flickr.com/services/api/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 💡 Tips for Success

1. **Test on actual TV**: Emulation is good, but real device testing is essential
2. **Caption Quality**: Write clear, concise captions (max 2 lines on TV)
3. **Photo Selection**: Choose photos that look good at distance
4. **Duration**: Keep trips under 20 minutes for best engagement
5. **Music Volume**: Default 0.3 (30%) works well, adjust per trip

## 🎬 Demo Flow

1. User opens app → PIN entry screen
2. Enter PIN (123456) → Homepage with trip grid
3. Select "Mexico City Adventure" → 5-second countdown (TV only)
4. Slideshow starts → Photos auto-advance with captions
5. Use Space to pause/play, arrows to navigate
6. Press Escape to return to homepage

## 📞 Support

If you encounter issues:
1. Check console for error messages
2. Verify all file paths are correct
3. Ensure data JSON files are valid
4. Test in latest Chrome/Safari/Firefox

---

**Congratulations! Your Photo Stories app is ready to use!** 🎉

Share it with your family and enjoy watching your travel memories together on the big screen! 📺✨

