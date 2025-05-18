import React, { useState, useEffect } from 'react';
import './fontawesome-config';  // Import Font Awesome configuration first
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './fontawesome';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './components/screens/HomeScreen';
import ProductScreen from './components/screens/ProductScreen';
import CartScreen from './components/screens/CartScreen';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import UserAccountScreen from './components/screens/UserAccountScreen';
import OrderHistoryScreen from './components/screens/OrderHistoryScreen';
import AdminDashboard from './components/screens/AdminDashboard';
import WishlistScreen from './components/WishlistScreen';
import Checkout from './components/screens/Checkout';
import OrderDetailsScreen from './components/screens/OrderDetailsScreen';
import { Provider } from 'react-redux';
import store from './store';
import { useSelector } from 'react-redux';
import ToastNotification from './components/ToastNotification';

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  const [prevUserInfo, setPrevUserInfo] = useState(userInfo);

  useEffect(() => {
    if (userInfo) {
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
    }
  }, [userInfo]);

  // Track logout
  useEffect(() => {
    if (prevUserInfo && !userInfo) {
      // User has logged out
      setShowLogout(true);
      setTimeout(() => {
        setShowLogout(false);
      }, 3000);
    }
    setPrevUserInfo(userInfo);
  }, [userInfo, prevUserInfo]);

  return (
    <Router>
      <div className="App">
        <Header />
        <ToastNotification
          show={showWelcome}
          onClose={() => setShowWelcome(false)}
          title="Welcome to Toy Kingdom!"
          message={userInfo ? `Welcome, ${userInfo.name}! 👋` : ''}
          subtitle="We hope you enjoy shopping with us! ✨"
          variant="success"
        />
        <ToastNotification
          show={showLogout}
          onClose={() => setShowLogout(false)}
          title="See you soon!"
          message="You have been successfully logged out"
          subtitle="Thanks for visiting Toy Kingdom! 👋"
          variant="info"
        />
        <main className="py-3">
          <Routes>
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<SignupScreen />} />
            <Route path="/account" element={<UserAccountScreen />} />
            <Route path="/orders" element={<OrderHistoryScreen />} />
            <Route path="/order/:id" element={<OrderDetailsScreen />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;