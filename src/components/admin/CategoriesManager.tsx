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
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Category } from '../../types';
import { useSnackbar } from 'notistack';
import { useLanguage } from '../../contexts/LanguageContext';

const CategoriesManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'categories'));
      setCategories(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[]
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar(t.admin.errorLoadingData, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleNameChange = (name: string) => {
    setFormData({ name, slug: generateSlug(name) });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      enqueueSnackbar(t.admin.fillAllFields || 'Please fill in all fields', { variant: 'warning' });
      return;
    }

    try {
      const categoryData = {
        name: formData.name,
        slug: formData.slug,
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        enqueueSnackbar(t.admin.categoryUpdated, { variant: 'success' });
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date(),
        });
        enqueueSnackbar(t.admin.categoryAdded, { variant: 'success' });
      }

      await fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      enqueueSnackbar(t.admin.categoryDeleted, { variant: 'success' });
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      enqueueSnackbar(t.admin.errorDeleting, { variant: 'error' });
    }
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
        <Typography variant="h4">{t.admin.manageCategories}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          {t.admin.addCategory}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.admin.name}</TableCell>
              <TableCell>{t.admin.slug}</TableCell>
              <TableCell>{t.admin.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(category)} color="primary" size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} color="error" size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? t.admin.editCategory : t.admin.addCategory}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t.admin.name}
              fullWidth
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <TextField label={t.admin.slug} fullWidth value={formData.slug} disabled />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t.admin.cancel}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? t.admin.update : t.admin.create}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManager;
