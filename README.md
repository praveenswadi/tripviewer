# Photo Stories - Travel Memories Viewer

A web application for sharing travel photo stories with family, optimized for Smart TVs (LG WebOS), tablets, and mobile devices.

## ✨ New: Automatic Flickr Import!

Import photos from any Flickr album with one command:

### For Public Albums (API-based)
```bash
export FLICKR_API_KEY=your_key
npm run import:flickr "https://flickr.com/photos/user/albums/12345" trip-id
```

### For Private Albums (Web Scraping)
```bash
# Works with guest pass URLs - no API key needed!
npm run import:private "https://flickr.com/gp/user/album" trip-id

# Debug mode (saves HTML and shows detailed logs)
npm run import:private:debug "https://flickr.com/gp/user/album" trip-id
```

**See [FLICKR_IMPORT_SUMMARY.md](FLICKR_IMPORT_SUMMARY.md) for complete guide!**

## Features

- **PIN Authentication** - Simple 6-digit PIN entry with device memory
- **Device Detection** - Automatically optimizes UI for TV, tablet, and mobile
- **Photo Slideshows** - Auto-play slideshows with customizable durations
- **Background Music** - Optional royalty-free background music
- **Responsive Design** - Works beautifully on all devices
- **Keyboard Navigation** - Full remote control support for Smart TVs

## Tech Stack

- **Frontend**: Vite + React 18
- **Routing**: React Router v6
- **Styling**: CSS Modules
- **Hosting**: Vercel (with Cloudflare Pages migration path)
- **Image Storage**: Flickr (with future migration to Cloudflare R2)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_PIN=123456
VITE_PLATFORM=vercel
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Build for specific platform
npm run build:vercel
npm run build:cloudflare

# Preview production build
npm run preview
```

## Project Structure

```
photo-stories/
├── public/
│   ├── audio/              # Background music and narration
│   └── data/               # Trip JSON data
│       ├── trips.json      # Index of all trips
│       └── trips/          # Individual trip data
├── src/
│   ├── components/
│   │   ├── auth/           # PIN authentication
│   │   ├── home/           # Homepage and trip grid
│   │   └── viewer/         # Slideshow viewer
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── config/             # App configuration
└── ...
```

## Adding New Trips

1. Add photos to your image host (Flickr, Cloudflare R2, etc.)
2. Create a new trip JSON file in `public/data/trips/`
3. Add the trip entry to `public/data/trips.json`
4. Follow the data structure defined in the specification

## Device Support

### Tested Devices
- ✅ LG Smart TV (WebOS)
- ✅ iPad Air
- ✅ Android phones
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)

### Key Features by Device

**TV Mode:**
- Auto-play countdown (5 seconds)
- Large, readable text (28px+)
- Remote control navigation
- Auto-hiding controls

**Tablet Mode:**
- Touch-optimized controls
- Medium font sizes
- Swipe gestures

**Mobile Mode:**
- Compact UI
- Native touch controls
- Vertical layout

## Keyboard Shortcuts

- **Space / Enter**: Play/Pause
- **Left/Right Arrows**: Previous/Next photo
- **Escape**: Exit to trip selection
- **1-9**: Select trip by number (on homepage)

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Cloudflare Pages

1. Connect your GitHub repository
2. Set build command: `npm run build:cloudflare`
3. Set output directory: `dist`
4. Add environment variables in dashboard
5. Deploy

## Performance Targets

- **Time to First Photo**: < 2 seconds
- **Photo Transition**: < 200ms
- **Page Load (TV)**: < 3 seconds
- **Bundle Size**: < 500KB (excluding media)

## Future Enhancements

- Admin panel for content management
- Visual timeline editor
- Audio narration support
- Multiple audio segments
- Analytics (view counts, completion rate)
- Share trips via unique URLs
- Chromecast/AirPlay support

## License

MIT

## Author

Built with ❤️ for family photo sharing

