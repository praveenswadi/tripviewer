# Setting Up Flickr Import

## Quick Start

### Step 1: Get Flickr API Key

1. Go to https://www.flickr.com/services/apps/create/
2. Click "Request an API Key"
3. Choose "Apply for a Non-Commercial Key"
4. Fill in:
   - **App Name:** Photo Stories
   - **App Description:** Personal family photo viewer
5. Accept terms and click "Submit"
6. **Copy your API Key**

### Step 2: Configure Environment

**Option A: Using .env file (Recommended)**

```bash
# Copy the example
cp env.example .env

# Edit .env and add your Flickr credentials
nano .env
```

Add these lines to `.env`:
```env
FLICKR_API_KEY=your_key_here
FLICKR_API_SECRET=your_secret_here
```

**Option B: Export as environment variables**

```bash
export FLICKR_API_KEY=your_key_here
export FLICKR_API_SECRET=your_secret_here
```

**Note:** The `.env` file is already in `.gitignore`, so your credentials are safe!

### Step 3: Import Your Album

```bash
# Basic import
npm run import:flickr "https://www.flickr.com/gp/praveenswadi/6mobW9547j" mexico-city-2024

# With full details
npm run import:flickr \
  "https://www.flickr.com/gp/praveenswadi/6mobW9547j" \
  mexico-city-2024 \
  "Mexico City Adventure" \
  "Our amazing trip to Mexico City in December 2024" \
  6
```

**Parameters:**
- Album URL (your Flickr album)
- Trip ID (e.g., "mexico-city-2024", no spaces)
- Title (optional)
- Description (optional)
- Seconds per photo (optional, default: 5)

### Step 4: Review Generated Files

```bash
# Check what was created
ls private-data/trips/

# View the trip data
cat private-data/trips/mexico-city-2024.json
```

**Important:** These files are in `private-data/` which is **gitignored**. They won't be committed to GitHub! ✅

### Step 5: Test Locally

```bash
# Copy data to public folder (for local dev only)
cp private-data/trips.json public/data/
cp private-data/trips/mexico-city-2024.json public/data/trips/

# Start dev server
npm run dev

# Open http://localhost:3000
# PIN: 123456
```

### Step 6: Deploy (Keeping Data Private)

See **PRIVACY.md** for deployment options that keep your photo URLs private.

**Quick option:**
```bash
# 1. Push code to GitHub (without data)
git add .
git commit -m "Add photo stories app"
git push

# 2. Deploy app
vercel --prod

# 3. Upload data separately (not via Git)
# - Use Vercel dashboard to upload files
# - Or use Vercel Blob storage
# - See PRIVACY.md for details
```

---

## Troubleshooting

### "FLICKR_API_KEY environment variable not set"

Even though you created `.env`? Here's how to fix it:

**Step 1: Verify .env file location**
```bash
# MUST be in project root
ls -la .env

# If missing, you're in the wrong directory or need to create it
pwd  # Check you're in /path/to/tripviewer
```

**Step 2: Check .env file syntax**
```bash
cat .env

# Should look like (NO quotes, NO spaces around =):
FLICKR_API_KEY=abc123def456
FLICKR_API_SECRET=xyz789uvw
```

**Common mistakes:**
```bash
# ❌ Wrong (has quotes):
FLICKR_API_KEY="abc123"

# ❌ Wrong (spaces):
FLICKR_API_KEY = abc123

# ✅ Correct:
FLICKR_API_KEY=abc123
```

**Step 3: Check dotenv is installed**
```bash
npm list dotenv

# Should show: dotenv@...
# If not installed:
npm install
```

**Step 4: Alternative - Export manually**
```bash
# Workaround: export before running
export FLICKR_API_KEY=your_key_here
export FLICKR_API_SECRET=your_secret_here

npm run import:flickr "url" trip-id
```

### "FLICKR_API_SECRET not set" warning

For **public albums**, the API Key alone usually works.

For **private albums** or guest pass albums, you need both:
```bash
export FLICKR_API_SECRET=your_secret_here
```

### "Could not parse Flickr album URL"

Supported formats:
- `https://www.flickr.com/photos/username/albums/1234567890`
- `https://www.flickr.com/gp/username/albumid`

Make sure your album is **public** (not private).

### "Flickr API error: Invalid API Key"

- Double-check you copied the full API key
- Make sure there are no extra spaces
- Verify the key is active at https://www.flickr.com/services/apps/by/me

### "No photos found in album"

- Check the album exists and is public
- Verify the URL is correct (try opening it in a browser)
- Make sure the album has photos

### Import works but no images show up

Check the photo URLs in the generated JSON:
```bash
cat private-data/trips/mexico-city-2024.json | grep "url"
```

Try opening one of the URLs in a browser to verify it works.

---

## Advanced Usage

### Import Multiple Albums

```bash
# Trip 1
npm run import:flickr "https://flickr.com/..." mexico-2024 "Mexico" "..." 5

# Trip 2
npm run import:flickr "https://flickr.com/..." paris-2023 "Paris" "..." 6

# Trip 3
npm run import:flickr "https://flickr.com/..." tokyo-2022 "Tokyo" "..." 5
```

All trips will be added to `private-data/trips.json` automatically.

### Customize Photo Duration

Different duration for each trip:
```bash
# Fast slideshow (3 seconds per photo)
npm run import:flickr "..." quick-trip "Quick Trip" "" 3

# Slow slideshow (10 seconds per photo)
npm run import:flickr "..." relaxed-trip "Relaxed Trip" "" 10
```

### Re-import an Album

Just run the import again with the same trip ID - it will update the existing trip:
```bash
# First import
npm run import:flickr "..." mexico-2024 "Mexico"

# Add more photos to Flickr album...

# Re-import (overwrites)
npm run import:flickr "..." mexico-2024 "Mexico City" "Updated!"
```

---

## What Gets Created

### Directory Structure

```
private-data/                    # ← Gitignored!
├── trips.json                   # Index of all trips
└── trips/
    ├── mexico-city-2024.json    # Trip 1
    ├── paris-2023.json          # Trip 2
    └── tokyo-2022.json          # Trip 3
```

### Example Trip JSON

```json
{
  "id": "mexico-city-2024",
  "title": "Mexico City Adventure",
  "description": "Our amazing trip...",
  "coverImage": "https://live.staticflickr.com/...",
  "totalDuration": 1500,
  "photos": [
    {
      "id": "photo-001",
      "url": "https://live.staticflickr.com/...",
      "caption": "Photo title from Flickr",
      "timestamp": "2024-12-15T10:30:00Z"
    }
    // ... more photos
  ]
}
```

The script automatically:
- ✅ Fetches all photos from the album
- ✅ Uses the highest quality available
- ✅ Extracts photo titles as captions
- ✅ Preserves photo timestamps
- ✅ Calculates total duration
- ✅ Updates the trips index

---

## Privacy & Security

**By default, photo URLs will NOT be committed to GitHub because:**

1. ✅ `private-data/` is in `.gitignore`
2. ✅ `public/data/trips.json` is in `.gitignore`
3. ✅ `public/data/trips/*.json` is in `.gitignore`

**This means:**
- Your code goes to GitHub ✅
- Your photo URLs stay private ✅
- You deploy data separately ✅

See **PRIVACY.md** for complete deployment strategies.

---

## Next Steps

Once you've imported your albums:

1. **Test locally** - Make sure everything looks good
2. **Customize** - Edit captions, adjust durations
3. **Add music** - See `public/audio/music/README.md`
4. **Deploy** - Follow DEPLOYMENT.md
5. **Share with family** - Give them the URL and PIN! 🎉

---

**Questions?** Check:
- `scripts/README.md` - Import script details
- `PRIVACY.md` - Privacy options
- `DEPLOYMENT.md` - Deployment guide
- `QUICKSTART.md` - General app setup

