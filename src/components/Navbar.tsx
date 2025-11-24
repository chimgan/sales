import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdminAuthenticated, logout: adminLogout } = useAdminAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
    navigate('/');
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            component="img"
            src="/sales_logo.png"
            alt="Tece Logo"
            sx={{ height: 40, mr: 2 }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {t.navbar.title}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isAdminAuthenticated && (
            <>
              <Button
                color="secondary"
                variant="contained"
                startIcon={<AdminPanelSettingsIcon />}
                component={Link}
                to="/admin"
              >
                {t.navbar.adminPanel}
              </Button>
              <Button color="inherit" onClick={handleAdminLogout}>
                {t.navbar.adminLogout}
              </Button>
            </>
          )}

          <LanguageSelector />

          {user ? (
            <>
              <IconButton onClick={handleMenu} size="small">
                <Avatar src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  {t.navbar.myProfile}
                </MenuItem>
                <MenuItem component={Link} to="/my-ads" onClick={handleClose}>
                  {t.navbar.myAdvertisements}
                </MenuItem>
                <MenuItem onClick={handleSignOut}>{t.navbar.signOut}</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LoginIcon />}
              component={Link}
              to="/"
              onClick={() => {
                // Will be handled by HomePage's AuthDialog
                window.dispatchEvent(new CustomEvent('openAuthDialog'));
              }}
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              {t.navbar.signIn}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
