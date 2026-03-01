import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CmsProvider } from './contexts/CmsContext';
import { WishlistProvider } from './contexts/WishlistContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { UserRole } from './types';

// Lazy-loaded pages for performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Auth = lazy(() => import('./pages/Auth'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));


// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminCms = lazy(() => import('./pages/admin/CmsManager'));
const CmsPage = lazy(() => import('./pages/CmsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <CmsProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/p/:slug" element={<CmsPage />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/wishlist" element={<Wishlist />} />

                        {/* Protected customer routes */}
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute roles={[UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/order-success/:id"
                          element={
                            <ProtectedRoute>
                              <OrderSuccess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="*" element={<CmsPage />} />
                      </Route>

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                        <Route path="cms/*" element={<AdminCms />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </WishlistProvider>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                  },
                }}
              />
            </CmsProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
