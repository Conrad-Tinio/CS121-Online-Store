import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card, Container, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faArrowLeft, 
    faTrash, 
    faShoppingCart, 
    faCreditCard 
} from '@fortawesome/free-solid-svg-icons'
import Loader from "../Loader";
import Message from "../Message";
import { addToCart, removeFromCart, clearCart } from '../../actions/cartActions';
import { useDispatch, useSelector } from "react-redux";
import { Form } from 'react-bootstrap';
import './CartScreen.css';

function CartScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const qty = location.search ? Number(location.search.split('=')[1]) : 1;

  const cart = useSelector(state => state.cart);
  const { cartItems } = cart;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2);
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if(id) {
      dispatch(addToCart(id, qty));
    }
  }, [dispatch, id, qty, userInfo, navigate]); 

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
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
    <div className="cart-container">
      <Container>
        <Row className="mb-4">
          <Col>
            <Button 
              variant="outline-secondary" 
              className="continue-shopping-btn"
              onClick={continueShoppingHandler}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Continue Shopping
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Shopping Cart ({itemsCount} items)</h2>
                {cartItems.length > 0 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }} />
                    Clear Cart
                  </Button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <Message variant='info'>
                  Your cart is empty <Link to="/">Go back</Link>
                </Message>
              ) : (
                <div>
                  {cartItems.map(item => (
                    <div key={item.product} className="cart-item">
                      <Row className="align-items-center">
                        <Col md={2}>
                          <Link to={`/product/${item.product}`}>
                            <Image src={item.image} alt={item.productName} fluid rounded />
                          </Link>
                        </Col>
                        <Col md={4}>
                          <Link 
                            to={`/product/${item.product}`}
                            className="text-decoration-none"
                          >
                            <h5 className="cart-item-title">{item.productName}</h5>
                          </Link>
                          {item.productBrand && (
                            <p className="cart-item-brand">{item.productBrand}</p>
                          )}
                        </Col>
                        <Col md={2} className="text-center">
                          <span className="cart-item-price">₱{item.price}</span>
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            as="select"
                            value={item.qty}
                            onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                            className="quantity-select"
                          >
                            {[...Array(item.stockCount).keys()].map((x) => (
                              <option key={x+1} value={x+1}>
                                {x+1}
                              </option>
                            ))}
                          </Form.Control>
                        </Col>
                        <Col md={2} className="text-end">
                          <Button
                            variant="danger"
                            className="remove-cart-btn"
                            onClick={() => removeFromCartHandler(item.product)}
                            aria-label="Remove from cart"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          <Col md={4}>
            <div className="order-summary position-sticky" style={{ top: '2rem' }}>
              <h4>Order Summary</h4>
              <div className="summary-item">
                <span>Items ({itemsCount}):</span>
                <span>₱{subtotal}</span>
              </div>
              <hr />
              <div className="summary-item fw-bold">
                <span>Total:</span>
                <span>₱{subtotal}</span>
              </div>
              <div className="d-grid mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="checkout-btn"
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '8px' }} />
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Clear Cart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to remove all items from your cart?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmClearCart}>
              Clear Cart
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default CartScreen;