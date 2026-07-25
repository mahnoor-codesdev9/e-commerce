import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingWidgets } from '@/components/FloatingWidgets';
import { DiscountPopup } from '@/components/DiscountPopup';
import { ScrollToTop } from '@/components/ScrollToTop';

import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { AccountPage } from '@/pages/auth/AccountPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminCoupons } from '@/pages/admin/AdminCoupons';
import { AdminReviews } from '@/pages/admin/AdminReviews';
import { AdminNewsletter } from '@/pages/admin/AdminNewsletter';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminHomepage } from '@/pages/admin/AdminHomepage';
import { AdminAbout } from '@/pages/admin/AdminAbout';
import { AdminContact } from '@/pages/admin/AdminContact';
import { AdminPages } from '@/pages/admin/AdminPages';
import { AdminFAQs } from '@/pages/admin/AdminFAQs';
import { AdminMedia } from '@/pages/admin/AdminMedia';
import { FaqPage, NotFoundPage } from '@/pages/StaticPages';
import { PrivacyPolicyPage, ReturnPolicyPage, RefundPolicyPage, ShippingPolicyPage, TermsPage } from '@/pages/PolicyPages';

function StorefrontLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingWidgets />
      <DiscountPopup />
    </div>
  );
}

function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'OutreX Fashion — Luxury Fashion, Watches & Accessories',
      '/shop': 'Shop — OutreX Fashion',
      '/about': 'About — OutreX Fashion',
      '/contact': 'Contact — OutreX Fashion',
      '/cart': 'Cart — OutreX Fashion',
      '/checkout': 'Checkout — OutreX Fashion',
      '/wishlist': 'Wishlist — OutreX Fashion',
      '/login': 'Sign In — OutreX Fashion',
      '/register': 'Create Account — OutreX Fashion',
      '/account': 'My Account — OutreX Fashion',
      '/faq': 'FAQ — OutreX Fashion',
      '/admin': 'Admin Dashboard — OutreX Fashion',
    };
    document.title = titles[path] ?? 'OutreX Fashion';
  }, [location.pathname]);
}

function TitleManager() {
  usePageTitle();
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <TitleManager />
                  <Routes>
                    <Route element={<StorefrontLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:slug" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/return-policy" element={<ReturnPolicyPage />} />
                      <Route path="/refund-policy" element={<RefundPolicyPage />} />
                      <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                    </Route>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="newsletter" element={<AdminNewsletter />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="homepage" element={<AdminHomepage />} />
                      <Route path="about" element={<AdminAbout />} />
                      <Route path="contact" element={<AdminContact />} />
                      <Route path="pages" element={<AdminPages />} />
                      <Route path="faqs" element={<AdminFAQs />} />
                      <Route path="media" element={<AdminMedia />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
