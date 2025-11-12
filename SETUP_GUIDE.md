# Tece Marketplace - Setup Guide

## Step-by-Step Setup Instructions

### 1. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `tece-marketplace` (or your choice)
4. Disable Google Analytics if not needed (or enable it)
5. Click "Create project"

#### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

#### Enable Authentication
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Click on "Google" provider
4. Enable it and add your support email
5. Click "Save"

#### Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register your app
5. Copy the `firebaseConfig` object values

#### Deploy Security Rules
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select Firestore
# Use existing project
# Accept default firestore.rules file

# Deploy rules
firebase deploy --only firestore:rules
```

### 2. Cloudinary Setup

#### Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

#### Get Cloudinary Credentials
1. Go to your Dashboard
2. Copy your **Cloud Name** (you'll see it at the top)

#### Create Upload Preset
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set preset name (e.g., `tece-marketplace`)
5. **Important:** Set Signing Mode to "Unsigned"
6. Configure folder if needed (optional)
7. Click "Save"

### 3. Environment Variables Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in the values:

```env
# Firebase Configuration (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tece-marketplace

# Admin Credentials
VITE_ADMIN_EMAIL=kovtunovvladislav@gmail.com
VITE_ADMIN_PASSWORD=password
```

### 4. Running with Docker

```bash
# Build and start the container
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

The application will be available at: http://localhost:5173

### 5. Running without Docker

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### 6. Initial Data Setup

After starting the application:

1. **Log in as Admin**
   - Go to http://localhost:5173/admin/login
   - Email: `kovtunovvladislav@gmail.com`
   - Password: `password`

2. **Create Categories**
   - Go to "Categories" tab
   - Click "Add Category"
   - Examples:
     - Home Goods
     - Auto
     - Electronics
     - Furniture
     - Clothing

3. **Create Tags**
   - Go to "Tags" tab
   - Click "Add Tag"
   - Examples:
     - New
     - Used
     - Vintage
     - Sale
     - Premium

4. **Add Items**
   - Go to "Items" tab
   - Click "Add Item"
   - Fill in the form
   - Upload images
   - Assign category and tags
   - Set price and status

### 7. Testing Customer Features

1. **Browse Items**
   - Go to home page
   - Use filters to search

2. **View Item Details**
   - Click on any item
   - View images and details

3. **Sign in with Google**
   - Click "Contact Seller"
   - Sign in with your Google account
   - Fill inquiry form

4. **View Profile**
   - After signing in, click your avatar
   - Go to "My Profile"
   - See your inquiries

### 8. Netlify Deployment

#### Method 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy
netlify deploy --prod

# Follow prompts to create new site or deploy to existing
```

#### Method 2: Git Integration

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables in Netlify dashboard
7. Deploy!

### 9. Troubleshooting

#### Docker Issues

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "3000:5173"  # Change 5173 to any available port
```

**Container won't start:**
```bash
# Remove containers and volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

#### Firebase Issues

**Permission denied errors:**
- Make sure Firestore security rules are deployed
- Check that authentication is enabled

**Auth not working:**
- Verify Google OAuth is enabled in Firebase Console
- Add your domain to authorized domains in Firebase Auth settings

#### Cloudinary Issues

**Upload failing:**
- Verify upload preset is set to "Unsigned"
- Check cloud name is correct
- Ensure preset name matches

### 10. Production Checklist

Before deploying to production:

- [ ] Change admin password in `.env`
- [ ] Update Firebase security rules for production
- [ ] Configure proper CORS settings in Firebase
- [ ] Add your production domain to Firebase authorized domains
- [ ] Set up proper Cloudinary security
- [ ] Enable Firebase Analytics (optional)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure environment variables in Netlify
- [ ] Test all features in production environment
- [ ] Set up custom domain (optional)

### 11. Next Steps

**Enhance Security:**
- Implement rate limiting
- Add CAPTCHA to inquiry form
- Use Firebase App Check

**Add Features:**
- Email notifications for inquiries
- Payment integration
- Advanced search with Algolia
- Multi-language support
- PWA features

**Optimize Performance:**
- Implement image lazy loading
- Add service worker for caching
- Optimize bundle size
- Enable CDN

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review Firebase/Cloudinary documentation
3. Contact: kovtunovvladislav@gmail.com
