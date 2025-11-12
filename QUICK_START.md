# 🚀 Quick Start Guide - Tece Marketplace

## ⚡ 3-Step Launch

### Step 1: Setup Credentials (10 minutes)

1. **Firebase** - Go to https://console.firebase.google.com
   - Create new project
   - Enable Firestore + Authentication (Google)
   - Copy config values

2. **Cloudinary** - Go to https://cloudinary.com
   - Sign up
   - Create upload preset (set to "Unsigned")
   - Copy cloud name

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env and paste your credentials
   ```

### Step 2: Launch Docker (1 minute)

```bash
docker-compose up
```

### Step 3: Access App

- **Frontend:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin/login
  - Email: `kovtunovvladislav@gmail.com`
  - Password: `password`

---

## 📋 First Time Setup

After launching, log in as admin and:

1. **Create Categories** (Admin → Categories)
   - Home Goods
   - Auto
   - Electronics

2. **Create Tags** (Admin → Tags)
   - New
   - Used
   - Sale

3. **Add Items** (Admin → Items)
   - Upload images
   - Set prices
   - Assign categories/tags

---

## 🔧 Common Commands

```bash
# Start application
docker-compose up

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build

# Without Docker
npm install
npm run dev
```

---

## 📚 Documentation

- **Full Setup:** See `SETUP_GUIDE.md`
- **Credentials Help:** See `CREDENTIALS_TEMPLATE.md`
- **Project Info:** See `PROJECT_SUMMARY.md`
- **General Info:** See `README.md`

---

## ✅ Features Checklist

### Customer Features
- [x] Browse items with filters
- [x] View item details with images
- [x] Google authentication
- [x] Submit inquiries
- [x] View profile & inquiry history

### Admin Features
- [x] Secure login
- [x] Item CRUD operations
- [x] Image upload (Cloudinary)
- [x] Category management
- [x] Tag management
- [x] Inquiry management
- [x] Analytics dashboard

---

## 🆘 Troubleshooting

**Port 5173 already in use?**
```bash
# Edit docker-compose.yml, change port:
ports:
  - "3000:5173"
```

**Dependencies not installing?**
```bash
docker-compose down -v
docker-compose up --build
```

**Firebase errors?**
- Check `.env` file exists and has correct values
- Deploy security rules: `firebase deploy --only firestore:rules`

**Images not uploading?**
- Verify Cloudinary preset is "Unsigned"
- Check cloud name is correct

---

## 🎯 Next Steps

1. **Test Locally** - Add test items, create inquiries
2. **Deploy Firebase Rules** - `firebase deploy --only firestore:rules`
3. **Deploy to Netlify** - See `SETUP_GUIDE.md`
4. **Change Admin Password** - Update `.env`

---

## 📞 Need Help?

**Email:** kovtunovvladislav@gmail.com

**Key Files:**
- `.env` - Your credentials (create from .env.example)
- `firestore.rules` - Database security
- `docker-compose.yml` - Docker configuration
- `package.json` - Dependencies

---

**Status:** ✅ Ready to run!
**Tech Stack:** React + TypeScript + Firebase + Material-UI + Docker
**Deployment:** Netlify-ready
