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
import { Tag } from '../../types';
import { useSnackbar } from 'notistack';
import { useLanguage } from '../../contexts/LanguageContext';

const TagsManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLanguage();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'tags'));
      setTags(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tag[]
      );
    } catch (error) {
      console.error('Error fetching tags:', error);
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

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name, slug: tag.slug });
    } else {
      setEditingTag(null);
      setFormData({ name: '', slug: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTag(null);
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
      const tagData = {
        name: formData.name,
        slug: formData.slug,
      };

      if (editingTag) {
        await updateDoc(doc(db, 'tags', editingTag.id), tagData);
        enqueueSnackbar(t.admin.tagUpdated, { variant: 'success' });
      } else {
        await addDoc(collection(db, 'tags'), tagData);
        enqueueSnackbar(t.admin.tagAdded, { variant: 'success' });
      }

      await fetchTags();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tag:', error);
      enqueueSnackbar(t.common.error, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteDoc(doc(db, 'tags', id));
      enqueueSnackbar(t.admin.tagDeleted, { variant: 'success' });
      await fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
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
        <Typography variant="h4">{t.admin.manageTags}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          {t.admin.addTag}
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
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(tag)} color="primary" size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(tag.id)} color="error" size="small">
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
        <DialogTitle>{editingTag ? t.admin.editTag : t.admin.addTag}</DialogTitle>
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
            {editingTag ? t.admin.update : t.admin.create}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagsManager;
