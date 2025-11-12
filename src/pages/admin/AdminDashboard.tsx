import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Box, Container, Tabs, Tab } from '@mui/material';
import ItemsManager from '../../components/admin/ItemsManager';
import CategoriesManager from '../../components/admin/CategoriesManager';
import TagsManager from '../../components/admin/TagsManager';
import InquiriesManager from '../../components/admin/InquiriesManager';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const location = useLocation();
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/categories')) return '/admin/categories';
    if (path.includes('/admin/tags')) return '/admin/tags';
    if (path.includes('/admin/inquiries')) return '/admin/inquiries';
    if (path.includes('/admin/analytics')) return '/admin/analytics';
    return '/admin';
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs value={getCurrentTab()}>
            <Tab label="Items" value="/admin" component={Link} to="/admin" />
            <Tab label="Categories" value="/admin/categories" component={Link} to="/admin/categories" />
            <Tab label="Tags" value="/admin/tags" component={Link} to="/admin/tags" />
            <Tab label="Inquiries" value="/admin/inquiries" component={Link} to="/admin/inquiries" />
            <Tab label="Analytics" value="/admin/analytics" component={Link} to="/admin/analytics" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<ItemsManager />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/tags" element={<TagsManager />} />
          <Route path="/inquiries" element={<InquiriesManager />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
