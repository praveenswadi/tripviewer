# Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] Updated trip data with real Flickr photo URLs
- [ ] Added background music files (optional)
- [ ] Set production PIN in environment variables
- [ ] Tested on multiple devices (desktop, mobile, tablet, TV)
- [ ] Verified all images load correctly
- [ ] Checked performance (Time to First Photo < 2s)
- [ ] Reviewed error handling and loading states

## Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Automatic deployments from Git
- ✅ Built-in analytics
- ✅ Free tier available

### Steps

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy to Preview**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add VITE_APP_PIN production
# Enter your 6-digit PIN when prompted

vercel env add VITE_PLATFORM production
# Enter: vercel
```

5. **Deploy to Production**
```bash
vercel --prod
```

### Continuous Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Connect GitHub repository
4. Set environment variables in project settings
5. Every push to `main` branch auto-deploys

### Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your domain
3. Update DNS records as instructed
4. Automatic SSL certificate provisioning

## Option 2: Deploy to Cloudflare Pages

### Why Cloudflare Pages?
- ✅ Unlimited bandwidth
- ✅ Built-in DDoS protection
- ✅ Fast global CDN
- ✅ R2 storage integration (future)
- ✅ Free tier available

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/photo-stories.git
git push -u origin main
```

2. **Connect to Cloudflare Pages**
- Go to [Cloudflare Pages](https://pages.cloudflare.com/)
- Click "Create a project"
- Connect your GitHub account
- Select your repository

3. **Configure Build Settings**
- Framework preset: None (or Vite)
- Build command: `npm run build:cloudflare`
- Build output directory: `dist`
- Root directory: `/`

4. **Environment Variables**
Add in Cloudflare Pages settings:
- `VITE_APP_PIN`: Your 6-digit PIN
- `VITE_PLATFORM`: `cloudflare`

5. **Deploy**
- Click "Save and Deploy"
- Wait for build to complete
- Your app is live!

### Custom Domain
1. Go to project settings → Custom domains
2. Add your domain
3. Update DNS (Cloudflare manages this automatically if domain is on Cloudflare)

## Option 3: Deploy to Netlify

### Steps

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build the Project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

4. **Set Environment Variables**
In Netlify dashboard:
- Go to Site settings → Environment variables
- Add `VITE_APP_PIN`
- Add `VITE_PLATFORM=netlify`

## Post-Deployment Tasks

### 1. Test Everything

Visit your deployed URL and test:
- [ ] PIN authentication works
- [ ] Trip grid loads and displays correctly
- [ ] Photos load and display properly
- [ ] Slideshow auto-play works
- [ ] Keyboard navigation (if testing on desktop)
- [ ] Touch controls (if testing on mobile)
- [ ] Background music plays (if enabled)
- [ ] Controls overlay shows/hides correctly
- [ ] Exit button returns to homepage

### 2. Performance Testing

Use browser DevTools to check:
- [ ] Time to First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Image loading is smooth
- [ ] No console errors

### 3. Device Testing

Test on actual devices:
- [ ] Desktop browser (Chrome, Safari, Firefox, Edge)
- [ ] Mobile phone (iOS Safari, Chrome)
- [ ] Tablet (iPad, Android tablet)
- [ ] **Smart TV** (LG WebOS browser) - Most important!

### 4. Share with Family

Once everything works:
1. Share the URL with your parents
2. Walk them through the PIN entry (if needed)
3. Show them how to use the remote control
4. Enjoy watching together! 🎉

## Environment Variables Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `VITE_APP_PIN` | 6-digit PIN for authentication | `123456` | Yes |
| `VITE_PLATFORM` | Deployment platform | `vercel` / `cloudflare` | Yes |

## Security Considerations

### PIN Protection
- Change default PIN (123456) in production
- Consider using a more secure PIN
- PIN is stored in localStorage (client-side only)
- For stronger security, implement server-side auth

### Flickr Images
- Ensure Flickr photos are not set to private
- Use Flickr's CDN URLs for best performance
- Consider migrating to Cloudflare R2 for full control

### HTTPS
- Always use HTTPS in production (automatically provided by Vercel/Cloudflare)
- No sensitive data is transmitted, but HTTPS ensures integrity

## Monitoring & Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `src/main.jsx`:
```javascript
import { Analytics } from '@vercel/analytics/react'

// In render
<Analytics />
```

### Custom Analytics
Consider adding:
- Trip view counts
- Average viewing duration
- Most popular trips
- Device type distribution

## Troubleshooting Deployment

### Build Fails
```bash
# Check build locally first
npm run build

# If successful locally, check environment variables in hosting dashboard
```

### Images Not Loading
- Verify Flickr URLs are publicly accessible
- Check CORS settings (Flickr should allow)
- Test URLs directly in browser

### Music Not Playing
- Check audio file paths
- Verify MP3 files are in `/public/audio/music/`
- Some browsers block autoplay (user must interact first)

### 404 on Refresh
- Verify routing configuration is in place
- Check `vercel.json` or `_redirects` file
- Ensure SPA routing is configured

## Scaling for More Users

### If Sharing Beyond Family

1. **CDN**: Already handled by Vercel/Cloudflare
2. **Image Optimization**: Use Vercel Image Optimization or Cloudflare Images
3. **Caching**: Configure cache headers for static assets
4. **Authentication**: Move to proper user accounts if needed

### Migration to R2 Storage (Future)

When ready to move away from Flickr:

1. Upload photos to Cloudflare R2
2. Update trip JSON with R2 URLs
3. Configure R2 public access
4. Update image loading logic if needed

## Cost Estimates

### Free Tier (Sufficient for Family Use)

**Vercel**
- Hobby plan: Free
- 100GB bandwidth/month
- Unlimited requests
- Perfect for family sharing

**Cloudflare Pages**
- Free tier: Unlimited bandwidth
- 500 builds/month
- Perfect for high traffic

**Total Cost: $0/month** for typical family usage

### If Scaling

Only needed if sharing publicly with thousands of users:
- Vercel Pro: $20/month (1TB bandwidth)
- Cloudflare Pro: $20/month (enhanced features)

## Backup & Maintenance

### Backup Strategy
1. Keep trip JSON files in version control
2. Backup original high-res photos separately
3. Export music attributions for compliance

### Regular Maintenance
- Update dependencies monthly: `npm update`
- Test after updates
- Add new trips as you travel
- Review and update captions

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

**Ready to Deploy?** Follow Option 1 (Vercel) for the easiest path! 🚀

