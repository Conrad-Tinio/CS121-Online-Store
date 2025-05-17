import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { register } from '../../actions/userActions';
import Message from '../Message';
import Loader from '../Loader';

function RegisterScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userRegister = useSelector(state => state.userRegister);
  const { error, loading, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (email !== confirmEmail) {
      setMessage('Email addresses do not match');
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    dispatch(register(firstName, lastName, email, password));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h1 className="fw-bold mb-4">Create account</h1>
            <p className="text-muted">
              Faster check-outs, personalised recommendations,<br />
              save your wishlist and other benefits.
            </p>
          </div>

          {message && <Message variant='danger'>{message}</Message>}
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label>Confirm email address</Form.Label>
              <Form.Control
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
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
              <Form.Text className="text-muted">
                Must be at least 6 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Repeat password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control-lg pe-5"
                />
                <Button
                  variant="link"
                  onClick={toggleConfirmPassword}
                  className="position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', textDecoration: 'none' }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
                Create account
              </Button>
            </div>

            <div className="text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary text-decoration-none"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterScreen; 