import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ItemDetailPage from './pages/ItemDetailPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProfilePage from './pages/ProfilePage'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', py: 3 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
