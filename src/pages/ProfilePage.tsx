import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  List,
  ListItem,
  Chip,
  CircularProgress,
  TextField,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Inquiry } from '../types';
import { format } from 'date-fns';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { useSnackbar } from 'notistack';

const ProfilePage = () => {
  const { user, userProfile, signInWithGoogle, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || userProfile?.displayName || '',
    phoneNumber: userProfile?.phoneNumber || '',
    telegramUsername: userProfile?.telegramUsername || '',
    whatsappNumber: userProfile?.whatsappNumber || '',
  });

  useEffect(() => {
    if (user) {
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setProfileForm({
      displayName: user?.displayName || userProfile?.displayName || '',
      phoneNumber: userProfile?.phoneNumber || '',
      telegramUsername: userProfile?.telegramUsername || '',
      whatsappNumber: userProfile?.whatsappNumber || '',
    });
  }, [user?.displayName, userProfile?.phoneNumber, userProfile?.telegramUsername, userProfile?.whatsappNumber, userProfile?.displayName]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'inquiries'),
        where('userId', '==', user!.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const inquiriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Inquiry[];
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetProfileForm = () => {
    setProfileForm({
      displayName: user?.displayName || userProfile?.displayName || '',
      phoneNumber: userProfile?.phoneNumber || '',
      telegramUsername: userProfile?.telegramUsername || '',
      whatsappNumber: userProfile?.whatsappNumber || '',
    });
  };

  const handleProfileSave = async () => {
    if (!user) return;
    const trimmedName = profileForm.displayName.trim();
    if (!trimmedName) {
      enqueueSnackbar(t.profile.displayNameRequired, { variant: 'warning' });
      return;
    }

    try {
      setSavingProfile(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: trimmedName,
        phoneNumber: profileForm.phoneNumber.trim() || null,
        telegramUsername: profileForm.telegramUsername.trim() || null,
        whatsappNumber: profileForm.whatsappNumber.trim() || null,
      });
      await updateFirebaseProfile(user, { displayName: trimmedName });
      enqueueSnackbar(t.profile.updateSuccess, { variant: 'success' });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar(t.profile.updateError, { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'primary';
      case 'contacted':
        return 'warning';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t.profile.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t.itemDetail.signInToInquire}
        </Typography>
        <Button variant="contained" size="large" onClick={signInWithGoogle}>
          {t.auth.continueWithGoogle}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  {t.profile.accountInfo}
                </Typography>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Avatar
                    src={user.photoURL || undefined}
                    alt={user.displayName || 'User'}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    {user.displayName || 'Anonymous'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                {editingProfile ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.profile.contactInfo}
                    </Typography>
                    <TextField
                      label={t.profile.displayNameLabel}
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))}
                      fullWidth
                      required
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t.profile.recommendedFields}
                    </Typography>
                    <TextField
                      label={t.profile.phoneLabel}
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      fullWidth
                    />
                    <TextField
                      label={t.profile.telegramLabel}
                      value={profileForm.telegramUsername}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, telegramUsername: e.target.value }))}
                      fullWidth
                      placeholder="@username"
                    />
                    <TextField
                      label={t.profile.whatsappLabel}
                      value={profileForm.whatsappNumber}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                      fullWidth
                      placeholder="+90555..."
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={handleProfileSave}
                        disabled={savingProfile}
                      >
                        {savingProfile ? t.common.loading : t.profile.saveProfile}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingProfile(false);
                          resetProfileForm();
                        }}
                        disabled={savingProfile}
                      >
                        {t.profile.cancelEdit}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.profile.contactInfo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t.profile.contactInfoDescription}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>{t.profile.phoneLabel}:</strong> {userProfile?.phoneNumber || t.profile.notProvided}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t.profile.telegramLabel}:</strong> {userProfile?.telegramUsername || t.profile.notProvided}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t.profile.whatsappLabel}:</strong> {userProfile?.whatsappNumber || t.profile.notProvided}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={() => setEditingProfile(true)}
                    >
                      {t.profile.editProfile}
                    </Button>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                >
                  {t.navbar.signOut}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t.profile.myInquiries}
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : inquiries.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {t.profile.noInquiries}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/')}
                    >
                      {t.profile.browseItems}
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {inquiries.map((inquiry) => (
                      <ListItem
                        key={inquiry.id}
                        divider
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          py: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {t.profile.item}: {inquiry.itemId}
                          </Typography>
                          <Chip label={inquiry.status} color={getStatusColor(inquiry.status)} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {inquiry.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inquiry.createdAt && format(inquiry.createdAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;
