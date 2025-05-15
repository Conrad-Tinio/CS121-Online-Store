import React, { useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card, CardTitle, Container } from "react-bootstrap";
import Loader from "../Loader";
import Message from "../Message";
import { addToCart, removeFromCart } from '../../actions/cartActions';
import { useDispatch, useSelector } from "react-redux";
import { Form } from 'react-bootstrap';

function CartScreen({params}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const productId = id 
  const qty = location.search ? Number(location.search.split('=')[1]) : 1
  console.log(productId, qty)

  const cart = useSelector(state => state.cart)
  const { cartItems } = cart

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0)

  useEffect(() => {
    if(productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty]); 

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/checkout");
  }

  return (
    <Container className="py-3">
      <Row> 
        <Col md={8}>
          <h1>Cart Items</h1>
          {cartItems.length === 0 ? (
            <Message variant='info'>
              Your cart is empty <Link to="/">Go back</Link>
            </Message>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map(item => (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.productName} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/product/${item.product}`}>{item.productName}</Link>
                    </Col>
                    <Col md={2}>
                      ₱{item.price}
                    </Col>

                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                      >
                        {
                          [... Array(item.stockCount).keys()].map((x) => 
                            <option key={x+1} value={x+1}>
                              {x+1}
                            </option>
                          )
                        }
                      </Form.Control>
                    </Col>

                    <Col md={1}>
                        <Button
                          type='button'
                          variant='light'
                          onClick={() => removeFromCartHandler(item.product)}
                        >
                          <i className='fas fa-trash'></i>
                        </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Items ({itemsCount}):</Col>
                    <Col>₱{subtotal}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Total:</Col>
                    <Col>₱{subtotal}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Button
                    type='button'
                    className='w-100'
                    disabled={cartItems.length === 0}
                    onClick={checkoutHandler}
                  >
                    Proceed to Checkout
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CartScreen