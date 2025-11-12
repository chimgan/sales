# Tece Marketplace

A modern e-commerce marketplace platform for selling home goods, auto, and various items. Built with React, TypeScript, Firebase, and Material-UI.

## Features

### Customer Features
- Browse items with advanced filtering (category, status, search)
- View detailed item information with image galleries
- Google OAuth authentication for customers
- Create inquiries for items with contact information
- Personal profile with inquiry history

### Admin Features
- Secure admin authentication
- Complete item management (CRUD operations)
- Category and tag management
- Cloudinary image upload integration
- Inquiry management system
- Analytics dashboard with charts and statistics
- Real-time data synchronization

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** Material-UI (MUI)
- **Backend:** Firebase (Firestore, Auth, Analytics)
- **Image Storage:** Cloudinary
- **Charts:** Recharts
- **Deployment:** Netlify
- **Containerization:** Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (if running without Docker)
- Firebase account
- Cloudinary account
- Netlify account (for deployment)

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd /home/vlad/Projects/sales
   ```

2. **Create environment file**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. **Configure Firebase**
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Authentication (Google provider)
   - Enable Analytics
   - Copy your Firebase config to `.env`

4. **Configure Cloudinary**
   - Create account at https://cloudinary.com
   - Create an upload preset (unsigned)
   - Add credentials to `.env`

5. **Deploy Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Running with Docker (Recommended)

```bash
# Build and start the container
docker-compose up

# The app will be available at http://localhost:5173
```

### Running without Docker

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
/home/vlad/Projects/sales/
├── src/
│   ├── components/          # Reusable components
│   │   ├── admin/          # Admin panel components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProtectedAdminRoute.tsx
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   ├── HomePage.tsx
│   │   ├── ItemDetailPage.tsx
│   │   └── ProfilePage.tsx
│   ├── contexts/           # React contexts
│   ├── config/             # Configuration files
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── theme.ts
├── public/                 # Static assets
├── Dockerfile
├── docker-compose.yml
├── firestore.rules         # Firebase security rules
├── netlify.toml           # Netlify configuration
└── package.json

```

## Admin Access

- **URL:** `/admin/login`
- **Email:** kovtunovvladislav@gmail.com
- **Password:** password

## Deployment to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   netlify deploy --prod
   ```

3. **Or connect your Git repository**
   - Push code to GitHub
   - Connect repository in Netlify dashboard
   - Configure environment variables
   - Deploy automatically on push

## Environment Variables

Required environment variables (see `.env.example`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_ADMIN_EMAIL`
- `VITE_ADMIN_PASSWORD`

## Development

```bash
# Run linter
npm run lint

# Type checking
npm run type-check
```

## Features Roadmap

- [x] Item listing and filtering
- [x] Item detail view
- [x] Admin authentication
- [x] Admin CRUD operations
- [x] Category and tag management
- [x] Customer authentication (Google)
- [x] Inquiry system
- [x] Analytics dashboard
- [x] Cloudinary integration
- [x] Docker support
- [ ] Email notifications
- [ ] Payment integration
- [ ] Advanced search with Algolia
- [ ] Multi-language support

## License

Private project for personal use.

## Support

For questions or issues, please contact: kovtunovvladislav@gmail.com
