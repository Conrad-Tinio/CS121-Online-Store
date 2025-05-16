import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from "../Loader";
import Message from "../Message";
import { validEmail } from "./Regex";
import { register } from "../../actions/userActions";

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
    if (userInfo && userInfo.details === "Please check your email to activate your account.") {
      navigate("/login");
    }
    else if (error) {
      console.log("Error from userSignup:", error);
      setMessage(error);
    }
  }, [userInfo, error, navigate]);

  useEffect(() => {
    const activateAccount = localStorage.getItem('activateMessage');
    if (activateAccount) {
      setMessage(activateAccount);
      localStorage.removeItem('activateMessage');
    }
  }, []);

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
    <>
      <Container className="mt-3">
        <Row>
          <Col md={4}></Col>
          <Col md={4}>
            <Card>
              <Card.Header as="h3" className="text-center bg-black text-light">
                REGISTER
              </Card.Header>

              <Card.Body>
                {loading ? <Loader /> : null}
                {message && <Message variant='danger'>{message}</Message>}
                
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3" controlId="fname">
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="lname">
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      required
                    />
                  </Form.Group>

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
                        type={showPassword1 ? "text" : "password"}
                        id="password1"
                        style={{ 
                          WebkitTextSecurity: showPassword1 ? 'none' : 'disc',
                          MozTextSecurity: showPassword1 ? 'none' : 'disc'
                        }}
                        className="hide-password-reveal"
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={togglePassword1}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        placeholder="Confirm Password"
                        required
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        type={showPassword2 ? "text" : "password"}
                        id="password2"
                        style={{ 
                          WebkitTextSecurity: showPassword2 ? 'none' : 'disc',
                          MozTextSecurity: showPassword2 ? 'none' : 'disc'
                        }}
                        className="hide-password-reveal"
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={togglePassword2}
                        style={{ border: 'none', background: 'transparent' }}
                      >
                        {showPassword2 ? <FaEyeSlash /> : <FaEye />}
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
                      Register
                    </Button>
                  </div>
                </Form>

                <Row className="py-3">
                  <Col>
                    Already have an account?
                    <Link
                      to="/login"
                      style={{ color: "green", textDecoration: "none" }}
                    >
                      {" "}
                      Login.
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

export default SignupScreen;