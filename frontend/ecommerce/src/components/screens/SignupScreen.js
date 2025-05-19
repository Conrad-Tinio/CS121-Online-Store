import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from "../Loader";
import Message from "../Message";
import { validEmail } from "./Regex";
import { register } from "../../actions/userActions";
import { USER_REGISTER_RESET } from "../../constants/userConstants";
import logo from '../../logo/Toy_Logo.png';

function SignupScreen() {
  const navigate = useNavigate()
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/"

  const userSignup = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userSignup;

  useEffect(() => {
    return () => {
      dispatch({ type: USER_REGISTER_RESET });
    };
  }, [dispatch]);

  useEffect(() => {
    if (userInfo && userInfo.details === "Please check your email to activate your account.") {
      localStorage.setItem('activateMessage', userInfo.details);
      navigate("/login");
    }
    else if (error) {
      console.log("Error from userSignup:", error);
      setMessage(error);
    }
  }, [userInfo, error, navigate]);

  const submitHandler = (e) => {
    e.preventDefault()
  
    if (password1 !== password2) {
      setMessage("Passwords do not match.")
    } else if (!validEmail.test(email)) {
      setMessage("Please enter a valid email address.")
    } else {
      dispatch(register(fname, lname, email, password1))
      setPassword1("")
      setPassword2("")
    }
  };

  const togglePassword1 = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePassword2 = () => {
    setShowPassword2(!showPassword2);
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
            <h1 className="fw-bold mb-4">Create account</h1>
            <p className="text-muted">
              Faster check-outs, personalised recommendations,<br />
              save your wishlist and other benefits.
            </p>
          </div>

          {loading && <Loader />}
          {message && <Message variant='danger'>{message}</Message>}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                type="text"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                type="text"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
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
              <Form.Label>Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword1 ? "text" : "password"}
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  required
                  className="form-control-lg pe-5"
                />
                <Button
                  variant="link"
                  onClick={togglePassword1}
                  className="position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', textDecoration: 'none' }}
                >
                  {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword2 ? "text" : "password"}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  className="form-control-lg pe-5"
                />
                <Button
                  variant="link"
                  onClick={togglePassword2}
                  className="position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', textDecoration: 'none' }}
                >
                  {showPassword2 ? <FaEyeSlash /> : <FaEye />}
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
                  to={redirect ? `/login?redirect=${redirect}` : '/login'}
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

export default SignupScreen;