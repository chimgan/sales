import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated, login } = useAdminAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError(t.admin.invalidCredentials);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              {t.admin.login}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.admin.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t.admin.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
            >
              {t.admin.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminLogin;
