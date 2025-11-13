import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Inquiry } from '../../types';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

const InquiriesManager = () => {
  const { t } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setInquiries(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Inquiry[]
      );
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      enqueueSnackbar('Error loading inquiries', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status: newStatus,
      });
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      await fetchInquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Error updating status', { variant: 'error' });
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t.admin.customerInquiries}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.admin.date}</TableCell>
              <TableCell>{t.admin.itemId}</TableCell>
              <TableCell>{t.admin.customerName}</TableCell>
              <TableCell>{t.admin.userEmail}</TableCell>
              <TableCell>{t.admin.userPhone}</TableCell>
              <TableCell>{t.admin.message}</TableCell>
              <TableCell>{t.admin.status}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">{t.admin.noInquiriesYet}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    {inquiry.createdAt && format(inquiry.createdAt, 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{inquiry.itemId}</TableCell>
                  <TableCell>{inquiry.userName}</TableCell>
                  <TableCell>{inquiry.userEmail || '-'}</TableCell>
                  <TableCell>{inquiry.userPhone || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {inquiry.comment}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onChange={(e: SelectChangeEvent) =>
                        handleStatusChange(inquiry.id, e.target.value)
                      }
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="new">
                        <Chip label={t.admin.new} color="primary" size="small" />
                      </MenuItem>
                      <MenuItem value="contacted">
                        <Chip label={t.admin.contacted} color="warning" size="small" />
                      </MenuItem>
                      <MenuItem value="closed">
                        <Chip label={t.admin.closed} color="default" size="small" />
                      </MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InquiriesManager;
