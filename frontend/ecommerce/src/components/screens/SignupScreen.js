import React, { useState, useEffect, use } from "react";
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
  const [show, changeshow] = useState("");
  const dispatch = useDispatch();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/"

  const userSignup = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userSignup;

  // Debug useEffect to monitor message changes
  useEffect(() => {
    console.log("Message state changed:", message);
  }, [message]);

  useEffect(() => {
    // If registration was successful, redirect to login immediately
    if (userInfo && userInfo.details === "Please check your email to activate your account.") {
      // Just redirect without showing the message
      navigate("/login");
    }
    // Display error message if registration failed
    else if (error) {
      console.log("Error from userSignup:", error);
      setMessage(error);
    }
  }, [userInfo, error, navigate]);

  useEffect(() => {
    // Check for activation message in localStorage
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
      // Only clear password fields, keep other fields
      setPassword1("")
      setPassword2("")
    }
  };
  const showPassword = () => {
    var x = document.getElementById("password1");
    var z = document.getElementById("password2");
    if (x.type === "password" && z.type === "password") {
      x.type = "text"; 
      z.type = "text";
    } else {
      x.type = "password"; 
      z.type = "password";
    }
  }

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
                    <Form.Label>
                      Password</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Checkbox onChange={showPassword} />{" "}
                      <Form.Control
                        placeholder="Password"
                        required
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        type="password"
                        id="password1"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Checkbox/>{" "}
                      <Form.Control
                        placeholder="Confirm Password"
                        required
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        type="password"
                        id="password2"
                      />
                    </InputGroup>
                  </Form.Group>
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