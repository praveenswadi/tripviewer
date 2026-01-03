# Privacy & Security Guide

## The Problem

You want to share photos with family, but:
- ❌ Don't want photo URLs public on GitHub
- ❌ Don't want anyone to scrape your Flickr albums
- ❌ Want to control who can access the photos

## Solutions (Choose One)

### Option 1: Private Data Directory (Recommended for Simple Setup)

**How it works:**
- Store trip JSON files in `private-data/` (gitignored)
- Deploy data separately from code
- GitHub only has the app code, not the photo URLs

**Setup:**

1. **Import from Flickr:**
   ```bash
   export FLICKR_API_KEY=your_key
   npm run import:flickr "https://flickr.com/..." trip-id
   ```
   
   This creates files in `private-data/` (gitignored)

2. **For local development:**
   ```bash
   cp -r private-data/* public/data/
   npm run dev
   ```

3. **For deployment:**
   
   **Vercel:**
   ```bash
   # Deploy code
   vercel --prod
   
   # Upload data separately (not in git)
   # Option A: Use Vercel CLI to upload
   vercel env add TRIP_DATA < private-data/trips.json
   
   # Option B: Manually upload via Vercel dashboard
   # Go to Storage → Upload files
   ```
   
   **Cloudflare:**
   ```bash
   # Use Cloudflare R2 for storage
   npx wrangler r2 bucket create photo-stories-data
   npx wrangler r2 object put photo-stories-data/trips.json --file private-data/trips.json
   ```

**Pros:**
- ✅ Simple to set up
- ✅ Data never in GitHub
- ✅ Full control

**Cons:**
- ⚠️ Manual deployment step for data
- ⚠️ URLs still accessible if someone knows them

---

### Option 2: Backend API with Authentication

**How it works:**
- Store photos in private cloud storage (Cloudflare R2, AWS S3)
- Create an API that requires authentication
- Frontend fetches photos through your API

**Setup:**

1. **Upload photos to private storage:**
   ```bash
   # Cloudflare R2 (recommended - free 10GB)
   npx wrangler r2 bucket create photo-stories-private
   # Upload with access control
   ```

2. **Create API endpoint:**
   ```javascript
   // api/trips/[id].js (Vercel serverless function)
   export default async function handler(req, res) {
     // Verify PIN
     const { pin } = req.headers
     if (pin !== process.env.SECRET_PIN) {
       return res.status(401).json({ error: 'Unauthorized' })
     }
     
     // Fetch from private R2 bucket
     const trip = await fetchFromR2(req.query.id)
     
     // Generate temporary signed URLs (expire in 1 hour)
     const signedTrip = await signPhotos(trip)
     
     res.json(signedTrip)
   }
   ```

3. **Update frontend to use API**

**Pros:**
- ✅ Photos truly private
- ✅ Signed URLs expire
- ✅ Can track access
- ✅ Can revoke access

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires backend API
- ⚠️ May cost $ for storage/bandwidth

---

### Option 3: Encrypt Photo URLs

**How it works:**
- Encrypt photo URLs before committing to GitHub
- Decrypt at runtime using environment variable

**Setup:**

1. **Encrypt trip data:**
   ```bash
   npm run encrypt:data private-data/trips.json
   # Creates: public/data/trips.encrypted
   ```

2. **Set decryption key:**
   ```env
   VITE_ENCRYPTION_KEY=your-secret-key-32-chars
   ```

3. **Frontend decrypts at runtime:**
   ```javascript
   const encryptedData = await fetch('/data/trips.encrypted')
   const decrypted = decrypt(encryptedData, import.meta.env.VITE_ENCRYPTION_KEY)
   ```

**Pros:**
- ✅ Data encrypted in GitHub
- ✅ Simple deployment
- ✅ No backend needed

**Cons:**
- ⚠️ Decryption key in environment variable
- ⚠️ URLs visible in browser after decrypt
- ⚠️ Moderate security (better than plain text)

---

### Option 4: Password-Protected Flickr + Direct Embedding

**How it works:**
- Make Flickr album private
- Generate guest pass link
- Embed photos using guest pass

**Setup:**

1. **Make album private in Flickr**
2. **Create guest pass:** Flickr → Album → Share → "Guest Pass"
3. **Use guest pass URL in import script**

**Pros:**
- ✅ Flickr handles access control
- ✅ Simple to set up
- ✅ Can revoke guest pass anytime

**Cons:**
- ⚠️ Depends on Flickr
- ⚠️ Limited guest pass lifetime
- ⚠️ Still visible to anyone with guest pass

---

## Recommended Approach

### For Family-Only Sharing (Most Common)

**Use Option 1 (Private Data Directory) with PIN protection:**

1. **Import photos** (data stays in `private-data/`, gitignored)
2. **Deploy app code only** to Vercel/Cloudflare
3. **Upload data separately** using deployment platform's storage
4. **Share PIN** only with family (change periodically)

**Security level:** Medium
- GitHub: No photo URLs ✅
- Public access: Blocked by PIN ✅
- Direct URL access: Possible if someone guesses URL ⚠️

This is **good enough for 99% of use cases** - your family can view photos, but they won't appear in search engines or be accessible without the PIN.

### For Maximum Security

**Use Option 2 (Backend API):**

1. Upload photos to **private** cloud storage (R2/S3)
2. Use **signed URLs** that expire
3. Implement **proper authentication**
4. Add **rate limiting** and **access logs**

**Security level:** High
- Complete control over access ✅
- URLs expire ✅
- Can revoke access ✅
- Audit who views what ✅

---

## Quick Start (Option 1)

```bash
# 1. Get Flickr API key
export FLICKR_API_KEY=your_key

# 2. Import album
npm run import:flickr "https://flickr.com/gp/user/album" trip-id "Trip Title"

# 3. Review (data is in private-data/, not tracked by git)
ls private-data/trips/

# 4. Test locally
cp -r private-data/* public/data/
npm run dev

# 5. Deploy (see deployment commands below)
```

### Deployment Commands

**Vercel (with private data):**
```bash
# Deploy app
vercel --prod

# Upload data via Vercel Storage (not in git)
# Method 1: Environment variable
vercel env add TRIPS_DATA production < private-data/trips.json

# Method 2: Vercel Blob Storage (requires Vercel Blob addon)
npm install @vercel/blob
# Then upload via blob API
```

**Cloudflare (with R2):**
```bash
# Create R2 bucket
npx wrangler r2 bucket create photo-stories-data

# Upload data files
npx wrangler r2 object put photo-stories-data/trips.json \
  --file private-data/trips.json

# Update app to fetch from R2
# (Update DATA_PATHS in constants.js)
```

---

## Additional Security Tips

1. **Change PIN regularly** (monthly or after sharing with new people)
2. **Use strong PIN** (not 123456 in production!)
3. **Enable auth expiry** (already set to 30 days)
4. **Monitor access logs** (add analytics if needed)
5. **Use HTTPS only** (automatic with Vercel/Cloudflare)
6. **Add rate limiting** (prevent brute force PIN attacks)
7. **Watermark photos** (optional - protect against downloads)

---

## FAQs

**Q: Is PIN protection secure enough?**
A: For family sharing, yes. It's like a shared password. For public-facing apps, use proper authentication.

**Q: Can someone download my photos?**
A: Yes, if they have access. Use watermarks or Option 2 (signed URLs) if this is a concern.

**Q: How do I revoke access?**
A: Change the PIN in environment variables and redeploy.

**Q: What if someone finds a photo URL directly?**
A: With Option 1, they could access it. Use Option 2 (signed URLs) for time-limited access.

**Q: Can I use Google Photos instead of Flickr?**
A: Yes! Just modify the import script to use Google Photos API instead.

---

Choose the option that balances convenience and security for your needs. For most families, **Option 1 is perfect**! 🎉

