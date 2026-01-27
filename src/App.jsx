import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import "./App.css";

// Customer Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

// Admin Pages
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminLogin from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import ProductsPage from "./admin/pages/ProductsPage";
import OrdersPage from "./admin/pages/OrdersPage";
import CustomersPage from "./admin/pages/CustomersPage";
import CategoriesPage from "./admin/pages/CategoriesPage";
import CouponsPage from "./admin/pages/CouponsPage";
import MessagesPage from "./admin/pages/MessagesPage";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import NotificationsPage from "./admin/pages/NotificationsPage";
import ReviewsPage from "./admin/pages/ReviewsPage";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper for customer pages
const CustomerLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const AppContent = () => {
  const { theme: currentTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#00d4ff",
          colorBgBase: currentTheme === "dark" ? "#0a0a0f" : "#ffffff",
          colorBgContainer: currentTheme === "dark" ? "#12121a" : "#f1f5f9",
          borderRadius: 8,
          colorTextBase: currentTheme === "dark" ? "#ffffff" : "#0f172a",
        },
      }}
    >
      <AntdApp>
        <Router>
          <AuthProvider>
            <CartProvider>
              <NotificationProvider>
                <ScrollToTop />
                <Routes>
                  {/* Customer Routes */}
                  <Route
                    path="/"
                    element={
                      <CustomerLayout>
                        <Home />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <CustomerLayout>
                        <Products />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <CustomerLayout>
                        <ProductDetail />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <CustomerLayout>
                        <Cart />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CustomerLayout>
                          <Checkout />
                        </CustomerLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <CustomerLayout>
                        <About />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <CustomerLayout>
                        <Contact />
                      </CustomerLayout>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <CustomerLayout>
                          <MyOrders />
                        </CustomerLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <CustomerLayout>
                          <Notifications />
                        </CustomerLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <CustomerLayout>
                          <Profile />
                        </CustomerLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Admin Login */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="coupons" element={<CouponsPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                  </Route>
                </Routes>
              </NotificationProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
