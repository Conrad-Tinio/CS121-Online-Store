import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./components/screens/HomeScreen";
import SignupScreen from "./components/screens/SignupScreen";
import LoginScreen from "./components/screens/LoginScreen";
import CartScreen from "./components/screens/CartScreen";
import ProductScreen from "./components/screens/ProductScreen";
import Checkout from "./components/Checkout";
import Notification from "./components/Notification";
import { useDispatch, useSelector } from "react-redux";
import store from "./store";

// Wrapper component to use Redux hooks
const AppContent = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  // Get user login info from Redux
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;
  
  // Check for login state changes
  useEffect(() => {
    if (userInfo) {
      // Check if this is a fresh login
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      if (lastLoginTime === '0') {
        // Extract user's name
        const userName = userInfo.name || userInfo.username || userInfo.email || "Customer";
        setWelcomeMessage(`Welcome to Toy Kingdom, ${userName}!`);
        setShowWelcome(true);
        
        // Update lastLoginTime to current time
        localStorage.setItem('lastLoginTime', new Date().getTime().toString());
      }
    }
  }, [userInfo]);
  
  return (
    <>
      <Header />
      
      {/* Welcome Notification */}
      <Notification 
        show={showWelcome}
        onClose={() => setShowWelcome(false)}
        title="Welcome"
        message={welcomeMessage}
        variant="primary"
      />
    
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/product/:id" element={<ProductScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<SignupScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/cart/:id?" element={<CartScreen />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    
      <Footer />
    </>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;