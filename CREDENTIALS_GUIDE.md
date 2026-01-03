# Credentials Management Guide

## Where to Store API Keys & Secrets

### ⚠️ Security Rules

1. **NEVER** commit credentials to Git
2. **NEVER** share API keys publicly
3. **ALWAYS** use environment variables
4. **ALWAYS** keep `.env` in `.gitignore`

---

## Flickr API Credentials

### What You Get from Flickr

When you create an app at https://www.flickr.com/services/apps/create/, Flickr provides:

1. **API Key** - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
2. **API Secret** - Example: `z9y8x7w6v5u4t3s2`

**Both are sensitive!** Keep them private.

---

## Storage Options

### Option 1: .env File (Recommended for Local Dev)

**Step 1:** Copy the example file
```bash
cp .env.local.example .env.local
```

**Step 2:** Edit `.env.local`
```bash
nano .env.local
```

**Step 3:** Add your credentials
```env
FLICKR_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
FLICKR_API_SECRET=z9y8x7w6v5u4t3s2
VITE_APP_PIN=123456
```

**✅ Safe:** This file is in `.gitignore`

---

### Option 2: Environment Variables (Recommended for Deployment)

**For current session:**
```bash
export FLICKR_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
export FLICKR_API_SECRET=z9y8x7w6v5u4t3s2
```

**Permanently (add to ~/.zshrc or ~/.bashrc):**
```bash
echo 'export FLICKR_API_KEY=your_key' >> ~/.zshrc
echo 'export FLICKR_API_SECRET=your_secret' >> ~/.zshrc
source ~/.zshrc
```

---

### Option 3: Deployment Platform Secrets

**Vercel:**
```bash
# Set via CLI
vercel env add FLICKR_API_KEY production
vercel env add FLICKR_API_SECRET production

# Or via dashboard:
# Settings → Environment Variables → Add
```

**Cloudflare:**
```bash
# Add to wrangler.toml (use secrets, not plain text!)
[vars]
VITE_APP_PIN = "123456"

# Secrets (encrypted)
npx wrangler secret put FLICKR_API_KEY
npx wrangler secret put FLICKR_API_SECRET
```

**Netlify:**
```bash
# Via dashboard:
# Site Settings → Environment Variables → Add
```

---

## What Goes Where

| Credential | Local Dev | GitHub | Deployment |
|------------|-----------|--------|------------|
| **FLICKR_API_KEY** | `.env.local` | ❌ NO | Platform secrets |
| **FLICKR_API_SECRET** | `.env.local` | ❌ NO | Platform secrets |
| **VITE_APP_PIN** | `.env.local` | ❌ NO | Platform secrets |

---

## Checking Your Setup

### Verify .gitignore

```bash
# Check that .env files are ignored
cat .gitignore | grep "\.env"
```

Should show:
```
.env.local
.env.production
```

### Verify Credentials Are Set

```bash
# Check if variables are set
echo $FLICKR_API_KEY
echo $FLICKR_API_SECRET
```

Should show your actual values (not "your_key_here")

### Test Import

```bash
# If this works, your credentials are correct
npm run import:flickr "https://flickr.com/..." test-trip
```

---

## Common Mistakes

### ❌ DON'T: Hard-code in files
```javascript
// BAD - Don't do this!
const API_KEY = 'a1b2c3d4e5f6...'
```

### ✅ DO: Use environment variables
```javascript
// GOOD - Do this!
const API_KEY = process.env.FLICKR_API_KEY
```

### ❌ DON'T: Commit .env files
```bash
# BAD
git add .env
git commit -m "Add config"  # ← Your keys are now public!
```

### ✅ DO: Keep .env gitignored
```bash
# GOOD - .env is already in .gitignore
git status  # ← Should NOT show .env files
```

### ❌ DON'T: Share keys in issues/forums
```
"Help! My import doesn't work. Here's my key: a1b2c3..."  # ← Don't!
```

### ✅ DO: Revoke and regenerate if exposed
```
1. Go to https://www.flickr.com/services/apps/by/me
2. Delete the compromised app
3. Create a new one
4. Update your .env file
```

---

## Rotating Credentials

**When to rotate:**
- Every 6-12 months (good practice)
- If you suspect exposure
- When team members leave
- After sharing in error

**How to rotate:**

1. **Create new Flickr app** at https://www.flickr.com/services/apps/create/
2. **Update .env.local** with new credentials
3. **Update deployment secrets** in Vercel/Cloudflare/Netlify
4. **Delete old Flickr app** after confirming new one works
5. **Test import** to verify

---

## Production PIN

**Change the default PIN!**

```bash
# Edit .env.local
VITE_APP_PIN=987654  # Use your own 6-digit PIN

# Update in deployment platform
vercel env add VITE_APP_PIN production
# Enter: 987654
```

**PIN Security Tips:**
- Don't use 123456 in production
- Change every 3-6 months
- Different from other passwords
- Share only with family
- Consider using a memorable date (MMDDYY)

---

## What If Credentials Are Exposed?

### If API Keys Leaked:

1. **Immediately revoke** at https://www.flickr.com/services/apps/by/me
2. **Delete the app** that was compromised
3. **Create new app** with new credentials
4. **Update all instances** (.env, deployment, etc.)
5. **Check Flickr API usage** for suspicious activity

### If PIN Leaked:

1. **Change PIN** in `.env.local`
2. **Update deployment** with new PIN
3. **Redeploy** your app
4. **Notify family** of new PIN

---

## Security Checklist

Before pushing to GitHub:

- [ ] `.env.local` is in `.gitignore`
- [ ] `private-data/` is in `.gitignore`
- [ ] No hard-coded API keys in code
- [ ] No API keys in commit history
- [ ] Default PIN changed for production
- [ ] Deployment secrets configured

---

## File Structure (Security View)

```
tripviewer/
├── .env.local              # ❌ Gitignored - Your secrets here
├── .env.production         # ❌ Gitignored - Production secrets
├── env.example             # ✅ Safe - Template only
├── .gitignore              # ✅ Contains .env*, private-data/
├── private-data/           # ❌ Gitignored - Photo URLs
│   └── trips/
│       └── *.json          # ❌ Gitignored - Your data
├── src/                    # ✅ Safe - No secrets in code
└── scripts/                # ✅ Safe - Reads from env vars
    └── import-flickr.js
```

**GREEN ✅** = Safe to commit to GitHub  
**RED ❌** = Must stay local / Deploy separately

---

## Quick Command Reference

```bash
# Setup credentials (one time)
cp .env.local.example .env.local
nano .env.local  # Add your Flickr key & secret

# Verify setup
echo $FLICKR_API_KEY      # Should show your key
cat .gitignore | grep env # Should show .env* is ignored

# Import album
npm run import:flickr "https://flickr.com/..." trip-id

# Deploy with secrets
vercel env add FLICKR_API_KEY production
vercel env add FLICKR_API_SECRET production
vercel env add VITE_APP_PIN production
vercel --prod
```

---

## Need Help?

- **Flickr API Docs:** https://www.flickr.com/services/api/
- **Flickr App Management:** https://www.flickr.com/services/apps/by/me
- **Environment Variables:** See `env.example`
- **Privacy Options:** See `PRIVACY.md`

---

**Remember:** When in doubt, keep it secret! 🔒

