/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SignIn from '../pages/Auth/SignIn';
import PageWrapper from '../components/common/PageWrapper';

// Admin Pages
import AdminDashboardPage from '../pages/Admin/Dashboard';
import { AdminQueuePage } from '../pages/Admin/SubmissionsQueue';
import { AdminEvaluationPage } from '../pages/Admin/EvaluationConsole';
import { AdminDelegationPage } from '../pages/Admin/DelegateReview';

// Faculty Pages
import { UploadPage } from '../pages/Faculty/UploadManuscript';
import { PublicationsPage } from '../pages/Faculty/MyPublications';
import { ProfilePage } from '../pages/Shared/Profile';
import { TempAdminPage } from '../pages/Shared/TempAdminPage'; // Wait, I moved TempAdminPage somewhere... I think I left it or didn't move it?

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/queue" element={<PageWrapper Component={AdminQueuePage} />} />
          <Route path="/admin/evaluation" element={<PageWrapper Component={AdminEvaluationPage} />} />
          <Route path="/admin/delegation" element={<PageWrapper Component={AdminDelegationPage} />} />
          <Route path="/admin/upload" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/admin/publications" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/admin/profile" element={<PageWrapper Component={ProfilePage} />} />
        </Route>

        {/* Faculty Routes */}
        <Route element={<RoleRoute allowedRoles={['Faculty']} />}>
          <Route path="/faculty/upload" element={<PageWrapper Component={UploadPage} />} />
          <Route path="/faculty/publications" element={<PageWrapper Component={PublicationsPage} />} />
          <Route path="/faculty/profile" element={<PageWrapper Component={ProfilePage} />} />
          <Route path="/faculty/evaluation" element={<PageWrapper Component={TempAdminPage} />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
