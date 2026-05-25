import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppSidebar from './components/AppSidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PickupDashboard from './pages/PickupDashboard';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import PricingCalculator from './pages/PricingCalculator';

// Public routes that show the global Navbar + Footer (no sidebar)
const PUBLIC_ROUTES = ['/', '/login', '/register'];

// Route guard to ensure authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route guard to ensure correct role access
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'ROLE_DRIVER') return <Navigate to="/driver" replace />;
    if (user.role === 'ROLE_PICKUP') return <Navigate to="/pickup" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
};

// Inner layout that conditionally shows Navbar/Footer OR sidebar
const AppLayout = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const showSidebar = user && !isPublicRoute;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app, #f9fafb)' }}>
      {/* Top Navbar for authenticated users */}
      {showSidebar && <AppSidebar />}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        {isPublicRoute && <Navbar />}

        <div style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard routes */}
            <Route path="/customer" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ROLE_CUSTOMER']}>
                  <CustomerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/driver" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/pickup" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ROLE_PICKUP']}>
                  <PickupDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/pricing-calculator" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <PricingCalculator />
                </RoleRoute>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {location.pathname === '/' && <Footer />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
