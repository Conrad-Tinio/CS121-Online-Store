import React from "react";
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

function App() {
  return (
    <Router>
      <Header />
    
      <>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<SignupScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/cart/:id?" element={<CartScreen />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </>
    
      <Footer />
    </Router>
  );
}

export default App;