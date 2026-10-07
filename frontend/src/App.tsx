import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';

// Layouts & Guards
import { PublicLayout } from './components/layout/PublicLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute, RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { Home } from './pages/public/Home';
import { Shop } from './pages/public/Shop';
import { ProductDetail } from './pages/public/ProductDetail';
import { Brands } from './pages/public/Brands';
import { BrandDetail } from './pages/public/BrandDetail';
import { Categories } from './pages/public/Categories';
import { CategoryDetail } from './pages/public/CategoryDetail';
import { Deals } from './pages/public/Deals';
import { NewArrivals } from './pages/public/NewArrivals';
import { Compare } from './pages/public/Compare';
import { SearchPage } from './pages/public/SearchPage';
import { Cart } from './pages/public/Cart';
import { Checkout } from './pages/public/Checkout';
import { Wishlist } from './pages/public/Wishlist';
import { AiAssistantPage } from './pages/public/AiAssistantPage';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPolicy, TermsOfService, WarrantyReturns, ShippingPolicy } from './pages/public/PolicyPages';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { CustomerOrders } from './pages/customer/Orders';
import { CustomerOrderDetail } from './pages/customer/OrderDetail';
import { CustomerProfile } from './pages/customer/Profile';
import { CustomerAddresses } from './pages/customer/Addresses';
import { CustomerNotifications } from './pages/customer/Notifications';
import { CustomerAi } from './pages/customer/CustomerAi';
import { CustomerSettings } from './pages/customer/Settings';
import { CustomerBookings } from './pages/customer/Bookings';
import { CustomerPayments } from './pages/customer/Payments';
import { CustomerSecurity } from './pages/customer/Security';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminProductForm } from './pages/admin/ProductForm';
import { AdminBrands } from './pages/admin/Brands';
import { AdminCategories } from './pages/admin/Categories';
import { AdminOffers } from './pages/admin/Offers';
import { AdminFlashSales } from './pages/admin/FlashSales';
import { AdminOrders } from './pages/admin/Orders';
import { AdminCustomers } from './pages/admin/Customers';
import { AdminReviews } from './pages/admin/Reviews';
import { AdminHomepageCMS } from './pages/admin/HomepageCMS';
import { AdminHeroSlides } from './pages/admin/HeroSlides';
import { AdminAnalytics } from './pages/admin/Analytics';
import { AdminAi } from './pages/admin/AdminAi';
import { AdminSettings } from './pages/admin/Settings';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminInventory } from './pages/admin/Inventory';
import { AdminCoupons } from './pages/admin/Coupons';
import { AdminAuditLogs } from './pages/admin/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-12 h-12 rounded-2xl border-4 border-blue-600 border-t-transparent animate-spin" />
    <p className="text-sm font-medium text-slate-400">Loading Jaffna Mobile Zone...</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* ================= PUBLIC STOREFRONT ================= */}
                        <Route element={<PublicLayout />}>
                          <Route index element={<Home />} />
                          <Route path="shop" element={<Shop />} />
                          <Route path="phones" element={<Shop />} />
                          <Route path="product/:slug" element={<ProductDetail />} />
                          <Route path="brands" element={<Brands />} />
                          <Route path="brand/:slug" element={<BrandDetail />} />
                          <Route path="brands/:slug" element={<BrandDetail />} />
                          <Route path="categories" element={<Categories />} />
                          <Route path="categories/:slug" element={<CategoryDetail />} />
                          <Route path="deals" element={<Deals />} />
                          <Route path="new-arrivals" element={<NewArrivals />} />
                          <Route path="compare" element={<Compare />} />
                          <Route path="search" element={<SearchPage />} />
                          <Route path="cart" element={<Cart />} />
                          <Route
                            path="checkout"
                            element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="wishlist" element={<Wishlist />} />
                          <Route path="ai-assistant" element={<AiAssistantPage />} />
                          <Route path="about" element={<About />} />
                          <Route path="contact" element={<Contact />} />
                          <Route path="faq" element={<FaqPage />} />
                          <Route path="privacy" element={<PrivacyPolicy />} />
                          <Route path="terms" element={<TermsOfService />} />
                          <Route path="warranty" element={<WarrantyReturns />} />
                          <Route path="shipping" element={<ShippingPolicy />} />
                        </Route>

                        {/* ================= AUTHENTICATION ================= */}
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<Signup />} />
                        <Route path="register" element={<Signup />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />

                        {/* ================= CUSTOMER PORTAL ================= */}
                        <Route
                          path="customer"
                          element={
                            <RoleProtectedRoute allowedRoles={['customer', 'admin']}>
                              <CustomerLayout />
                            </RoleProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to="/customer/dashboard" replace />} />
                          <Route path="dashboard" element={<CustomerDashboard />} />
                          <Route path="bookings" element={<CustomerBookings />} />
                          <Route path="orders" element={<CustomerOrders />} />
                          <Route path="orders/:id" element={<CustomerOrderDetail />} />
                          <Route path="payments" element={<CustomerPayments />} />
                          <Route path="wishlist" element={<Wishlist />} />
                          <Route path="cart" element={<Cart />} />
                          <Route path="compare" element={<Compare />} />
                          <Route path="profile" element={<CustomerProfile />} />
                          <Route path="addresses" element={<CustomerAddresses />} />
                          <Route path="notifications" element={<CustomerNotifications />} />
                          <Route path="security" element={<CustomerSecurity />} />
                          <Route path="ai-assistant" element={<CustomerAi />} />
                          <Route path="settings" element={<CustomerSettings />} />
                        </Route>

                        {/* ================= ADMIN CONSOLE ================= */}
                        <Route
                          path="admin"
                          element={
                            <RoleProtectedRoute allowedRoles={['admin']}>
                              <AdminLayout />
                            </RoleProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="products/create" element={<AdminProductForm />} />
                          <Route path="products/:id/edit" element={<AdminProductForm />} />
                          <Route path="inventory" element={<AdminInventory />} />
                          <Route path="brands" element={<AdminBrands />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="offers" element={<AdminOffers />} />
                          <Route path="flash-sales" element={<AdminFlashSales />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="bookings" element={<AdminBookings />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="customers" element={<AdminCustomers />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="homepage" element={<AdminHomepageCMS />} />
                          <Route path="hero-slides" element={<AdminHeroSlides />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                          <Route path="audit-logs" element={<AdminAuditLogs />} />
                          <Route path="ai" element={<AdminAi />} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Route>

                        {/* Fallback 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
