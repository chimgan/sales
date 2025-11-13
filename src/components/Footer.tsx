import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

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
            © {new Date().getFullYear()} Tece Marketplace. {t.footer.copyright}.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            {t.footer.tagline}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
