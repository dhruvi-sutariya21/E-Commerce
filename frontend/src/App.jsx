import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Guard: Redirect Admin to /admin if they attempt to view customer pages
const CustomerOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isAuthenticated && isAdmin && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Suspense Page Loader
const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-pink-200 border-t-[#E91E63] rounded-full animate-spin"></div>
    <span className="text-xs text-gray-500 font-medium">Loading AURA Couture...</span>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="min-h-screen flex flex-col justify-between bg-[#F8F9FA] text-gray-900 font-sans selection:bg-[#FFB6C1] selection:text-[#E91E63]">
                <Navbar />

                <main className="flex-grow">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Customer Routes (Protected from Admin view) */}
                      <Route path="/" element={<CustomerOnlyRoute><Home /></CustomerOnlyRoute>} />
                      <Route path="/categories" element={<CustomerOnlyRoute><CategoryPage /></CustomerOnlyRoute>} />
                      <Route path="/products" element={<CustomerOnlyRoute><ProductListPage /></CustomerOnlyRoute>} />
                      <Route path="/product/:id" element={<CustomerOnlyRoute><ProductDetailPage /></CustomerOnlyRoute>} />
                      <Route path="/login" element={<CustomerOnlyRoute><Login /></CustomerOnlyRoute>} />
                      <Route path="/register" element={<CustomerOnlyRoute><Register /></CustomerOnlyRoute>} />
                      <Route path="/forgot-password" element={<CustomerOnlyRoute><ForgotPassword /></CustomerOnlyRoute>} />

                      {/* Protected Customer Routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <CustomerOnlyRoute>
                              <Profile />
                            </CustomerOnlyRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <CustomerOnlyRoute>
                              <CartPage />
                            </CustomerOnlyRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <ProtectedRoute>
                            <CustomerOnlyRoute>
                              <WishlistPage />
                            </CustomerOnlyRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CustomerOnlyRoute>
                              <CheckoutPage />
                            </CustomerOnlyRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <CustomerOnlyRoute>
                              <OrdersPage />
                            </CustomerOnlyRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Protected Route */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminPage />
                          </AdminRoute>
                        }
                      />

                      {/* 404 Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
