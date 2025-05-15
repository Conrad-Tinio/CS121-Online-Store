import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Message from './Message';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    // Get user login information
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    // Get cart items from Redux store
    const cart = useSelector(state => state.cart);
    const { cartItems } = cart;
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!userInfo) {
            navigate('/login');
        }
        // Redirect if cart is empty and checkout not complete
        else if (cartItems.length === 0 && !isCheckoutComplete) {
            navigate('/cart');
        }
    }, [userInfo, cartItems, isCheckoutComplete, navigate]);

    const handleCheckout = async () => {
        try {
            // Store current cart items and total for display after clearing cart
            const orderDetails = {
                items: [...cartItems],
                total: cartTotal
            };

            // Update stock in backend
            await Promise.all(cartItems.map(item => 
                axios.post('/api/products/update-stock/', {
                    productId: item.product,
                    quantity: item.qty
                })
            ));

            // Save order details before clearing cart
            setCompletedOrder(orderDetails);

            // Clear cart
            dispatch({ type: 'CART_CLEAR_ITEMS' });
            localStorage.removeItem('cartItems');
            setIsCheckoutComplete(true);

        } catch (error) {
            console.error('Error during checkout:', error);
            alert('There was an error processing your checkout. Please try again.');
        }
    };

    const continueShoppingHandler = () => {
        navigate('/');
    };

    const backToCartHandler = () => {
        navigate('/cart');
    };

    // If not authenticated, show login message
    if (!userInfo) {
        return (
            <Container className="py-5">
                <Message variant='info'>
                    Please <Link to="/login">login</Link> to checkout
                </Message>
            </Container>
        );
    }

    if (isCheckoutComplete && completedOrder) {
        return (
            <Container className="py-5">
                <Card>
                    <Card.Body className="text-center">
                        <h4>Thank You for Your Purchase!</h4>
                        <p>You have successfully checked out these items:</p>
                        <div className="mt-3">
                            {completedOrder.items.map((item) => (
                                <div key={item.product} className="mb-2">
                                    {item.productName} x {item.qty} - ₱{(item.price * item.qty).toFixed(2)}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <h5>Total: ₱{completedOrder.total.toFixed(2)}</h5>
                        </div>
                        <Button 
                            variant="primary" 
                            className="mt-4"
                            onClick={continueShoppingHandler}
                        >
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col className="d-flex justify-content-between">
                    <Button 
                        variant="outline-secondary" 
                        className="d-flex align-items-center"
                        onClick={backToCartHandler}
                    >
                        <i className="fas fa-arrow-left me-2"></i> Back to Cart
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        className="d-flex align-items-center"
                        onClick={continueShoppingHandler}
                    >
                        <i className="fas fa-shopping-bag me-2"></i> Continue Shopping
                    </Button>
                </Col>
            </Row>
            
            <h2 className="mb-4">Checkout</h2>
            <Row>
                <Col md={8}>
                    {cartItems.map((item) => (
                        <Card key={item.product} className="mb-3">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col md={2}>
                                        <Image src={item.image} alt={item.productName} fluid rounded />
                                    </Col>
                                    <Col md={4}>
                                        <h5>{item.productName}</h5>
                                    </Col>
                                    <Col md={3} className="text-center">
                                        Quantity: {item.qty}
                                    </Col>
                                    <Col md={3} className="text-end">
                                        ₱{(item.price * item.qty).toFixed(2)}
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h4>Order Summary</h4>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <h5>Total:</h5>
                                <h5>₱{cartTotal.toFixed(2)}</h5>
                            </div>
                            <Button 
                                variant="primary" 
                                className="w-100 mb-2"
                                onClick={handleCheckout}
                            >
                                Complete Purchase
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={continueShoppingHandler}
                            >
                                Continue Shopping
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout; 