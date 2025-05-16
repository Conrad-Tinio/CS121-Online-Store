import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Nav, Table, Badge } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserAccountScreen() {
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: ''
    });
    const [message, setMessage] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                address: userInfo.address || '',
                phone: userInfo.phone || ''
            });
            fetchOrders();
        }
    }, [userInfo, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.get('/api/orders/myorders/', config);
            console.log('Fetched orders:', data);
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders. Please try again later.');
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        // TODO: Implement update profile functionality
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditMode(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getOrderStatusBadge = (status) => {
        const variants = {
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const renderProfile = () => (
        <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editMode}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editMode}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                />
            </Form.Group>

            <div className="d-flex justify-content-end">
                {!editMode ? (
                    <Button variant="primary" onClick={handleEdit}>
                        Edit Profile
                    </Button>
                ) : (
                    <>
                        <Button variant="secondary" className="me-2" onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit">
                            Save Changes
                        </Button>
                    </>
                )}
            </div>
        </Form>
    );

    const renderOrders = () => {
        console.log('Rendering orders:', orders);
        return (
            <div className="order-history">
                {loading ? (
                    <div className="text-center py-3">Loading orders...</div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : orders.length === 0 ? (
                    <Alert variant="info">You haven't placed any orders yet.</Alert>
                ) : (
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                console.log('Rendering order:', order);
                                const totalPrice = order.total_price ? parseFloat(order.total_price) : 0;
                                return (
                                    <tr key={order.id}>
                                        <td>#{order.id ? order.id.toString().slice(-6) : 'N/A'}</td>
                                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>${totalPrice.toFixed(2)}</td>
                                        <td>{getOrderStatusBadge(order.status || 'Pending')}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate(`/order/${order.id}`)}
                                                disabled={!order.id}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
            </div>
        );
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="bg-primary">
                            <Nav variant="tabs" className="nav-tabs-custom">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'profile'}
                                        onClick={() => setActiveTab('profile')}
                                        className={activeTab === 'profile' ? 'bg-white text-primary' : 'text-white'}
                                        style={{ border: 'none' }}
                                    >
                                        Profile
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'orders'}
                                        onClick={() => setActiveTab('orders')}
                                        className={activeTab === 'orders' ? 'bg-white text-primary' : 'text-white'}
                                        style={{ border: 'none' }}
                                    >
                                        Order History
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        <Card.Body>
                            {message && (
                                <Alert variant={message.type}>
                                    {message.text}
                                </Alert>
                            )}
                            
                            {activeTab === 'profile' ? renderProfile() : renderOrders()}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <style>
                {`
                    .nav-tabs-custom .nav-link {
                        margin-bottom: -1px;
                        border: 1px solid transparent;
                        border-top-left-radius: 0.25rem;
                        border-top-right-radius: 0.25rem;
                        padding: 0.5rem 1rem;
                        cursor: pointer;
                    }
                    .nav-tabs-custom .nav-link:hover:not(.active) {
                        background-color: rgba(255, 255, 255, 0.1);
                        border-color: transparent;
                    }
                    .nav-tabs-custom .nav-link.active {
                        background-color: white;
                        border-color: transparent;
                    }
                `}
            </style>
        </Container>
    );
}

export default UserAccountScreen; 