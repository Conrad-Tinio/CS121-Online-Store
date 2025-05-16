import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card, CardTitle, Container, Modal } from "react-bootstrap";
import Loader from "../Loader";
import Message from "../Message";
import { addToCart, removeFromCart, clearCart } from '../../actions/cartActions';
import { useDispatch, useSelector } from "react-redux";
import { Form } from 'react-bootstrap';

function CartScreen({params}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const productId = id 
  const qty = location.search ? Number(location.search.split('=')[1]) : 1
  console.log(productId, qty)

  const cart = useSelector(state => state.cart)
  const { cartItems } = cart

  // Get user login information
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if(productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty, userInfo, navigate]); 

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    console.log('Navigating to checkout');
    if (!userInfo) {
      console.log('No user info, redirecting to login');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      console.log('Cart is empty, cannot proceed to checkout');
      return;
    }
    navigate("/checkout");
  }

  const continueShoppingHandler = () => {
    navigate('/');
  }

  const handleClearCart = () => {
    setShowConfirmModal(true);
  }

  const confirmClearCart = () => {
    dispatch(clearCart());
    setShowConfirmModal(false);
  }

  // If not authenticated, show login message instead of cart
  if (!userInfo) {
    return (
      <Container className="py-3">
        <Message variant='info'>
          Please <Link to="/login">login</Link> to view your cart
        </Message>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <Col>
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center"
            onClick={continueShoppingHandler}
          >
            <i className="fas fa-arrow-left me-2"></i> Continue Shopping
          </Button>
        </Col>
      </Row>
      
      <Row> 
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Cart Items</h1>
            {cartItems.length > 0 && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleClearCart}
              >
                <i className="fas fa-trash me-2"></i> Remove All
              </Button>
            )}
          </div>
          
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
                    className='w-100 mb-2'
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove All Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove all items from your cart?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClearCart}>
            Remove All
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CartScreen