import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <main className="py-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} exact />
              <Route path="/product/:id" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<SignupScreen />} />
              <Route path="/account" element={<UserAccountScreen />} />
              <Route path="/orders" element={<OrderHistoryScreen />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/wishlist" element={<WishlistScreen />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;