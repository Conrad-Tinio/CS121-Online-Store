import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Card, Image, Button, Badge } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Message from '../Message'

function OrderDetailsScreen() {
    const navigate = useNavigate()
    const { id } = useParams()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const orderListMy = useSelector(state => state.orderListMy)
    const { orders } = orderListMy

    const order = orders ? orders.find(o => o.id === Number(id)) : null

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        }
    }, [userInfo, navigate])

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
        <div className="py-3">
            <Button 
                variant="light" 
                onClick={() => navigate('/orders')}
                className="mb-4"
            >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Orders
            </Button>

            <div className="d-flex align-items-center mb-4 flex-wrap">
                <h2 className="mb-0 me-4">Order #{order.id}</h2>
                <div className="d-flex gap-2 flex-wrap">
                    <Badge 
                        bg={getStatusColor(order.status)}
                        className="fs-6 d-flex align-items-center"
                    >
                        <i className="fas fa-box me-1"></i>
                        {order.status}
                    </Badge>

                    <Badge 
                        bg={order.is_paid ? 'success' : 'danger'}
                        className="fs-6 d-flex align-items-center"
                    >
                        <i className={`fas fa-${order.is_paid ? 'check-circle' : 'times-circle'} me-1`}></i>
                        {order.is_paid ? 'Paid' : 'Not Paid'}
                    </Badge>

                    <Badge 
                        bg={order.is_delivered ? 'success' : 'warning'}
                        className="fs-6 d-flex align-items-center"
                    >
                        <i className={`fas fa-${order.is_delivered ? 'truck' : 'clock'} me-1`}></i>
                        {order.is_delivered ? 'Delivered' : 'Pending Delivery'}
                    </Badge>

                    <Badge 
                        bg="info" 
                        className="fs-6 d-flex align-items-center"
                    >
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(order.created_at)}
                    </Badge>
                </div>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header as="h5">Items</Card.Header>
                        <Card.Body>
                            {order.items.map((item, index) => (
                                <div key={index} className="d-flex align-items-center mb-3 p-2 border-bottom">
                                    {item.product.image && (
                                        <Image 
                                            src={item.product.image} 
                                            alt={item.product.productName}
                                            style={{ 
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                            className="me-3"
                                        />
                                    )}
                                    <div className="flex-grow-1">
                                        <h6 className="mb-0">{item.product.productName}</h6>
                                        <div className="text-muted">
                                            {item.quantity} × ${item.product.price} = ${(item.quantity * item.product.price).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header as="h5">Delivery Information</Card.Header>
                        <Card.Body>
                            {order.delivery_location ? (
                                <>
                                    <p><strong>Address:</strong> {order.delivery_location.address_details}</p>
                                    <p><strong>Coordinates:</strong> {order.delivery_location.latitude}, {order.delivery_location.longitude}</p>
                                </>
                            ) : (
                                <p className="text-muted">No delivery information available</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header as="h5">Order Summary</Card.Header>
                        <Card.Body>
                            <Row className="mb-2">
                                <Col>Order Date:</Col>
                                <Col className="text-end">{formatDate(order.created_at)}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col>Status:</Col>
                                <Col className="text-end">
                                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col>Payment Status:</Col>
                                <Col className="text-end">
                                    {order.is_paid ? (
                                        <span className="text-success">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Paid on {formatDate(order.paid_at)}
                                        </span>
                                    ) : (
                                        <span className="text-danger">
                                            <i className="fas fa-times-circle me-1"></i>
                                            Not Paid
                                        </span>
                                    )}
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col>Delivery Status:</Col>
                                <Col className="text-end">
                                    {order.is_delivered ? (
                                        <span className="text-success">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Delivered on {formatDate(order.delivered_at)}
                                        </span>
                                    ) : (
                                        <span className="text-danger">
                                            <i className="fas fa-times-circle me-1"></i>
                                            Not Delivered
                                        </span>
                                    )}
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-2">
                                <Col><strong>Total:</strong></Col>
                                <Col className="text-end"><strong>${order.total_price}</strong></Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default OrderDetailsScreen 