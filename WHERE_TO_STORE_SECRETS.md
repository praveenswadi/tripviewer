# Where to Store Flickr API Key & Secret

## Quick Answer

**Store in `.env` file** (automatically gitignored ✅)

---

## Two Ways to Set Up

### Option 1: Interactive Setup (Easiest)

```bash
npm run setup
```

This will:
- Prompt you for your Flickr API Key
- Prompt you for your Flickr API Secret
- Prompt you for your PIN
- Create `.env` file with all credentials
- ✅ Automatically gitignored

### Option 2: Manual Setup

```bash
# Copy the example
cp env.example .env

# Edit the file
nano .env
```

Add your credentials:
```env
VITE_APP_PIN=123456
VITE_PLATFORM=vercel

FLICKR_API_KEY=paste_your_key_here
FLICKR_API_SECRET=paste_your_secret_here
```

Save and close. ✅ Already gitignored!

---

## What Flickr Gives You

When you create an app at https://www.flickr.com/services/apps/create/, you get **TWO** values:

1. **API Key** (long string like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
2. **Secret** (shorter string like: `z9y8x7w6v5u4t3s2`)

**Both are needed!** Store both in your `.env` file.

---

## Security Check

### ✅ Safe to Commit
- `env.example` ← Template only, no real secrets
- `src/` ← Code reads from env vars
- `scripts/` ← No hard-coded secrets

### ❌ Never Commit
- `.env` ← Your actual secrets (gitignored)
- `.env.local` ← Local overrides (gitignored)
- `.env.production` ← Production secrets (gitignored)
- `private-data/` ← Photo URLs (gitignored)

---

## Verify Setup

```bash
# Check .env file exists
ls -la | grep ".env"

# Should show:
# .env      ← Your credentials (not in git)

# Check it's gitignored
git status

# Should NOT show .env in list of changes

# Test that variables are loaded
npm run import:flickr --help
# If you see the usage info without "FLICKR_API_KEY not set" error, it works!
```

## Troubleshooting: "FLICKR_API_KEY not set"

If you get this error even though you created `.env`:

### 1. Check .env file location
```bash
# .env MUST be in the project root
ls -la .env

# Should show the file. If not:
pwd  # Make sure you're in the right directory
```

### 2. Check .env file contents
```bash
cat .env

# Should show:
# FLICKR_API_KEY=your_actual_key
# FLICKR_API_SECRET=your_actual_secret
```

### 3. Check for spaces/syntax errors
```bash
# Bad (has quotes):
FLICKR_API_KEY="abc123"

# Good (no quotes):
FLICKR_API_KEY=abc123

# Bad (spaces around =):
FLICKR_API_KEY = abc123

# Good (no spaces):
FLICKR_API_KEY=abc123
```

### 4. Make sure dotenv is installed
```bash
npm list dotenv

# Should show dotenv@... installed
# If not:
npm install dotenv
```

### 5. Alternative: Export manually
```bash
# As a workaround, export variables before running:
export FLICKR_API_KEY=your_key_here
export FLICKR_API_SECRET=your_secret_here

# Then run import
npm run import:flickr "url" trip-id
```

---

## Quick Commands

```bash
# Setup (interactive)
npm run setup

# Test credentials
npm run import:flickr "https://flickr.com/..." test-trip

# Start dev server
npm run dev
```

---

## File Structure

```
tripviewer/
├── .env                    # ← YOUR SECRETS HERE (gitignored) ✅
├── env.example             # ← Template (safe to commit) ✅
├── .gitignore              # ← Contains .env* (protects secrets) ✅
└── src/
    └── *.js                # ← Reads from env vars, no secrets ✅
```

---

## What If I Already Committed .env?

**If you accidentally committed your `.env` file:**

1. **Remove from Git history:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from version control"
   ```

2. **Revoke compromised credentials:**
   - Go to https://www.flickr.com/services/apps/by/me
   - Delete the compromised app
   - Create a new one

3. **Update .env with new credentials:**
   ```bash
   npm run setup
   ```

4. **Verify .gitignore:**
   ```bash
   cat .gitignore | grep "\.env"
   ```

---

## Deployment (Production)

**Don't use .env in production!** Use your hosting platform's secrets:

### Vercel
```bash
vercel env add FLICKR_API_KEY production
vercel env add FLICKR_API_SECRET production
vercel env add VITE_APP_PIN production
```

### Cloudflare
```bash
npx wrangler secret put FLICKR_API_KEY
npx wrangler secret put FLICKR_API_SECRET
```

### Netlify
- Site Settings → Environment Variables → Add

---

## Full Documentation

See **CREDENTIALS_GUIDE.md** for complete details on:
- Credential rotation
- Security best practices
- Troubleshooting
- Advanced scenarios

---

## Summary

1. **Get credentials:** https://www.flickr.com/services/apps/create/
2. **Run setup:** `npm run setup`
3. **Test import:** `npm run import:flickr <url> <id>`
4. **Deploy secrets separately** (not via Git)

**Your `.env` file is automatically gitignored!** 🔒

