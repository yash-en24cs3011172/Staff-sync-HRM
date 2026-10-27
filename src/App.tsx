/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from './store';
import { hydrateSession } from './store/authSlice';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WorkspaceLayout } from './components/WorkspaceLayout';

// Lazy-loaded route modules for optimal initial bundle & navigation performance
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const LeavesPage = lazy(() => import('./pages/LeavesPage'));
const TrainingsPage = lazy(() => import('./pages/TrainingsPage'));
const PeopleDirectoryPage = lazy(() => import('./pages/PeopleDirectoryPage'));
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'));
const ReportsTestingPage = lazy(() => import('./pages/ReportsTestingPage'));

function RouteSkeleton() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
      <div className="h-48 bg-white border border-slate-200 rounded-xl animate-pulse" />
    </div>
  );
}

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { token, user, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(hydrateSession());
    }
  }, [dispatch, token, user]);

  if (token && !initialized) {
    return <RouteSkeleton />;
  }

  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/workspace/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="trainings" element={<TrainingsPage />} />
          <Route
            path="people"
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr']}>
                <PeopleDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr']}>
                <ReportsTestingPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
