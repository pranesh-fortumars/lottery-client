import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageWrapper from './PageWrapper';
import ErrorBoundary from './ErrorBoundary';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'super_admin';

  const getAdminTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return isSuperAdmin ? 'SUPER ADMIN DASHBOARD' : 'ADMIN DASHBOARD';
    if (path.includes('/announcements')) return 'ADMIN BROADCAST';
    if (path.includes('/control')) return 'SYSTEM CONTROL';
    if (path.includes('/users')) return 'USER MANAGEMENT';
    if (path.includes('/reports')) return 'SYSTEM REPORTS';
    if (path.includes('/settings')) return 'ADMIN SETTINGS';
    return 'SMS LOTTERY ADMIN';
  };

  return (
    <PageWrapper title={getAdminTitle()}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </PageWrapper>
  );
};

export default AdminLayout;
