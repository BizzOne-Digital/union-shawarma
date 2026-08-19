import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import CateringPage from './pages/CateringPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Customer Pages
import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import FavouritesPage from './pages/customer/FavouritesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGallery from './pages/admin/AdminGallery';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCatering from './pages/admin/AdminCatering';
import AdminCoupons from './pages/admin/AdminCoupons';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/common/PageTransition';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <PageTransition>{children}</PageTransition>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/catering" element={<PublicLayout><CateringPage /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
      <Route path="/order-confirmation" element={<PublicLayout><OrderConfirmationPage /></PublicLayout>} />

      {/* Customer */}
      <Route path="/profile" element={<ProtectedRoute><PublicLayout><ProfilePage /></PublicLayout></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><PublicLayout><OrdersPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/favourites" element={<ProtectedRoute><PublicLayout><FavouritesPage /></PublicLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/menu" element={<AdminRoute><AdminLayout><AdminMenu /></AdminLayout></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/gallery" element={<AdminRoute><AdminLayout><AdminGallery /></AdminLayout></AdminRoute>} />
      <Route path="/admin/catering" element={<AdminRoute><AdminLayout><AdminCatering /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1A1A1A', color: '#fff', borderRadius: '12px', padding: '12px 18px', fontSize: '14px' },
              success: { iconTheme: { primary: '#F57C00', secondary: '#fff' } },
              error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
