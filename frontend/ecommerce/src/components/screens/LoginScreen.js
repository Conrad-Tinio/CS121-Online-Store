import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from "../Loader";
import Message from "../Message";
import { validEmail } from "./Regex";
import { login } from "../../actions/userActions";

function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin)
  const {error, loading, userInfo} = userLogin

  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/'
  
  useEffect(() => {
    if(userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate])

  useEffect(() => {
    const activateAccount = localStorage.getItem('activateMessage');
    if (activateAccount) {
      setMessage(activateAccount);
      localStorage.removeItem('activateMessage');
    }
  }, []);

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(login(email, password1))
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col md={4}></Col>
          <Col md={4}>
            <Card>
              <Card.Header as="h3" className="text-center bg-black text-light">
                LOGIN
              </Card.Header>

              <Card.Body>
                {error && <Message variant='danger'>{error}</Message>}
                {message && <Message variant='info'>{message}</Message>}
                {loading && <Loader />}
                
                <Form onSubmit={submitHandler}>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Control 
                      type="email" 
                      placeholder="Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        placeholder="Password"
                        required
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        id="password1"
                        style={{ 
                          WebkitTextSecurity: showPassword ? 'none' : 'disc',
                          MozTextSecurity: showPassword ? 'none' : 'disc'
                        }}
                        className="hide-password-reveal"
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={togglePassword}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <style>
                    {`
                      .hide-password-reveal::-ms-reveal,
                      .hide-password-reveal::-ms-clear {
                        display: none;
                      }
                      input[type="password"]::-webkit-contacts-auto-fill-button,
                      input[type="password"]::-webkit-credentials-auto-fill-button,
                      input[type="password"]::-webkit-password-toggle {
                        visibility: hidden;
                        display: none !important;
                        pointer-events: none;
                        height: 0;
                        width: 0;
                        margin: 0;
                      }
                    `}
                  </style>

                  <br />
                  <div className="d-grid gap-2">
                    <Button className="btn btn-md btn-success" type="submit">
                      Login
                    </Button>
                  </div>
                </Form>

                <Row className="py-3">
                  <Col>
                    Do not have an account?
                    <Link
                      to="/register"
                      style={{ color: "green", textDecoration: "none" }}
                    >
                      {" "}
                      Register now.
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}></Col>
        </Row>
      </Container>
    </>
  );
}

export default LoginScreen;