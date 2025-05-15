import React from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, ListGroupItem } from "react-bootstrap";
import { Row, Col, Image, ListGroup, Button, Card } from "react-bootstrap";
import Rating from "../Rating";
import { listProductDetails } from "../../actions/productActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";
import { Form } from "react-bootstrap";

function ProductScreen({ params }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const dispatch = useDispatch();
  const productDetails = useSelector((state) => state.productDetails);
  const { error, loading, product } = productDetails;
  
  // Get user login information
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(listProductDetails(id))
  }, [dispatch,params]);

  const addToCartHandler = () => {
    if (!userInfo) {
      setShowLoginMessage(true);
      // Optional: automatically redirect to login after a delay
      // setTimeout(() => navigate('/login'), 3000);
    } else {
      navigate(`/cart/${id}?quantity=${quantity}`);
    }
  }

  return (
    <Container>
      <div>
        <Link to="/" className="btn btn-dark my-3">
          Go Back
        </Link>

        {
          loading ? (
            <Loader/>
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <Row>
              <Col md={6}>
                <Image src={product.image} all={product.name} fluid />
              </Col>

              <Col md={3}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <h3>{product.productName}</h3>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <Rating
                        value={product.rating}
                        text={` ${product.numReviews} reviews`}
                        color={"#f8e825"}
                      />
                    </ListGroup.Item>

                    <ListGroup.Item>Brand: {product.productBrand} </ListGroup.Item>

                    <ListGroup.Item style={{ textAlign: "justify" }}>
                      Description: {product.productInfo}
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>

              <Col md={3}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Price:</Col>
                        <Col>
                          <strong>₱{product.price}</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>
                          {product.stockCount > 0 ? "In Stock" : "Out of Stock"} ({product.stockCount})
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    {showLoginMessage && (
                      <ListGroup.Item>
                        <Message variant="info">
                          Please <Link to="/login">login</Link> to add items to your cart
                        </Message>
                      </ListGroup.Item>
                    )}

                    {product.stockCount > 0 && (
                        <ListGroup.Item>
                          <Row>
                            <Col>Quantity: </Col>
                            <Col xs="auto" className="my-1">
                              <Form.Control 
                                as="select"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                              >
                                {[... Array(product.stockCount).keys()].map((x) => (
                                  <option key={x+1} value={x+1}>
                                    {x+1}
                                  </option>
                                ))}
                              </Form.Control>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      )
                    }

                    <ListGroup.Item>
                      <Button
                        className="btn-block btn-success" 
                        disabled={product.stockCount == 0}
                        type="button"
                        onClick={addToCartHandler}
                      >
                        {userInfo ? 'Add to Cart' : 'Login to Add to Cart'}
                      </Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          )
        }

      </div>
    </Container>
  );
}

export default ProductScreen;
