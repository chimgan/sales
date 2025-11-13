import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Item, Category, Tag, ItemStatus } from '../../types';
import { useSnackbar } from 'notistack';
import { uploadMultipleToCloudinary } from '../../utils/cloudinary';
import { useLanguage } from '../../contexts/LanguageContext';

const ItemsManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    tags: [] as string[],
    status: 'on_sale' as ItemStatus,
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchData();
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

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        price: item.price.toString(),
        discountPrice: item.discountPrice?.toString() || '',
        category: item.category,
        tags: item.tags || [],
        status: item.status,
        images: item.images || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        tags: [],
        status: 'on_sale',
        images: [],
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

      const itemData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        tags: formData.tags,
        status: formData.status,
        images: imageUrls,
        views: editingItem?.views || 0,
        updatedAt: new Date(),
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t.admin.manageItems}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          {t.admin.addItem}
        </Button>
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
            {items.map((item) => (
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
                      ${item.discountPrice}{' '}
                      <span style={{ textDecoration: 'line-through', color: '#999' }}>
                        ${item.price}
                      </span>
                    </>
                  ) : (
                    `$${item.price}`
                  )}
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Chip label={item.status} size="small" />
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
            ))}
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
