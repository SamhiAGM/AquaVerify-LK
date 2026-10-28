import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, getRoleHomePath } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CitizenDashboardPage } from './pages/dashboard/citizen/CitizenDashboardPage';
import { OfficerDashboardPage } from './pages/dashboard/officer/OfficerDashboardPage';
import { LabDashboardPage } from './pages/dashboard/lab/LabDashboardPage';
import { AdminDashboardPage } from './pages/dashboard/admin/AdminDashboardPage';
import { ProfilePage } from './pages/dashboard/common/ProfilePage';
import { WaterSourcesPage } from './pages/dashboard/common/WaterSourcesPage';
import { WaterReportsPage } from './pages/dashboard/common/WaterReportsPage';

const DashboardIndexRedirect: React.FC = () => {
  const { user } = useAuth();
  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Index redirection based on role */}
            <Route index element={<DashboardIndexRedirect />} />

            {/* Citizen Protected Routes */}
            <Route
              path="citizen"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="citizen/submit"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="citizen/complaints"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="citizen/sources"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <WaterSourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="citizen/reports"
              element={
                <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                  <WaterReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Officer Protected Routes */}
            <Route
              path="officer"
              element={
                <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/complaints"
              element={
                <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/sources"
              element={
                <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                  <WaterSourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/inspections"
              element={
                <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                  <OfficerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/reports"
              element={
                <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                  <WaterReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Lab Technician Protected Routes */}
            <Route
              path="laboratory"
              element={
                <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}>
                  <LabDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratory/tests"
              element={
                <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}>
                  <LabDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratory/new"
              element={
                <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}>
                  <LabDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratory/sources"
              element={
                <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}>
                  <WaterSourcesPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/sources"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/tests"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Common Profile Page for All Logged In Users */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
