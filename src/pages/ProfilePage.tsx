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
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Inquiry } from '../types';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { user, userProfile, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, [user]);

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
          Sign in to view your profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Connect with Google to track your inquiries and manage your profile
        </Typography>
        <Button variant="contained" size="large" onClick={signInWithGoogle}>
          Sign in with Google
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
              <CardContent sx={{ textAlign: 'center' }}>
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
                {userProfile?.phoneNumber && (
                  <Typography variant="body2" color="text.secondary">
                    {userProfile.phoneNumber}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  My Inquiries
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : inquiries.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    You haven't made any inquiries yet
                  </Typography>
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
                            Item ID: {inquiry.itemId}
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
