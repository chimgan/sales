import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
  Pagination,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, Category, Tag } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthDialog from '../components/AuthDialog';
import { formatPrice } from '../utils/currency';
import LoginIcon from '@mui/icons-material/Login';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { getMersinDistricts } from '../data/locations';

type ViewMode = 'grid' | 'list';
type ItemsPerPageOption = 10 | 15 | 30;
const ITEMS_PER_PAGE_OPTIONS: ItemsPerPageOption[] = [10, 15, 30];

const HomePage = () => {
  const { user, userProfile } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPageOption>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const districts = getMersinDistricts();
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hideWelcomeBanner') !== 'true';
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleOpenAuthDialog = () => setAuthDialogOpen(true);
    window.addEventListener('openAuthDialog', handleOpenAuthDialog);
    return () => window.removeEventListener('openAuthDialog', handleOpenAuthDialog);
  }, []);

  useEffect(() => {
    if (userProfile?.homeViewMode) {
      setViewMode(userProfile.homeViewMode);
      return;
    }
    if (typeof window === 'undefined') return;
    const savedView = localStorage.getItem('homeViewMode');
    if (savedView === 'grid' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, [userProfile?.homeViewMode]);

  useEffect(() => {
    if (userProfile?.homeItemsPerPage) {
      setItemsPerPage(userProfile.homeItemsPerPage);
      return;
    }
    if (typeof window === 'undefined') return;
    const savedItemsPerPage = Number(localStorage.getItem('homeItemsPerPage')) as ItemsPerPageOption;
    if (ITEMS_PER_PAGE_OPTIONS.includes(savedItemsPerPage)) {
      setItemsPerPage(savedItemsPerPage);
    }
  }, [userProfile?.homeItemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDistrict]);

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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDistrict =
        selectedDistrict === 'all' ||
        (item.location && item.location.toLowerCase().includes(selectedDistrict.toLowerCase()));
      return matchesSearch && matchesCategory && matchesDistrict;
    });
  }, [items, searchTerm, selectedCategory, selectedDistrict]);

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage) || 1);
      return prev > maxPage ? maxPage : prev;
    });
  }, [filteredItems.length, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );
  const shouldShowPagination = totalPages > 1;

  const persistViewPreferences = async (
    updates: Partial<{ homeViewMode: ViewMode; homeItemsPerPage: ItemsPerPageOption }>,
  ) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Error saving homepage preferences:', error);
    }
  };

  const handleViewModeChange = async (
    _event: React.MouseEvent<HTMLElement>,
    newView: ViewMode | null,
  ) => {
    if (!newView) return;
    setViewMode(newView);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('homeViewMode', newView);
    }
    await persistViewPreferences({ homeViewMode: newView });
  };

  const handleItemsPerPageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) as ItemsPerPageOption;
    if (!ITEMS_PER_PAGE_OPTIONS.includes(value)) return;
    setItemsPerPage(value);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('homeItemsPerPage', value.toString());
    }
    await persistViewPreferences({ homeItemsPerPage: value });
  };

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

        {!user && showWelcome && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              mb: 3,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <Button
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem('hideWelcomeBanner', 'true');
              }}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'primary.contrastText',
                textTransform: 'none',
                opacity: 0.8,
              }}
            >
              {t.common.close}
            </Button>
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {t.home.viewOptions}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            size="small"
            label={t.home.itemsPerPage}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            sx={{ minWidth: 140 }}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
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
            label={t.home.district}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <MenuItem value="all">{t.home.allMersinDistricts}</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district} value={district}>
                {district}
              </MenuItem>
            ))}
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
          {paginatedItems.map((item) => (
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
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    By: {item.creatorName || 'Admin'}
                  </Typography>
                  {item.location && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      📍 {item.location}
                    </Typography>
                  )}
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
          {paginatedItems.map((item) => (
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Created by: {item.creatorName || 'Admin'}
                  </Typography>
                  {item.location && (
                    <Typography variant="body2" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                      📍 {item.location}
                    </Typography>
                  )}
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

      {filteredItems.length > 0 && shouldShowPagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_event, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </Container>
  );
};

export default HomePage;
