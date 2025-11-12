# Tece Marketplace

A modern e-commerce marketplace platform for selling home goods, auto, and various items. Built with React, TypeScript, Firebase, and Material-UI.

\![React](https://img.shields.io/badge/React-18-blue) \![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) \![Firebase](https://img.shields.io/badge/Firebase-10-orange) \![Material--UI](https://img.shields.io/badge/Material--UI-5-blue)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/tece-marketplace.git
cd tece-marketplace

# Copy environment variables
cp .env.example .env
# Edit .env with your Firebase and Cloudinary credentials

# Start with Docker (recommended)
docker-compose up

# Or without Docker
npm install
npm run dev
```

Access the application at: **http://localhost:5173**

---

## ✨ Features

### Customer Features
- 🛍️ Browse items with advanced filtering
- 🔍 Search by category, status, and keywords
- 📸 View item details with image galleries
- 🔐 Google OAuth authentication
- 💬 Submit inquiries for items
- 👤 Personal profile with inquiry history

### Admin Features
- 🔒 Secure admin authentication
- ➕ Create, edit, delete items
- 📂 Category and tag management
- ☁️ Cloudinary image uploads
- 📊 Analytics dashboard with charts
- 📝 Inquiry management system

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** Material-UI (MUI)
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Image Storage:** Cloudinary
- **Charts:** Recharts
- **Deployment:** Netlify
- **Development:** Docker

---

## 📚 Documentation Index

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed local development setup
- **[CREDENTIALS_TEMPLATE.md](./CREDENTIALS_TEMPLATE.md)** - How to obtain API keys and credentials

### Deployment
- **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** - Complete Netlify deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification checklist

### Reference
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete technical overview and architecture

---

## 🔧 Configuration

### Required Environment Variables

Create a `.env` file with the following variables (see `../.env.example`):

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... (see .env.example for all variables)

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Admin
VITE_ADMIN_EMAIL=your-admin@example.com
VITE_ADMIN_PASSWORD=your_secure_password
```

See [CREDENTIALS_TEMPLATE.md](./CREDENTIALS_TEMPLATE.md) for details on obtaining these values.

---

## 📦 Project Structure

```
tece-marketplace/
├── docs/                    # Documentation
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   └── admin/         # Admin panel components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Page components
│   │   └── admin/         # Admin pages
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── netlify.toml          # Netlify deployment config
└── firestore.rules       # Firebase security rules
```

---

## 🚀 Deployment

Deploy to Netlify with automatic builds:

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy\!

See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for detailed instructions.

---

## 🔒 Security

- ✅ Environment variables for all secrets
- ✅ Firebase security rules implemented
- ✅ Admin authentication required
- ✅ HTTPS enforced (via Netlify)
- ✅ Unsigned Cloudinary uploads (secure for client-side)

### Security Notice

All example credentials in this documentation are **placeholders**. You must:
- Replace them with your actual credentials in `.env` file (never commit `.env`)
- Use `../.env.example` as a template
- Keep your Firebase API keys, Cloudinary credentials, and admin passwords secure

**Never commit real credentials to version control\!**

---

## 📁 Documentation Files

### QUICK_START.md
Fast-track guide to get the application running locally in 5 minutes using Docker.

### SETUP_GUIDE.md
Comprehensive setup instructions covering:
- Firebase project configuration
- Cloudinary account setup  
- Environment variable configuration
- Docker and local development
- Initial data setup

### CREDENTIALS_TEMPLATE.md
Step-by-step instructions for obtaining:
- Firebase API keys and configuration
- Cloudinary cloud name and upload preset
- Setting up admin credentials

### NETLIFY_DEPLOY.md
Complete deployment guide including:
- Git integration deployment
- Manual CLI deployment
- Environment variable configuration
- Post-deployment tasks
- Troubleshooting common issues

### DEPLOYMENT_CHECKLIST.md
Pre-deployment verification covering:
- Code and configuration checks
- Security review
- Environment variables checklist
- Testing requirements

### PROJECT_SUMMARY.md
Technical documentation including:
- Complete feature list
- Technology stack details
- Project structure
- Data models
- Security features
- Cost estimates

---

## 🔧 Related Files

- **`../.env.example`** - Template for environment variables
- **`../firestore.rules`** - Firebase security rules
- **`../netlify.toml`** - Netlify deployment configuration
- **`../docker-compose.yml`** - Docker development environment

---

## 🎯 Quick Navigation

### For First-Time Setup
1. Read [QUICK_START.md](./QUICK_START.md) for fastest setup
2. Follow [CREDENTIALS_TEMPLATE.md](./CREDENTIALS_TEMPLATE.md) to get your API keys
3. Use [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration

### For Deployment
1. Complete [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Follow [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for deployment

### For Technical Details
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for complete architecture

---

## 📝 License

Private project for personal use.

---

## 🆘 Support

For questions or issues:
- Check the documentation files above
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for troubleshooting
- See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) before deploying

---

## 🎉 Credits

Built with ❤️ using modern web technologies.

---

**Documentation Version:** 1.0  
**Last Updated:** November 2025
