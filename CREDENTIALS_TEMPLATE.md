# Credentials Setup Template

This file provides a template for setting up all required credentials for the Tece Marketplace application.

## 🔥 Firebase Credentials

### How to Get:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create new one)
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click web icon (`</>`) or select existing web app
6. Copy the config values

### Add to `.env`:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Example Values:
```env
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=tece-marketplace.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tece-marketplace
VITE_FIREBASE_STORAGE_BUCKET=tece-marketplace.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## ☁️ Cloudinary Credentials

### How to Get:
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up or log in
3. Go to Dashboard
4. Copy "Cloud Name" (visible at top)

### Create Upload Preset:
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Name it (e.g., `tece-marketplace`)
5. **IMPORTANT:** Set "Signing Mode" to **Unsigned**
6. Save

### Add to `.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Example Values:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tece-marketplace
```

---

## 🔐 Admin Credentials

### Default Values (Change in Production!):
```env
VITE_ADMIN_EMAIL=kovtunovvladislav@gmail.com
VITE_ADMIN_PASSWORD=password
```

### For Production:
```env
VITE_ADMIN_EMAIL=your-admin-email@example.com
VITE_ADMIN_PASSWORD=your-secure-password-here
```

---

## 🚀 Netlify Deployment (Optional)

### When Ready to Deploy:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Environment Variables in Netlify:
After creating site, add all the environment variables in:
- Netlify Dashboard → Site Settings → Environment Variables

Add each variable:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID
- VITE_CLOUDINARY_CLOUD_NAME
- VITE_CLOUDINARY_UPLOAD_PRESET
- VITE_ADMIN_EMAIL
- VITE_ADMIN_PASSWORD

---

## ✅ Verification Checklist

Before running the application:

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase Authentication enabled (Google provider)
- [ ] Firebase config copied to `.env`
- [ ] Cloudinary account created
- [ ] Cloudinary upload preset created (unsigned!)
- [ ] Cloudinary credentials added to `.env`
- [ ] Admin credentials set in `.env`
- [ ] `.env` file created in project root
- [ ] Firestore security rules deployed

---

## 🆘 Need Help?

### Firebase Issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Setup Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/google-signin)

### Cloudinary Issues:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Preset Guide](https://cloudinary.com/documentation/upload_presets)

### General Questions:
- Contact: kovtunovvladislav@gmail.com
