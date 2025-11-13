import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAuthErrorMessage } from '../utils/authErrors';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}

const AuthDialog = ({ open, onClose }: AuthDialogProps) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  const [tabValue, setTabValue] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      const errorMessage = err.code ? getAuthErrorMessage(err.code, t) : t.auth.signInFailed;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError(t.auth.fillAllFields);
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signInWithEmail(email, password);
      onClose();
    } catch (err: any) {
      const errorMessage = err.code ? getAuthErrorMessage(err.code, t) : t.auth.signInFailed;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !displayName) {
      setError(t.auth.fillAllFields);
      return;
    }
    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
      onClose();
    } catch (err: any) {
      const errorMessage = err.code ? getAuthErrorMessage(err.code, t) : t.auth.signUpFailed;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setTabValue(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} centered>
          <Tab label={t.auth.signIn} />
          <Tab label={t.auth.signUp} />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Google Sign In */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {t.auth.continueWithGoogle}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t.auth.or}
          </Typography>
        </Divider>

        {/* Email/Password Form */}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabValue === 1 && (
            <TextField
              label={t.auth.displayName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
          )}
          <TextField
            label={t.auth.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label={t.auth.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            helperText={tabValue === 1 ? t.auth.passwordHint : ''}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          {tabValue === 0 ? t.auth.noAccount : t.auth.haveAccount}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t.auth.cancel}
        </Button>
        <Button
          onClick={tabValue === 0 ? handleEmailSignIn : handleEmailSignUp}
          variant="contained"
          disabled={loading}
        >
          {tabValue === 0 ? t.auth.signIn : t.auth.signUp}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
