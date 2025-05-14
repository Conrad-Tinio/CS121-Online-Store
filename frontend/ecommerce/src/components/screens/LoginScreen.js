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
import Loader from "../Loader";
import Message from "../Message";
import { validEmail } from "./Regex";
import { login } from "../../actions/userActions";

function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin)
  const {error, loading, userInfo} = userLogin

  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/'
  
  useEffect(() => {
    if(userInfo) {
      navigate('/')
    }
  }, [userInfo, redirect])

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

  const showPassword = () => {
    var x = document.getElementById("password1");
    if (x.type === "password") {
      x.type = "text"; 
    } else {
      x.type = "password"; 
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