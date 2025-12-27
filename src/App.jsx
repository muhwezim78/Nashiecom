import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Customer Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";

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

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#00d4ff",
          colorBgBase: "#0a0a0f",
          colorBgContainer: "#12121a",
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <AuthProvider>
          <CartProvider>
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
                  <CustomerLayout>
                    <Checkout />
                  </CustomerLayout>
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
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
