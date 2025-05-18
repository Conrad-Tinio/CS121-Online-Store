import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Card, Image, Button, Badge, Container } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faArrowLeft, 
    faBox, 
    faCalendar, 
    faShippingFast, 
    faCheckCircle, 
    faTimesCircle, 
    faTruck, 
    faClock 
} from '@fortawesome/free-solid-svg-icons'
import Message from '../Message'
import Loader from '../Loader'
import axios from 'axios'

function OrderDetailsScreen() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`
                    }
                }
                const { data } = await axios.get(`/api/orders/${id}/`, config)
                setOrder(data)
                setLoading(false)
            } catch (error) {
                setError(error.response?.data?.detail || 'Error fetching order details')
                setLoading(false)
            }
        }

        fetchOrderDetails()
    }, [userInfo, navigate, id])

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
        return new Date(dateString).toLocaleDateString(undefined, options)
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <Message variant='danger'>{error}</Message>
    }

    if (!order) {
        return <Message variant='info'>Order not found</Message>
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'success';
            case 'Shipped':
                return 'info';
            case 'Processing':
                return 'warning';
            case 'Cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Container className="py-4">
            <Button 
                variant="light" 
                onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
                className="mb-4"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back to Orders
            </Button>

            <Row>
                <Col lg={8}>
                    <Card className="mb-4 order-details-card">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0">Order #{order.id}</h4>
                                <div>
                                    <Badge 
                                        bg={getStatusColor(order.status)}
                                        className="status-badge me-2"
                                    >
                                        <FontAwesomeIcon icon={faBox} className="me-1" />
                                        {order.status}
                                    </Badge>
                                    <Badge 
                                        bg="info" 
                                        className="date-badge"
                                    >
                                        <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                        {formatDate(order.created_at)}
                                    </Badge>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="px-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item mb-3">
                                    <Row className="align-items-center">
                                        <Col xs={3} md={2}>
                                            {item.product.image && (
                                                <Image 
                                                    src={item.product.image} 
                                                    alt={item.product.productName}
                                                    className="order-item-image"
                                                />
                                            )}
                                        </Col>
                                        <Col xs={9} md={6}>
                                            <h6 className="mb-1">{item.product.productName}</h6>
                                            <p className="text-muted mb-0">
                                                Quantity: {item.quantity}
                                            </p>
                                        </Col>
                                        <Col xs={12} md={4} className="text-md-end mt-2 mt-md-0">
                                            <p className="mb-0 fw-bold">₱{(item.quantity * item.price).toFixed(2)}</p>
                                            <small className="text-muted">₱{item.price} each</small>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    {order.delivery_location && (
                        <Card className="mb-4 order-details-card">
                            <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                                <h5 className="mb-0">
                                    <FontAwesomeIcon icon={faShippingFast} className="me-2" />
                                    Delivery Information
                                </h5>
                            </Card.Header>
                            <Card.Body className="px-4">
                                <p className="mb-2">
                                    <strong>Address:</strong><br />
                                    {order.delivery_location.address_details}
                                </p>
                                <p className="mb-0">
                                    <strong>Coordinates:</strong><br />
                                    {order.delivery_location.latitude}, {order.delivery_location.longitude}
                                </p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                <Col lg={4}>
                    <Card className="order-details-card">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <Card.Body className="px-4">
                            <div className="summary-item mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Payment Status</span>
                                    <Badge bg={order.is_paid ? 'success' : 'danger'}>
                                        <FontAwesomeIcon icon={order.is_paid ? faCheckCircle : faTimesCircle} className="me-1" />
                                        {order.is_paid ? 'Paid' : 'Not Paid'}
                                    </Badge>
                                </div>
                                {order.is_paid && (
                                    <small className="text-muted">
                                        Paid on {formatDate(order.paid_at)}
                                    </small>
                                )}
                            </div>

                            <div className="summary-item mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Delivery Status</span>
                                    <Badge bg={order.is_delivered ? 'success' : 'warning'}>
                                        <FontAwesomeIcon icon={order.is_delivered ? faTruck : faClock} className="me-1" />
                                        {order.is_delivered ? 'Delivered' : 'Pending'}
                                    </Badge>
                                </div>
                                {order.is_delivered && (
                                    <small className="text-muted">
                                        Delivered on {formatDate(order.delivered_at)}
                                    </small>
                                )}
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between mt-4">
                                <h5>Total</h5>
                                <h5>₱{order.total_price}</h5>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
                    .order-details-card {
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    }
                    .order-item {
                        padding: 1rem 0;
                        border-bottom: 1px solid #e9ecef;
                    }
                    .order-item:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }
                    .order-item-image {
                        width: 100%;
                        height: auto;
                        border-radius: 8px;
                        object-fit: cover;
                    }
                    .status-badge, .date-badge {
                        padding: 0.5rem 0.75rem;
                        font-weight: 500;
                    }
                    .summary-item {
                        font-size: 0.95rem;
                    }
                    .badge {
                        font-weight: 500;
                        padding: 0.5rem 0.75rem;
                    }
                `}
            </style>
        </Container>
    )
}

export default OrderDetailsScreen 