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

  const userSignup = useSelector((state) => state.userSignup);
  const userInfo = userSignup;
  const error = userSignup;

  useEffect(() => {
    // Check for specific conditions instead of running this logic every time
    
    // Only check localStorage when the component first mounts
    const activateAccount = localStorage.getItem('activateMessage');
    if (activateAccount) {
      setMessage(activateAccount);
      localStorage.removeItem('activateMessage');
      return; // Exit early if we found and used an activate message
    }
    
    // Only set messages from userInfo if there's actual detail content
    if (userInfo && userInfo.details) {
      setMessage(userInfo.details);
      setFname("")
      setLname("")
      setEmail("")
      setPassword1("")
      setPassword2("")
    } else if (error) {
      setMessage(error);
    }
    
    // Empty dependency array makes this run once on mount only
  }, []);

  const submitHandler = (e) => {
    e.preventDefault()
  
    if (password1 !== password2) {
      setMessage("Passwords do not match.")
      navigate("/register")
    } else {
      dispatch(register(fname, lname, email, password1))
      setTimeout(() => {
        navigate("/login");
      }, 3000); // 3 seconds delay
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