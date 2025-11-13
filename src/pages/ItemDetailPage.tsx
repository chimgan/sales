import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { doc, getDoc, updateDoc, collection, addDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, Inquiry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    comment: '',
  });

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const itemDoc = await getDoc(doc(db, 'items', id!));
      if (itemDoc.exists()) {
        const itemData = {
          id: itemDoc.id,
          ...itemDoc.data(),
          createdAt: itemDoc.data().createdAt?.toDate(),
          updatedAt: itemDoc.data().updatedAt?.toDate(),
        } as Item;
        setItem(itemData);
        
        // Increment views
        await updateDoc(doc(db, 'items', id!), {
          views: increment(1),
        });
      } else {
        enqueueSnackbar('Item not found', { variant: 'error' });
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      enqueueSnackbar('Error loading item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async () => {
    if (!inquiryForm.name || !inquiryForm.comment) {
      enqueueSnackbar('Please fill in required fields', { variant: 'warning' });
      return;
    }

    if (!inquiryForm.email && !inquiryForm.phone) {
      enqueueSnackbar('Please provide email or phone number', { variant: 'warning' });
      return;
    }

    try {
      const inquiry: Omit<Inquiry, 'id'> = {
        itemId: id!,
        userId: user?.uid,
        userName: inquiryForm.name,
        userEmail: inquiryForm.email || undefined,
        userPhone: inquiryForm.phone || undefined,
        comment: inquiryForm.comment,
        createdAt: new Date(),
        status: 'new',
      };

      await addDoc(collection(db, 'inquiries'), inquiry);
      enqueueSnackbar('Inquiry sent successfully!', { variant: 'success' });
      setInquiryDialogOpen(false);
      setInquiryForm({ name: '', email: '', phone: '', comment: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      enqueueSnackbar('Error sending inquiry', { variant: 'error' });
    }
  };

  const handleAuthAndInquiry = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        setInquiryDialogOpen(true);
      } catch (error) {
        enqueueSnackbar('Sign in required to make inquiries', { variant: 'info' });
      }
    } else {
      setInquiryForm({
        ...inquiryForm,
        name: user.displayName || '',
        email: user.email || '',
      });
      setInquiryDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!item) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_sale':
        return 'success';
      case 'reserved':
        return 'warning';
      case 'sold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_sale':
        return t.status.onSale;
      case 'reserved':
        return t.status.reserved;
      case 'sold':
        return t.status.sold;
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        {t.itemDetail.backToHome}
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box>
            <img
              src={item.images[currentImageIndex] || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={item.title}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
            />
            {item.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {item.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${item.title} ${idx + 1}`}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: idx === currentImageIndex ? '3px solid #0277BD' : 'none',
                    }}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
              {item.title}
            </Typography>
            <Chip label={getStatusLabel(item.status)} color={getStatusColor(item.status)} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline', mb: 3 }}>
            {item.discountPrice ? (
              <>
                <Typography variant="h3" color="secondary" fontWeight={700}>
                  ${item.discountPrice}
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${item.price}
                </Typography>
                <Chip
                  label={`Save $${(item.price - item.discountPrice).toFixed(2)}`}
                  color="secondary"
                  size="small"
                />
              </>
            ) : (
              <Typography variant="h3" color="primary" fontWeight={700}>
                ${item.price}
              </Typography>
            )}
          </Box>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            {item.description}
          </Typography>

          <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t.itemDetail.category}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.category}
              </Typography>

              {item.tags && item.tags.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t.itemDetail.tags}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {item.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={item.status === 'sold'}
            onClick={handleAuthAndInquiry}
            sx={{ mb: 2 }}
          >
            {item.status === 'sold' ? t.status.sold : t.itemDetail.inquireAbout}
          </Button>

          <Typography variant="caption" color="text.secondary">
            {t.common.views}: {item.views || 0}
          </Typography>
        </Grid>
      </Grid>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onClose={() => setInquiryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t.itemDetail.inquireAbout}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t.itemDetail.yourName}
              value={inquiryForm.name}
              onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={t.itemDetail.yourEmail}
              type="email"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
              fullWidth
            />
            <TextField
              label={t.itemDetail.phoneOptional}
              value={inquiryForm.phone}
              onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label={t.itemDetail.yourMessage}
              multiline
              rows={4}
              value={inquiryForm.comment}
              onChange={(e) => setInquiryForm({ ...inquiryForm, comment: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryDialogOpen(false)}>{t.itemDetail.cancel}</Button>
          <Button onClick={handleInquirySubmit} variant="contained">
            {t.itemDetail.submit}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemDetailPage;
