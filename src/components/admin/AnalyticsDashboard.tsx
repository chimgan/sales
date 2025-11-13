import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Item, Inquiry } from '../../types';
import { useSnackbar } from 'notistack';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [itemsSnap, inquiriesSnap] = await Promise.all([
        getDocs(collection(db, 'items')),
        getDocs(collection(db, 'inquiries')),
      ]);

      setItems(
        itemsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Item[]
      );

      setInquiries(
        inquiriesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Inquiry[]
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
      enqueueSnackbar(t.admin.errorLoadingData, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalItems = items.length;
  const onSaleItems = items.filter((item) => item.status === 'on_sale').length;
  const reservedItems = items.filter((item) => item.status === 'reserved').length;
  const soldItems = items.filter((item) => item.status === 'sold').length;
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((inq) => inq.status === 'new').length;
  const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);

  // Status distribution data
  const statusData = [
    { name: t.status.onSale, value: onSaleItems, color: '#4caf50' },
    { name: t.status.reserved, value: reservedItems, color: '#ff9800' },
    { name: t.status.sold, value: soldItems, color: '#f44336' },
  ];

  // Category distribution
  const categoryMap = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Top viewed items
  const topViewedItems = [...items]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((item) => ({
      name: item.title.substring(0, 20),
      views: item.views || 0,
    }));

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
        {t.admin.analyticsDashboard}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t.admin.totalItems}
              </Typography>
              <Typography variant="h3">{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t.admin.itemsOnSale}
              </Typography>
              <Typography variant="h3" color="success.main">
                {onSaleItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t.admin.totalInquiries}
              </Typography>
              <Typography variant="h3">{totalInquiries}</Typography>
              <Typography variant="caption" color="error.main">
                {newInquiries} {t.admin.newInquiries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {t.admin.totalViews}
              </Typography>
              <Typography variant="h3">{totalViews}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t.admin.itemStatusDistribution}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t.admin.itemsByCategory}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0277BD" name={t.admin.items} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t.admin.topViewedItems}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topViewedItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#F9A03F" name={t.admin.views} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
