import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBotNew';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import MyMessagesPage from './pages/MyMessagesPage';
import ProductListPage from './pages/ProductListPage';
import ProductEditPage from './pages/ProductEditPage';
import UserListPage from './pages/UserListPage';
import UserEditPage from './pages/UserEditPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderPage from './pages/OrderPage';
import OrderListPage from './pages/OrderListPage';
import DashboardPage from './pages/DashboardPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { CartProvider } from './context/CartContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="py-3">
            <Container>
              <Routes>
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/my-messages" element={<MyMessagesPage />} />
                
                {/* Shopping Pages */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/cart/:id" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment-success/:id" element={<PaymentSuccessPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/placeorder" element={<PlaceOrderPage />} />
                <Route path="/order/:id" element={<OrderPage />} />
                
                {/* Auth Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/myorders" element={<MyOrdersPage />} />

                {/* Admin Routes */}
                <Route path="/admin/productlist" element={<ProductListPage />} />
                <Route path="/admin/product/new" element={<ProductEditPage />} />
                <Route path="/admin/product/:id/edit" element={<ProductEditPage />} />
                <Route path="/admin/userlist" element={<UserListPage />} />
                <Route path="/admin/user/:id/edit" element={<UserEditPage />} />
                <Route path="/admin/orderlist" element={<OrderListPage />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/messages" element={<ContactMessagesPage />} />
              </Routes>
            </Container>
          </main>
          <Footer />
          <ToastContainer />
          <ChatBot />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
