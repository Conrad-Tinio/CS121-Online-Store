import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from "../Loader";
import Message from "../Message";
import { login } from "../../actions/userActions";
import logo from '../../logo/Toy_Logo.png';

function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activationMessage, setActivationMessage] = useState("");
  const [displayError, setDisplayError] = useState("");

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { error, loading, userInfo } = userLogin;

  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';
  
  useEffect(() => {
    // Check for activation message in localStorage
    const message = localStorage.getItem('activateMessage');
    if (message) {
      setActivationMessage(message);
      // Remove the message from localStorage after displaying it
      localStorage.removeItem('activateMessage');
    }
  }, []);

  // Handle error message display and auto-dismiss
  useEffect(() => {
    if (error) {
      setDisplayError(error);
      const timer = setTimeout(() => {
        setDisplayError("");
      }, 3000); // Dismiss after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <div className="mb-2">
              <img 
                src={logo} 
                alt="Toy Kingdom Logo" 
                style={{ 
                  height: '80px',
                  marginBottom: '10px'
                }} 
              />
            </div>
            <h1 className="fw-bold mb-4">Sign in</h1>
            <p className="text-muted">
              Access your account to manage orders,<br />
              view your wishlist and more.
            </p>
          </div>

          {activationMessage && <Message variant='success' autoFade={true}>{activationMessage}</Message>}
          {displayError && <Message variant='danger'>{displayError}</Message>}
          {loading && <Loader />}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control-lg pe-5"
                />
                <Button
                  variant="link"
                  onClick={togglePassword}
                  className="position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', textDecoration: 'none' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Form.Group>

            <div className="d-grid mb-4">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="rounded-pill py-3"
              >
                Sign in
              </Button>
            </div>

            <div className="text-center">
              <p className="mb-0">
                Don't have an account?{' '}
                <Link
                  to={redirect ? `/register?redirect=${redirect}` : '/register'}
                  className="text-primary text-decoration-none"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginScreen;