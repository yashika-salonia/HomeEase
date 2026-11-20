import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { ExploreWorkersPage } from './pages/ExploreWorkersPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { WorkerDashboardPage } from './pages/WorkerDashboardPage';
import { StaticInfoPage } from './pages/StaticInfoPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Marketplace Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/workers" element={<ExploreWorkersPage />} />
            <Route path="/workers/:id" element={<WorkerProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Informational & Legal Footer Pages */}
            <Route path="/about" element={<StaticInfoPage topic="about" />} />
            <Route path="/contact" element={<StaticInfoPage topic="contact" />} />
            <Route path="/terms" element={<StaticInfoPage topic="terms" />} />
            <Route path="/privacy" element={<StaticInfoPage topic="privacy" />} />

            {/* Customer Protected Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboardPage section="overview" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboardPage section="bookings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/history"
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboardPage section="history" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/reviews"
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboardPage section="reviews" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerDashboardPage section="profile" />
                </ProtectedRoute>
              }
            />

            {/* Worker Protected Routes */}
            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="overview" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/profile-setup"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="profile" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/profile"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="profile" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/requests"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="requests" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/active"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="active" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/completed"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="completed" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/history"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="history" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/reviews"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="reviews" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/settings"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboardPage section="settings" />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
