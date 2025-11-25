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
import { doc, getDoc, updateDoc, collection, addDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, Inquiry, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSnackbar } from 'notistack';
import { formatPrice, getCurrencySymbol } from '../utils/currency';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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
  const [ownerContact, setOwnerContact] = useState<Pick<UserProfile, 'phoneNumber' | 'telegramUsername' | 'whatsappNumber'> | null>(null);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setOwnerContact(null);
      const itemDoc = await getDoc(doc(db, 'items', id!));
      if (itemDoc.exists()) {
        const itemData = {
          id: itemDoc.id,
          ...itemDoc.data(),
          createdAt: itemDoc.data().createdAt?.toDate(),
          updatedAt: itemDoc.data().updatedAt?.toDate(),
        } as Item;
        setItem(itemData);
        if (itemData.createdBy) {
          loadOwnerContact(itemData.createdBy);
        }

        // Increment views
        await updateDoc(doc(db, 'items', id!), {
          views: increment(1),
        });
      } else {
        enqueueSnackbar(t.itemDetail.itemNotFound, { variant: 'error' });
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      enqueueSnackbar(t.itemDetail.errorLoadingItem, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadOwnerContact = async (ownerId: string) => {
    try {
      const ownerSnap = await getDoc(doc(db, 'users', ownerId));
      if (!ownerSnap.exists()) {
        setOwnerContact(null);
        return;
      }
      const data = ownerSnap.data() as Pick<UserProfile, 'phoneNumber' | 'telegramUsername' | 'whatsappNumber'>;
      setOwnerContact({
        phoneNumber: data.phoneNumber || undefined,
        telegramUsername: data.telegramUsername || undefined,
        whatsappNumber: data.whatsappNumber || undefined,
      });
    } catch (error) {
      console.error('Error loading owner contact info:', error);
      setOwnerContact(null);
    }
  };

  const handleInquirySubmit = async () => {
    if (!inquiryForm.name || !inquiryForm.comment) {
      enqueueSnackbar(t.itemDetail.fillRequiredFields, { variant: 'warning' });
      return;
    }

    if (!inquiryForm.email && !inquiryForm.phone) {
      enqueueSnackbar(t.itemDetail.provideEmailOrPhone, { variant: 'warning' });
      return;
    }

    if (!item) {
      enqueueSnackbar(t.itemDetail.errorSendingInquiry, { variant: 'error' });
      return;
    }

    try {
      const ownerId = item.createdBy;
      const participants = [ownerId, user?.uid].filter((participant): participant is string => Boolean(participant));

      const inquiryPayload: any = {
        itemId: id!,
        itemTitle: item.title,
        ownerId,
        ownerName: item.creatorName || 'Admin',
        userName: inquiryForm.name,
        comment: inquiryForm.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'new',
        lastMessageText: inquiryForm.comment,
        participants,
        hiddenFor: [],
        unreadFor: ownerId ? [ownerId] : [],
      };

      if (user?.uid) {
        inquiryPayload.userId = user.uid;
      }
      if (inquiryForm.email) {
        inquiryPayload.userEmail = inquiryForm.email;
      }
      if (inquiryForm.phone) {
        inquiryPayload.userPhone = inquiryForm.phone;
      }

      console.log('Submitting inquiry:', inquiryPayload);
      const inquiryRef = await addDoc(collection(db, 'inquiries'), inquiryPayload);

      await addDoc(collection(db, 'inquiries', inquiryRef.id, 'messages'), {
        senderId: user?.uid || 'guest',
        senderName: inquiryForm.name,
        text: inquiryForm.comment,
        createdAt: serverTimestamp(),
      });

      await updateDoc(inquiryRef, {
        lastMessageAt: serverTimestamp(),
      });

      enqueueSnackbar(t.itemDetail.inquirySentSuccess, { variant: 'success' });
      setInquiryDialogOpen(false);
      setInquiryForm({ name: '', email: '', phone: '', comment: '' });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      console.error('Error details:', error.message, error.code);
      enqueueSnackbar(t.itemDetail.errorSendingInquiry, { variant: 'error' });
    }
  };

  const handleAuthAndInquiry = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        setInquiryDialogOpen(true);
      } catch (error) {
        enqueueSnackbar(t.itemDetail.signInRequired, { variant: 'info' });
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

  const phoneLink = ownerContact?.phoneNumber ? `tel:${ownerContact.phoneNumber}` : undefined;
  const telegramHandle = ownerContact?.telegramUsername
    ? ownerContact.telegramUsername.startsWith('@')
      ? ownerContact.telegramUsername
      : `@${ownerContact.telegramUsername}`
    : undefined;
  const telegramLink = ownerContact?.telegramUsername
    ? `https://t.me/${ownerContact.telegramUsername.replace(/^@/, '')}`
    : undefined;
  const whatsappDigits = ownerContact?.whatsappNumber?.replace(/[^0-9]/g, '') || '';
  const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}` : undefined;
  const hasDirectContacts = Boolean(ownerContact && (ownerContact.phoneNumber || ownerContact.telegramUsername || ownerContact.whatsappNumber));
  const isAuthenticated = Boolean(user);

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

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            📝 Created by: <strong>{item.creatorName || 'Admin'}</strong>
          </Typography>

          {item.location && (
            <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
              📍 {item.location}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            {item.discountPrice ? (
              <>
                <Typography variant="h3" color="primary" fontWeight={700}>
                  {formatPrice(item.discountPrice, item.currency || 'USD')}
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {formatPrice(item.price, item.currency || 'USD')}
                </Typography>
                <Chip
                  label={`${t.common.save || 'Save'} ${getCurrencySymbol(item.currency || 'USD')}${(item.price - item.discountPrice).toFixed(2)}`}
                  color="secondary"
                  size="small"
                />
              </>
            ) : (
              <Typography variant="h3" color="primary" fontWeight={700}>
                {formatPrice(item.price, item.currency || 'USD')}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t.itemDetail.description}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {item.description}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t.itemDetail.publishDate || 'Published'}: {item.createdAt?.toLocaleDateString?.() || ''}
          </Typography>

          {isAuthenticated ? (
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
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {t.itemDetail.authRequiredMessage}
                </Typography>
                <Button variant="contained" onClick={handleAuthAndInquiry}>
                  {t.auth.signIn}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t.itemDetail.directContactTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t.itemDetail.directContactHint}
              </Typography>
              {isAuthenticated ? (
                hasDirectContacts ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {ownerContact?.phoneNumber && (
                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      component="a"
                      href={phoneLink}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {t.profile.phoneLabel}: {ownerContact.phoneNumber}
                    </Button>
                  )}
                  {ownerContact?.telegramUsername && (
                    <Button
                      variant="outlined"
                      startIcon={<TelegramIcon />}
                      component="a"
                      href={telegramLink}
                      target="_blank"
                      rel="noopener"
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {t.profile.telegramLabel}: {telegramHandle}
                    </Button>
                  )}
                  {ownerContact?.whatsappNumber && whatsappLink && (
                    <Button
                      variant="outlined"
                      startIcon={<WhatsAppIcon />}
                      component="a"
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener"
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {t.profile.whatsappLabel}: {ownerContact.whatsappNumber}
                    </Button>
                  )}
                </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t.itemDetail.noDirectContacts}
                  </Typography>
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t.itemDetail.authRequiredContacts}
                </Typography>
              )}
            </CardContent>
          </Card>

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
