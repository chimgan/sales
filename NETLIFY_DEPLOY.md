# Netlify Deployment Guide

## 🚀 Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Netlify account (free tier works perfectly)
- Firebase and Cloudinary credentials ready

---

## 📋 Deployment Methods

### Method 1: Git Integration (Recommended)

#### Step 1: Push to Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Tece Marketplace"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/tece-marketplace.git

# Push
git push -u origin main
```

#### Step 2: Connect to Netlify

1. **Go to Netlify:** https://app.netlify.com
2. **Click "Add new site"** → "Import an existing project"
3. **Connect your Git provider** (GitHub/GitLab/Bitbucket)
4. **Select your repository:** `tece-marketplace`
5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20

#### Step 3: Add Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:



⚠️ **Important:** Change `VITE_ADMIN_PASSWORD` to a secure password for production!

#### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (2-3 minutes)
3. Your site is live! 🎉

---

### Method 2: Netlify CLI (Manual Deploy)

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

#### Step 3: Build the Project

```bash
npm run build
```

#### Step 4: Deploy

```bash
# First deployment
netlify deploy

# Follow prompts:
# - Create & configure a new site
# - Choose team
# - Site name (e.g., tece-marketplace)
# - Publish directory: dist

# After successful test, deploy to production
netlify deploy --prod
```

---

## ⚙️ Configuration Files

### `netlify.toml` (Already Configured)

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

This configuration:
- ✅ Sets Node.js version to 20
- ✅ Specifies build command and output directory
- ✅ Enables client-side routing with redirect rules

---

## 🔧 Post-Deployment Setup

### 1. Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Under **Authorized domains**, add your Netlify domain:
   - `your-site-name.netlify.app`
   - If you have a custom domain, add that too

### 2. Test All Features

- ✅ Homepage loads
- ✅ Items display correctly
- ✅ Admin login works
- ✅ Image uploads work (Cloudinary)
- ✅ Google authentication works
- ✅ Item creation/editing works

### 3. Set Up Custom Domain (Optional)

In Netlify Dashboard:
1. **Domain settings** → "Add custom domain"
2. Follow DNS configuration instructions
3. Enable HTTPS (automatic with Let's Encrypt)

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed admin password from default
- [ ] Reviewed Firestore security rules
- [ ] Updated Firebase authorized domains
- [ ] Enabled HTTPS on custom domain
- [ ] Tested all authentication flows
- [ ] Verified Cloudinary upload preset is unsigned
- [ ] Removed any test data from database

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
- **Solution:** Make sure `package.json` has all dependencies
- Run `npm install` locally to verify

**Error:** `Build exceeded timeout`
- **Solution:** Optimize image sizes, reduce dependencies

### Authentication Not Working

**Error:** `auth/unauthorized-domain`
- **Solution:** Add Netlify domain to Firebase authorized domains

### Images Not Uploading

**Error:** `Unknown API key`
- **Solution:** Verify Cloudinary environment variables in Netlify
- Check upload preset is set to "Unsigned"

### Routes Return 404

**Error:** Direct URLs don't work
- **Solution:** Verify `netlify.toml` redirect rules are present

---

## 📊 Monitoring & Analytics

### Netlify Analytics

1. Go to Netlify Dashboard → Analytics
2. Enable analytics (optional, paid feature)
3. View traffic, bandwidth, and performance

### Firebase Analytics

Already configured in the app - view data in:
- Firebase Console → Analytics

---

## 🔄 Continuous Deployment

With Git integration, Netlify automatically:
- ✅ Builds on every push to main branch
- ✅ Creates preview deployments for pull requests
- ✅ Rolls back easily to previous deployments

### Branch Deploys

Configure branch deploys in Netlify:
- **Production:** `main` branch
- **Staging:** `develop` branch
- **Preview:** Pull requests

---

## 💰 Costs

### Netlify Free Tier
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Form handling

### Firebase Free Tier (Spark Plan)
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 1GB storage
- ✅ 10GB bandwidth/month

### Cloudinary Free Tier
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Unlimited transformations

**Total:** $0/month for small to medium traffic sites! 🎉

---

## 📞 Support

If deployment fails:
- Check Netlify build logs
- Review environment variables
- Verify all credentials are correct
- Contact: kovtunovvladislav@gmail.com

---

**Ready to deploy?** Follow Method 1 for the easiest setup with automatic deployments!
