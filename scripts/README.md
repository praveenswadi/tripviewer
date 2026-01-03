# Photo Stories - Import Scripts

## Flickr Album Importer

Automatically fetch photos from Flickr albums and generate trip JSON files.

### Prerequisites

1. **Get Flickr API Key**
   - Go to: https://www.flickr.com/services/apps/create/
   - Click "Request an API Key"
   - Choose "Apply for a Non-Commercial Key"
   - Fill in the form (app name: "Photo Stories", description: "Personal photo viewer")
   - Copy your API Key

2. **Set Environment Variable**
   ```bash
   export FLICKR_API_KEY=your_api_key_here
   ```
   
   Or add to `.env` file:
   ```env
   FLICKR_API_KEY=your_api_key_here
   ```

### Usage

```bash
node scripts/import-flickr.js <album_url> <trip_id> [title] [description] [duration_per_photo]
```

### Examples

**Basic import:**
```bash
node scripts/import-flickr.js \
  "https://www.flickr.com/gp/praveenswadi/6mobW9547j" \
  mexico-city-2024
```

**With full details:**
```bash
node scripts/import-flickr.js \
  "https://www.flickr.com/gp/praveenswadi/6mobW9547j" \
  mexico-city-2024 \
  "Mexico City Adventure" \
  "Our amazing trip to Mexico City in December 2024" \
  6
```

**Parameters:**
- `album_url` - Flickr album URL (required)
- `trip_id` - Unique trip ID (required, e.g., "mexico-city-2024")
- `title` - Trip title (optional, default: "Photo Trip")
- `description` - Trip description (optional, default: "")
- `duration_per_photo` - Seconds per photo (optional, default: 5)

### Output

The script creates files in `private-data/` directory:
- `private-data/trips.json` - Trip index
- `private-data/trips/trip-id.json` - Individual trip data

These files are **gitignored** by default to keep your photos private.

### Workflow

1. **Import from Flickr:**
   ```bash
   node scripts/import-flickr.js "https://flickr.com/..." trip-id
   ```

2. **Review the generated files:**
   ```bash
   cat private-data/trips/trip-id.json
   ```

3. **Copy to public directory (for local testing):**
   ```bash
   cp private-data/trips.json public/data/
   cp private-data/trips/trip-id.json public/data/trips/
   ```

4. **Test locally:**
   ```bash
   npm run dev
   ```

5. **For deployment, see DEPLOYMENT.md**

### Supported Flickr URL Formats

- `https://www.flickr.com/photos/username/albums/12345678901234567`
- `https://www.flickr.com/gp/username/albumid`

### Troubleshooting

**"FLICKR_API_KEY environment variable not set"**
- Make sure you've exported the API key or added it to `.env`

**"Could not parse Flickr album URL"**
- Check that your URL matches one of the supported formats
- Make sure the album is public (not private)

**"Flickr API error: Invalid API Key"**
- Verify your API key is correct
- Check that it's properly set in the environment

**"No photos found in album"**
- Verify the album exists and is public
- Check that the album ID in the URL is correct

### API Rate Limits

Flickr's free tier allows:
- 3,600 requests per hour
- Each import uses 1 request

This is plenty for personal use!

## Future: Admin Web Interface

If you prefer a web interface instead of command-line:

```bash
npm run admin
```

(Coming soon - will provide a simple web UI to paste Flickr URLs and manage trips)

