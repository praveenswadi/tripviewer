# Quick Reference Card

## Import Flickr Album (TL;DR)

```bash
# 1. Get API credentials: https://www.flickr.com/services/apps/create/
export FLICKR_API_KEY=your_key_here
export FLICKR_API_SECRET=your_secret_here

# 2. Import
npm run import:flickr "https://flickr.com/gp/user/album" trip-id "Title" "Desc" 5

# 3. Test
cp -r private-data/* public/data/
npm run dev

# 4. Deploy (code only - data separate)
vercel --prod
```

## Privacy Status

| File/Folder | In GitHub? | Public? |
|-------------|-----------|---------|
| `src/` (code) | ✅ Yes | Safe |
| `scripts/` | ✅ Yes | Safe |
| `private-data/` | ❌ No | .gitignore |
| `public/data/trips.json` | ❌ No | .gitignore |
| `public/data/trips/*.json` | ❌ No | .gitignore |

**Result:** Code is public, photo URLs are private ✅

## Commands

```bash
# Import album
npm run import:flickr <url> <id> [title] [desc] [duration]

# Dev server
npm run dev

# Build
npm run build

# Deploy
vercel --prod
```

## File Locations

```
private-data/           ← Real data (gitignored)
  ├── trips.json
  └── trips/
      └── *.json

public/data/            ← For local dev (gitignored)
  ├── trips.json        ← Copy from private-data/
  └── trips/
      └── *.json        ← Copy from private-data/

scripts/
  └── import-flickr.js  ← Import tool (safe in git)
```

## Documentation

- **FLICKR_IMPORT_SUMMARY.md** ← START HERE
- **SETUP_FLICKR.md** - Step-by-step import guide
- **PRIVACY.md** - 4 privacy options
- **DEPLOYMENT.md** - Deploy strategies

## Quick Fixes

**No images?**
```bash
cp -r private-data/* public/data/
```

**Need API credentials?**
https://www.flickr.com/services/apps/create/
Get both API Key AND Secret

**Change PIN?**
Edit `.env` → `VITE_APP_PIN=123456`

**Add trip?**
```bash
npm run import:flickr <url> <new-id>
```

**Update trip?**
```bash
npm run import:flickr <url> <same-id>  # Overwrites
```

