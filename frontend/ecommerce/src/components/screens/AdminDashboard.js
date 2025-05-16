import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('sales');

    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
        } else {
            fetchSalesStats();
        }
    }, [userInfo, navigate]);

    const fetchSalesStats = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            const { data } = await axios.get('/api/admin/sales-stats/', config);
            setStats(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch sales statistics');
            setLoading(false);
        }
    };

    const renderSalesStats = () => (
        <>
            <Row>
                <Col md={12}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">Quick Statistics</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {/* Today's Stats */}
                                <Col md={3} className="mb-4 mb-md-0">
                                    <div className="text-center">
                                        <h6 className="text-muted">Today's Sales</h6>
                                        <h3 className="mb-0">₱{stats.today.sales.toFixed(2)}</h3>
                                        <small className="text-muted">{stats.today.orders} orders</small>
                                    </div>
                                </Col>

                                {/* This Week's Stats */}
                                <Col md={3} className="mb-4 mb-md-0">
                                    <div className="text-center">
                                        <h6 className="text-muted">This Week</h6>
                                        <h3 className="mb-0">₱{stats.week.sales.toFixed(2)}</h3>
                                        <small className="text-muted">{stats.week.orders} orders</small>
                                    </div>
                                </Col>

                                {/* This Month's Stats */}
                                <Col md={3} className="mb-4 mb-md-0">
                                    <div className="text-center">
                                        <h6 className="text-muted">This Month</h6>
                                        <h3 className="mb-0">₱{stats.month.sales.toFixed(2)}</h3>
                                        <small className="text-muted">{stats.month.orders} orders</small>
                                    </div>
                                </Col>

                                {/* Overall Stats */}
                                <Col md={3}>
                                    <div className="text-center">
                                        <h6 className="text-muted">Total Sales</h6>
                                        <h3 className="mb-0">₱{stats.overall.total_sales.toFixed(2)}</h3>
                                        <small className="text-muted">{stats.overall.total_orders} total orders</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Order Status Breakdown */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">Order Status Breakdown</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped hover responsive>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Orders</th>
                                        <th>Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.status_breakdown.map((status) => (
                                        <tr key={status.status}>
                                            <td>
                                                <span className={`badge bg-${getBadgeColor(status.status)}`}>
                                                    {status.status}
                                                </span>
                                            </td>
                                            <td>{status.count}</td>
                                            <td>₱{status.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Best Selling Products */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">Best Selling Products</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table striped hover responsive>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.best_sellers.map((product) => (
                                        <tr key={product.product__productName}>
                                            <td>{product.product__productName}</td>
                                            <td>{product.total_quantity}</td>
                                            <td>₱{product.total_sales.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );

    const getBadgeColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'warning';
            case 'Processing':
                return 'info';
            case 'Shipped':
                return 'primary';
            case 'Delivered':
                return 'success';
            case 'Cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    if (loading) return <Container className="py-5"><h2>Loading...</h2></Container>;
    if (error) return <Container className="py-5"><h2>Error: {error}</h2></Container>;
    if (!stats) return null;

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-4">Vendor Dashboard</h2>
                    <Nav variant="tabs" className="mb-4">
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'sales'} 
                                onClick={() => setActiveTab('sales')}
                            >
                                Sales Overview
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'orders'} 
                                onClick={() => setActiveTab('orders')}
                            >
                                Manage Orders
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                active={activeTab === 'products'} 
                                onClick={() => setActiveTab('products')}
                            >
                                Manage Products
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {activeTab === 'sales' && renderSalesStats()}
            {/* We can add other tabs' content here later */}
        </Container>
    );
}

export default AdminDashboard; 