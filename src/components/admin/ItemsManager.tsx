import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  ChipProps,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Item, Category, Tag, ItemStatus, Currency } from '../../types';
import { useSnackbar } from 'notistack';
import { uploadMultipleToCloudinary } from '../../utils/cloudinary';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPrice } from '../../utils/currency';
import { getMersinDistricts } from '../../data/locations';

const ItemsManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<string>('');
  const [savingLimit, setSavingLimit] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    currency: 'USD' as Currency,
    category: '',
    tags: [] as string[],
    status: 'on_sale' as ItemStatus,
    images: [] as string[],
    location: '',
    district: '',
    useDropdown: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const mersinDistricts = getMersinDistricts();

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  const getStatusChipColor = (status: ItemStatus): ChipProps['color'] => {
    switch (status) {
      case 'pending':
        return 'info';
      case 'reserved':
        return 'warning';
      case 'sold':
        return 'error';
      case 'on_sale':
      default:
        return 'success';
    }
  };

  useEffect(() => {
    fetchData();
    fetchDailyLimit();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsSnap, categoriesSnap, tagsSnap] = await Promise.all([
        getDocs(collection(db, 'items')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'tags')),
      ]);

      setItems(
        itemsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Item[]
      );

      setCategories(
        categoriesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[]
      );

      setTags(
        tagsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tag[]
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar(t.admin.errorLoadingData, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyLimit = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.dailyUserAdLimit !== undefined) {
          setDailyLimit(String(data.dailyUserAdLimit));
        }
      }
    } catch (error) {
      console.error('Error fetching daily limit:', error);
    }
  };

  const handleSaveDailyLimit = async () => {
    if (!dailyLimit) return;
    try {
      setSavingLimit(true);
      const limitValue = Number(dailyLimit);
      await setDoc(
        doc(db, 'settings', 'general'),
        {
          dailyUserAdLimit: limitValue,
        },
        { merge: true }
      );
      enqueueSnackbar(t.admin.dailyLimitSaved, { variant: 'success' });
    } catch (error) {
      console.error('Error saving daily limit:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setSavingLimit(false);
    }
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      const location = item.location || '';
      const isMersinLocation = location.startsWith('Mersin');
      const districtFromLocation = location.includes(' - ') ? location.split(' - ')[1] : '';
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        price: item.price.toString(),
        discountPrice: item.discountPrice?.toString() || '',
        currency: item.currency || 'USD',
        category: item.category,
        tags: item.tags || [],
        status: item.status,
        images: item.images || [],
        location: isMersinLocation ? '' : location,
        district: isMersinLocation ? districtFromLocation : '',
        useDropdown: isMersinLocation,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        discountPrice: '',
        currency: 'USD',
        category: '',
        tags: [],
        status: 'on_sale',
        images: [],
        location: '',
        district: '',
        useDropdown: true,
      });
    }
    setImageFiles([]);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setImageFiles([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.category) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    try {
      setUploading(true);
      let imageUrls = formData.images;

      // Upload new images if any
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleToCloudinary(imageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Build location string
      const locationStr = formData.useDropdown
        ? `Mersin${formData.district ? ` - ${formData.district}` : ''}`
        : formData.location;

      const itemData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        images: imageUrls,
        views: editingItem?.views || 0,
        updatedAt: new Date(),
        location: locationStr || undefined,
      };

      // Only include discountPrice if it has a value
      if (formData.discountPrice) {
        itemData.discountPrice = parseFloat(formData.discountPrice);
      }

      if (editingItem) {
        await updateDoc(doc(db, 'items', editingItem.id), itemData);
        enqueueSnackbar(t.admin.itemUpdated, { variant: 'success' });
      } else {
        await addDoc(collection(db, 'items'), {
          ...itemData,
          createdAt: new Date(),
          createdBy: 'admin',
          creatorName: 'Admin',
        });
        enqueueSnackbar(t.admin.itemAdded, { variant: 'success' });
      }

      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteDoc(doc(db, 'items', id));
      enqueueSnackbar(t.admin.itemDeleted, { variant: 'success' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar(t.admin.errorDeleting, { variant: 'error' });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">{t.admin.manageItems}</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            size="small"
            label={t.admin.statusFilter}
            value={statusFilter}
            onChange={(e: SelectChangeEvent<string>) =>
              setStatusFilter(e.target.value as ItemStatus | 'all')
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">{t.admin.allStatusesOption}</MenuItem>
            <MenuItem value="pending">{t.status.pending}</MenuItem>
            <MenuItem value="on_sale">{t.status.onSale}</MenuItem>
            <MenuItem value="reserved">{t.status.reserved}</MenuItem>
            <MenuItem value="sold">{t.status.sold}</MenuItem>
          </TextField>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            {t.admin.addItem}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {t.admin.dailyLimitTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.admin.dailyLimitDescription}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={t.admin.dailyLimitPlaceholder}
              fullWidth
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleSaveDailyLimit} disabled={savingLimit || !dailyLimit}>
              {savingLimit ? <CircularProgress size={24} /> : t.admin.save}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.admin.image}</TableCell>
              <TableCell>{t.admin.title}</TableCell>
              <TableCell>{t.admin.price}</TableCell>
              <TableCell>{t.admin.category}</TableCell>
              <TableCell>{t.admin.status}</TableCell>
              <TableCell>{t.admin.views}</TableCell>
              <TableCell>{t.admin.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">{t.admin.nothingFound}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.images[0] || 'https://via.placeholder.com/50'}
                      alt={item.title}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {item.discountPrice ? (
                      <>
                        {formatPrice(item.discountPrice, item.currency || 'USD')}{' '}
                        <span style={{ textDecoration: 'line-through', color: '#999' }}>
                          {formatPrice(item.price, item.currency || 'USD')}
                        </span>
                      </>
                    ) : (
                      formatPrice(item.price, item.currency || 'USD')
                    )}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Chip label={item.status} size="small" color={getStatusChipColor(item.status) as any} />
                  </TableCell>
                  <TableCell>{item.views || 0}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} color="primary" size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? t.admin.editItem : t.admin.addNewItem}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label={`${t.admin.title} ${t.admin.required}`}
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t.admin.description}
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${t.admin.price} ${t.admin.required}`}
                fullWidth
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.admin.discountPrice}
                fullWidth
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${t.admin.currency} ${t.admin.required}`}
                fullWidth
                select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              >
                <MenuItem value="TRY">{t.currency.TRY}</MenuItem>
                <MenuItem value="USD">{t.currency.USD}</MenuItem>
                <MenuItem value="EUR">{t.currency.EUR}</MenuItem>
                <MenuItem value="RUB">{t.currency.RUB}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${t.admin.category} ${t.admin.required}`}
                fullWidth
                select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t.admin.status}
                fullWidth
                select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
              >
                <MenuItem value="on_sale">{t.status.onSale}</MenuItem>
                <MenuItem value="reserved">{t.status.reserved}</MenuItem>
                <MenuItem value="sold">{t.status.sold}</MenuItem>
              </TextField>
            </Grid>

            {/* Location Section */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.useDropdown}
                    onChange={(e) =>
                      setFormData({ ...formData, useDropdown: e.target.checked, district: '', location: '' })
                    }
                  />
                }
                label="Use Mersin District Dropdown"
              />
            </Grid>

            {formData.useDropdown ? (
              <Grid item xs={12}>
                <TextField
                  label="District"
                  fullWidth
                  select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                >
                  <MenuItem value="">Select District</MenuItem>
                  {mersinDistricts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  label="Location (Manual Entry)"
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mersin - Tece"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t.admin.tags}</InputLabel>
                <Select
                  multiple
                  value={formData.tags}
                  onChange={(e: SelectChangeEvent<string[]>) =>
                    setFormData({ ...formData, tags: e.target.value as string[] })
                  }
                  input={<OutlinedInput label={t.admin.tags} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                {t.admin.uploadImages}
                <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
              </Button>
              {imageFiles.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {imageFiles.length} {t.admin.filesSelected}
                </Typography>
              )}
            </Grid>
            {formData.images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t.admin.currentImages}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.images.map((img, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      <img
                        src={img}
                        alt={`Item ${idx + 1}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' },
                        }}
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t.admin.cancel}</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : editingItem ? t.admin.update : t.admin.create}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemsManager;
