import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faHome } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Message from '../Message';
import DeliveryLocationMap from '../DeliveryLocationMap';
import logo from '../../logo/Toy_Logo.png';

const Checkout = () => {
    console.log('Checkout component rendering');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get user login information
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    // Get cart items from Redux store
    const cart = useSelector(state => state.cart);
    const { cartItems } = cart;
    
    console.log('Current state:', {
        userInfo,
        cartItems,
        isCheckoutComplete,
        deliveryLocation,
        showLocationPicker
    });

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

    useEffect(() => {
        console.log('Checkout useEffect running');
        // Redirect to login if not authenticated
        if (!userInfo) {
            console.log('No user info, redirecting to login');
            navigate('/login');
        }
        // Redirect if cart is empty and checkout not complete
        else if (cartItems.length === 0 && !isCheckoutComplete) {
            console.log('Cart empty and checkout not complete, redirecting to cart');
            navigate('/cart');
        }

        // Log the current state for debugging
        console.log('Current checkout state in useEffect:', { 
            cartItemsLength: cartItems.length, 
            isCheckoutComplete, 
            completedOrder 
        });
    }, [userInfo, cartItems, isCheckoutComplete, navigate, completedOrder]);

    const handleLocationSelect = (location) => {
        setDeliveryLocation(location);
        setShowLocationPicker(false);
    };

    const handleCheckout = async () => {
        if (!deliveryLocation) {
            alert('Please select a delivery location before completing your purchase.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Store current cart items and total for display after clearing cart
            const orderDetails = {
                items: cartItems.map(item => ({
                    product: item.product,
                    productName: item.productName,
                    qty: item.qty,
                    price: item.price,
                    image: item.image
                })),
                total: cartTotal,
                deliveryLocation
            };

            // Save order details before clearing cart
            setCompletedOrder(orderDetails);
            
            // Set checkout complete immediately to prioritize showing the success page
            setIsCheckoutComplete(true);
            
            // Create the order
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const orderData = {
                order_items: cartItems.map(item => ({
                    product_id: item.product,
                    quantity: item.qty,
                    price: item.price
                })),
                delivery_location: {
                    latitude: deliveryLocation.position[0],
                    longitude: deliveryLocation.position[1],
                    address_details: deliveryLocation.address
                },
                payment_method: 'Cash on Delivery', // You can make this dynamic if needed
                shipping_price: 0, // You can calculate this based on location
                total_price: cartTotal
            };

            // Clear cart before API call to ensure UI updates
            dispatch({ type: 'CART_CLEAR_ITEMS' });
            localStorage.removeItem('cartItems');

            console.log('Checkout complete, order details:', orderDetails);
            console.log('Setting isCheckoutComplete to true');
            
            // Make API call after state updates
            const response = await axios.post('/api/orders/create/', orderData, config);
            setIsSubmitting(false);
            
            // Save order ID for future reference if needed
            console.log('Order created with ID:', response.data.id);

        } catch (error) {
            setIsSubmitting(false);
            console.error('Error during checkout:', error);
            alert(error.response?.data?.detail || 'There was an error processing your checkout. Please try again.');
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
        console.log('Rendering success page with:', { isCheckoutComplete, completedOrder });
        return (
            <Container className="py-5">
                <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                        {/* Logo with Badge */}
                        <div className="mb-4 position-relative d-inline-block">
                            <div className="bg-white rounded-circle p-3 d-inline-block" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <img 
                                    src={logo} 
                                    alt="Toy Kingdom Logo" 
                                    style={{ 
                                        height: '60px',
                                        width: '60px',
                                        objectFit: 'contain'
                                    }} 
                                />
                            </div>
                            <span 
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                                style={{ fontSize: '1rem', padding: '0.5rem' }}
                            >
                                ✓
                            </span>
                        </div>

                        {/* Thank You Message */}
                        <h2 className="mb-3 fw-bold text-primary">Thank You for Your Purchase!</h2>
                        <p className="text-muted mb-5">We appreciate your business!</p>

                        {/* Order Details Section */}
                        <div className="mt-4 pt-4 border-top">
                            <h4 className="mb-4">Order Details</h4>
                            <Row className="justify-content-center">
                                <Col md={8}>
                                    {completedOrder.items.map((item) => (
                                        <div key={item.product} className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                            <Image 
                                                src={item.image} 
                                                alt={item.productName} 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                className="rounded me-3"
                                            />
                                            <div className="flex-grow-1 text-start">
                                                <h6 className="mb-0">{item.productName}</h6>
                                                <small className="text-muted">Quantity: {item.qty}</small>
                                            </div>
                                            <div className="text-primary fw-bold">
                                                ₱{(item.price * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                                        <h5>Total Amount:</h5>
                                        <h5 className="text-primary">₱{completedOrder.total.toFixed(2)}</h5>
                                    </div>

                                    <div className="mt-3 p-3 bg-light rounded">
                                        <h6 className="mb-2">Delivery Location:</h6>
                                        <p className="mb-1">{completedOrder.deliveryLocation.address}</p>
                                        <small className="text-muted">
                                            Coordinates: {completedOrder.deliveryLocation.position[0].toFixed(6)}, 
                                            {completedOrder.deliveryLocation.position[1].toFixed(6)}
                                        </small>
                        </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 d-flex justify-content-center gap-3">
                        <Button 
                            variant="primary" 
                                size="lg"
                            onClick={continueShoppingHandler}
                        >
                            <FontAwesomeIcon icon={faHome} className="me-2" />
                            Continue Shopping
                        </Button>
                            <Button 
                                variant="outline-primary"
                                size="lg"
                                onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
                            >
                                View Your Orders
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col className="d-flex gap-2">
                    <Button 
                        variant="light"
                        onClick={backToCartHandler}
                        className="d-flex align-items-center"
                    >
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        Back to Cart
                    </Button>
                    <Button 
                        variant="outline-primary"
                        onClick={continueShoppingHandler}
                        className="d-flex align-items-center"
                    >
                        <FontAwesomeIcon icon={faHome} className="me-2" />
                        Continue Shopping
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

                    {showLocationPicker ? (
                        <DeliveryLocationMap onLocationSelect={handleLocationSelect} />
                    ) : (
                        <Card className="mb-4">
                            <Card.Body>
                                <h4>Delivery Location</h4>
                                {deliveryLocation ? (
                                    <div>
                                        <p><strong>Address:</strong> {deliveryLocation.address}</p>
                                        <p><strong>Coordinates:</strong> {deliveryLocation.position[0].toFixed(6)}, {deliveryLocation.position[1].toFixed(6)}</p>
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => setShowLocationPicker(true)}
                                        >
                                            Change Location
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>No delivery location selected.</p>
                                        <Button 
                                            variant="primary" 
                                            onClick={() => setShowLocationPicker(true)}
                                        >
                                            Select Delivery Location
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}
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
                                disabled={!deliveryLocation || isSubmitting}
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