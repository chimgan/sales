import { Box, Container, Typography, Link as MuiLink } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            © {new Date().getFullYear()} Tece Marketplace. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Buy and sell home goods, auto, and more with confidence
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
