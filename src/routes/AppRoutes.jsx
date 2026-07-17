import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PermissionRoute from './PermissionRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SignIn from '../pages/Auth/SignIn';
import LandingPage from '../pages/Auth/LandingPage';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import NotFound from '../pages/Auth/NotFound';
import Maintenance from '../pages/Auth/Maintenance';
import TermsAndConditions from '../pages/Auth/TermsAndConditions';
import PrivacyPolicy from '../pages/Auth/PrivacyPolicy';
import RefundPolicy from '../pages/Auth/RefundPolicy';
import config from '../config';

// Set to true to put the application in Maintenance Mode; false for normal operation.
const IS_MAINTENANCE = false;

// Admin Pages
import AdminDashboardPage from '../pages/Admin/Dashboard';
import { AdminQueuePage } from '../pages/Admin/SubmissionsQueue';
import { AdminEvaluationPage } from '../pages/Admin/EvaluationConsole';
import { AssignAccessPage } from '../pages/Admin/AssignAccess';
import { AdminFacultyProfilesPage } from '../pages/Admin/FacultyProfiles';

// Faculty Pages
import { UploadPage } from '../pages/Faculty/UploadManuscript';
import { PublicationsPage } from '../pages/Faculty/MyPublications';
import { ProfilePage } from '../pages/Shared/Profile';

// Developer Pages
import { AssignRolePage } from '../pages/Developer/AssignRole';

const RootRoute = ({ landingPageEnabled, loading }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    if (currentUser.role?.toLowerCase() === 'developer') return <Navigate to="/developer/assign-role" replace />;
    if (currentUser.role?.toLowerCase() === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/faculty/publications" replace />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (landingPageEnabled) {
    return <LandingPage />;
  }

  return <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  const [landingPageEnabled, setLandingPageEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/auth/system-settings`);
        const resData = await response.json();
        if (resData.success) {
          setLandingPageEnabled(resData.data.landing_page_enabled);
        }
      } catch (err) {
        console.error('Failed to load system settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (IS_MAINTENANCE) {
    return (
      <Routes>
        <Route path="*" element={<Maintenance />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RootRoute landingPageEnabled={landingPageEnabled} loading={loading} />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/queue" element={<PageWrapper Component={AdminQueuePage} />} />
          <Route path="/admin/evaluation" element={<PageWrapper Component={AdminEvaluationPage} />} />
          <Route path="/admin/evaluation/:id" element={<PageWrapper Component={AdminEvaluationPage} />} />
          <Route path="/admin/assign-access" element={<PageWrapper Component={AssignAccessPage} />} />
          <Route path="/admin/upload" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/admin/upload/:categoryId" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/admin/publications" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/admin/publications/:id" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/admin/publication/:id" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/admin/profile" element={<PageWrapper Component={ProfilePage} />} />
          <Route path="/admin/faculty" element={<PageWrapper Component={AdminFacultyProfilesPage} />} />
          <Route path="/admin/faculty/:user_id" element={<PageWrapper Component={AdminFacultyProfilesPage} />} />
        </Route>

        {/* Faculty Routes */}
        <Route element={<RoleRoute allowedRoles={['Faculty']} />}>
          <Route path="/faculty/upload" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/faculty/upload/:categoryId" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/faculty/publications" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/faculty/publications/:id" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/faculty/publication/:id" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/faculty/profile" element={<PageWrapper Component={ProfilePage} />} />

          {/* Temporary Admin Routes — reuses existing Admin page components, guarded by permission */}
          <Route path="/faculty/dashboard" element={<PermissionRoute pageId="dashboard"><AdminDashboardPage /></PermissionRoute>} />
          <Route path="/faculty/queue" element={<PermissionRoute pageId="queue"><PageWrapper Component={AdminQueuePage} /></PermissionRoute>} />
          <Route path="/faculty/evaluation" element={<PermissionRoute pageId="queue"><PageWrapper Component={AdminEvaluationPage} /></PermissionRoute>} />
          <Route path="/faculty/evaluation/:id" element={<PermissionRoute pageId="queue"><PageWrapper Component={AdminEvaluationPage} /></PermissionRoute>} />
          <Route path="/faculty/assign-access" element={<PermissionRoute pageId="assign_access"><PageWrapper Component={AssignAccessPage} /></PermissionRoute>} />
          <Route path="/faculty/faculty-profiles" element={<PermissionRoute pageId="faculty_profiles"><PageWrapper Component={AdminFacultyProfilesPage} /></PermissionRoute>} />
          <Route path="/faculty/faculty-profiles/:user_id" element={<PermissionRoute pageId="faculty_profiles"><PageWrapper Component={AdminFacultyProfilesPage} /></PermissionRoute>} />
        </Route>

        {/* Developer Routes */}
        <Route element={<RoleRoute allowedRoles={['Developer']} />}>
          <Route path="/developer/assign-role" element={<PageWrapper Component={AssignRolePage} />} />
          <Route path="/developer/profile" element={<PageWrapper Component={ProfilePage} />} />
        </Route>
      </Route>

      {/* Public Legal Routes */}
      <Route path="/termsandconditions" element={<TermsAndConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund&cancellation" element={<RefundPolicy />} />

      {/* Standalone 404 NotFound Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
