import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, Category, Tag } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthDialog from '../components/AuthDialog';
import { formatPrice } from '../utils/currency';
import LoginIcon from '@mui/icons-material/Login';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

const HomePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleOpenAuthDialog = () => setAuthDialogOpen(true);
    window.addEventListener('openAuthDialog', handleOpenAuthDialog);
    return () => window.removeEventListener('openAuthDialog', handleOpenAuthDialog);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch items
      const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const itemsSnapshot = await getDocs(itemsQuery);
      const itemsData = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Item[];
      setItems(itemsData);

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Category[];
      setCategories(categoriesData);

      // Fetch tags
      const tagsSnapshot = await getDocs(collection(db, 'tags'));
      const tagsData = tagsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Tag[];
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {t.home.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t.home.subtitle}
        </Typography>

        {!user && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              mb: 3,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t.home.welcomeTitle}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t.home.welcomeText}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setAuthDialogOpen(true)}
              startIcon={<LoginIcon />}
            >
              {t.home.signInSignUp}
            </Button>
          </Paper>
        )}
      </Box>

      {/* Filters and View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          {t.home.category}
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newView) => newView && setViewMode(newView)}
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label={t.home.searchItems}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label={t.home.category}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="all">{t.home.allCategories}</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label={t.home.status}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="all">{t.home.allStatuses}</MenuItem>
            <MenuItem value="on_sale">{t.status.onSale}</MenuItem>
            <MenuItem value="reserved">{t.status.reserved}</MenuItem>
            <MenuItem value="sold">{t.status.sold}</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            {t.home.noItemsFound}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {items.length === 0 ? t.home.checkBackLater : t.home.noItemsText}
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description.substring(0, 100)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {item.discountPrice ? (
                      <>
                        <Typography variant="h5" color="primary" fontWeight={700}>
                          {formatPrice(item.discountPrice, item.currency || 'USD')}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {formatPrice(item.price, item.currency || 'USD')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h5" color="primary" fontWeight={700}>
                        {formatPrice(item.price, item.currency || 'USD')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/item/${item.id}`}
                    fullWidth
                  >
                    {t.home.viewDetails}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredItems.map((item) => (
            <Card key={item.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              <CardMedia
                component="img"
                sx={{
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 200, sm: 'auto' },
                  objectFit: 'cover',
                }}
                image={item.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={item.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h5" component="h2" fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {item.discountPrice ? (
                      <>
                        <Typography variant="h4" color="primary" fontWeight={700}>
                          {formatPrice(item.discountPrice, item.currency || 'USD')}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          {formatPrice(item.price, item.currency || 'USD')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h4" color="primary" fontWeight={700}>
                        {formatPrice(item.price, item.currency || 'USD')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/item/${item.id}`}
                  >
                    {t.home.viewDetails}
                  </Button>
                </CardActions>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </Container>
  );
};

export default HomePage;
