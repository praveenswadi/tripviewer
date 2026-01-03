# Background Music for Photo Stories

This directory contains royalty-free background music tracks for photo slideshows.

## Adding Music Files

To add background music to your photo stories:

1. Download royalty-free music from sources like:
   - **Incompetech** (https://incompetech.com/) - Creative Commons, attribution required
   - **Free Music Archive** (https://freemusicarchive.org/) - Various licenses
   - **YouTube Audio Library** (https://www.youtube.com/audiolibrary)
   - **Bensound** (https://www.bensound.com/)

2. Convert to MP3 format (recommended settings: 128-192 kbps, 44.1 kHz)

3. Name the file according to the track ID (e.g., `ambient-travel-1.mp3`)

4. Place the MP3 file in this directory

5. Update `tracks.json` with the track metadata:
   ```json
   {
     "id": "your-track-id",
     "title": "Track Title",
     "duration": 180,
     "file": "your-track-id.mp3",
     "attribution": "Artist Name - License",
     "description": "Brief description"
   }
   ```

## Example Tracks to Download

Here are some suggested tracks from Incompetech that work well for travel slideshows:

- **Carefree** by Kevin MacLeod
- **Clear Air** by Kevin MacLeod  
- **Floating Cities** by Kevin MacLeod
- **Peaceful Journey** by various artists
- **Wanderlust** by various artists

## Attribution

When using Creative Commons music, make sure to include proper attribution in your app or documentation.

Example:
> Music: "Track Name" by Artist Name (incompetech.com)
> Licensed under Creative Commons: By Attribution 4.0 License
> http://creativecommons.org/licenses/by/4.0/

## File Size Optimization

For optimal performance:
- Keep music files under 5MB each
- Use 128 kbps MP3 encoding for good quality/size balance
- Trim tracks to match your typical slideshow duration (2-5 minutes)

## Current Status

⚠️ **Note:** No actual music files are included by default. You must download and add your own royalty-free music tracks following the instructions above.

