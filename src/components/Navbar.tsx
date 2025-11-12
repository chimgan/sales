import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdminAuthenticated, logout: adminLogout } = useAdminAuth();
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
        <ShoppingBagIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
          }}
        >
          Tece Marketplace
        </Typography>

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
                Admin Panel
              </Button>
              <Button color="inherit" onClick={handleAdminLogout}>
                Admin Logout
              </Button>
            </>
          )}

          {user ? (
            <>
              <IconButton onClick={handleMenu} size="small">
                <Avatar src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              component={Link}
              to="/admin/login"
            >
              Admin Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
