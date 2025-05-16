import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Message from '../Message';
import DeliveryLocationMap from '../DeliveryLocationMap';

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
                        <div className="mt-2">
                            <p>Delivery Location: {completedOrder.deliveryLocation.address}</p>
                            <p>Coordinates: {completedOrder.deliveryLocation.position[0].toFixed(6)}, {completedOrder.deliveryLocation.position[1].toFixed(6)}</p>
                        </div>
                        <Button 
                            variant="primary" 
                            className="mt-4"
                            onClick={continueShoppingHandler}
                        >
                            Continue Shopping
                        </Button>
                        
                        {/* Add a button to view order details if needed */}
                        <div className="mt-3">
                            <Button 
                                variant="outline-secondary"
                                onClick={() => {
                                    console.log('Navigate to orders page');
                                    navigate('/orders');
                                }}
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