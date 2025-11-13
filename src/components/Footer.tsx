import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
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
          <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 1 }}>
            {t.footer.tagline}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            <MuiLink
              component={Link}
              to="/terms"
              sx={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {t.footer.termsOfService}
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
