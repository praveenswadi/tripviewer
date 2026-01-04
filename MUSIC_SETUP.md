# Background Music Setup Guide

## Quick Start: Download Sample Tracks

### Step 1: Download Tracks from Incompetech

Visit **https://incompetech.com/music/royalty-free/music.html** and download these tracks:

#### Track 1: Carefree (Upbeat, Happy)
1. Search for "Carefree"
2. Click "Download MP3"
3. Save as: `carefree.mp3`
4. Move to: `public/audio/music/carefree.mp3`

#### Track 2: Clear Air (Calm, Peaceful)
1. Search for "Clear Air"
2. Click "Download MP3"
3. Save as: `clear-air.mp3`
4. Move to: `public/audio/music/clear-air.mp3`

#### Track 3: Floating Cities (Dreamy, Ambient)
1. Search for "Floating Cities"
2. Click "Download MP3"
3. Save as: `floating-cities.mp3`
4. Move to: `public/audio/music/floating-cities.mp3`

#### Track 4: Wallpaper (Light, Atmospheric)
1. Search for "Wallpaper"
2. Click "Download MP3"
3. Save as: `wallpaper.mp3`
4. Move to: `public/audio/music/wallpaper.mp3`

#### Track 5: Arcadia (Adventure)
1. Search for "Arcadia"
2. Click "Download MP3"
3. Save as: `arcadia.mp3`
4. Move to: `public/audio/music/arcadia.mp3`

### Step 2: Verify Files

After downloading, your folder should look like:
```
public/audio/music/
  ├── carefree.mp3
  ├── clear-air.mp3
  ├── floating-cities.mp3
  ├── wallpaper.mp3
  ├── arcadia.mp3
  ├── tracks.json
  └── README.md
```

## Managing Music for Your Trips

### View Available Tracks

```bash
npm run list-tracks
```

### Set Music for a Trip

```bash
npm run set-music <trip-id> <track-id> [enabled]
```

**Examples:**

```bash
# Enable "Carefree" for Mexico City trip
npm run set-music mexico-city-2024 carefree true

# Change to "Floating Cities"
npm run set-music mexico-city-2024 floating-cities true

# Disable music
npm run set-music mexico-city-2024 carefree false
```

### After Setting Music

1. **Test locally:**
   ```bash
   npm run test:local
   ```

2. **Deploy to Vercel:**
   ```bash
   npm run sync:data
   vercel --prod
   ```

## Track Selection Guide

Choose tracks based on the mood of your trip:

| Track | Mood | Best For |
|-------|------|----------|
| **Carefree** | Upbeat, cheerful | Fun family moments, celebrations |
| **Clear Air** | Calm, peaceful | Nature, landscapes, quiet moments |
| **Floating Cities** | Dreamy, ambient | Cultural sites, museums, architecture |
| **Wallpaper** | Light, atmospheric | Urban exploration, street scenes |
| **Arcadia** | Adventure | Exciting activities, outdoor adventures |

## Adding Your Own Tracks

### From Incompetech

1. Browse: https://incompetech.com/music/royalty-free/music.html
2. Search by mood/genre
3. Download MP3
4. Rename to a simple ID (e.g., `my-track.mp3`)
5. Move to `public/audio/music/`
6. Update `tracks.json`:

```json
{
  "id": "my-track",
  "title": "My Track Name",
  "duration": 180,
  "file": "my-track.mp3",
  "artist": "Kevin MacLeod",
  "attribution": "Kevin MacLeod (incompetech.com) - Licensed under Creative Commons: By Attribution 4.0 License",
  "license": "CC BY 4.0",
  "mood": "mood-type",
  "description": "Description of the track"
}
```

### From YouTube Audio Library

1. Visit: https://www.youtube.com/audiolibrary/music
2. Filter by mood/genre
3. Download track
4. Convert to MP3 if needed
5. Follow steps above

## Attribution

When using Creative Commons music from Incompetech, attribution is already included in the app footer. No additional action needed!

## File Size Recommendations

- **Quality**: 128-192 kbps MP3
- **Target size**: 2-5 MB per track
- **Duration**: 2-5 minutes (tracks loop automatically)

## Troubleshooting

### Music doesn't play
1. Check file exists in `public/audio/music/`
2. Verify file name matches `tracks.json`
3. Check browser console for errors
4. Try a different browser (some block autoplay)

### How to change music for existing trip
Just run the set-music command again with a different track ID!

```bash
npm run set-music mexico-city-2024 clear-air true
```

