import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import ItemsManager from '../../components/admin/ItemsManager';
import CategoriesManager from '../../components/admin/CategoriesManager';
import TagsManager from '../../components/admin/TagsManager';
import InquiriesManager from '../../components/admin/InquiriesManager';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import UsersManager from '../../components/admin/UsersManager';

const AdminDashboard = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/categories')) return '/admin/categories';
    if (path.includes('/admin/tags')) return '/admin/tags';
    if (path.includes('/admin/inquiries')) return '/admin/inquiries';
    if (path.includes('/admin/analytics')) return '/admin/analytics';
    if (path.includes('/admin/users')) return '/admin/users';
    return '/admin';
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs value={getCurrentTab()}>
            <Tab label={t.admin.items} value="/admin" component={Link} to="/admin" />
            <Tab label={t.admin.categories} value="/admin/categories" component={Link} to="/admin/categories" />
            <Tab label={t.admin.tags} value="/admin/tags" component={Link} to="/admin/tags" />
            <Tab label={t.admin.inquiries} value="/admin/inquiries" component={Link} to="/admin/inquiries" />
            <Tab label={t.admin.analytics} value="/admin/analytics" component={Link} to="/admin/analytics" />
            <Tab label={t.admin.users} value="/admin/users" component={Link} to="/admin/users" />
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
          <Route path="/users" element={<UsersManager />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
