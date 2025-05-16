import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Row, Col, Image } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../Loader'
import Message from '../Message'
import { listMyOrders } from '../../actions/orderActions'

function OrderHistoryScreen() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const orderListMy = useSelector(state => state.orderListMy)
    const { loading, error, orders } = orderListMy

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        } else {
            dispatch(listMyOrders())
        }
    }, [dispatch, navigate, userInfo])

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

    const handleRowClick = (orderId) => {
        if (!orderId) return;
        try {
            navigate(`/order/${orderId}`);
        } catch (error) {
            console.error('Error navigating to order:', error);
        }
    }

    const renderItemImages = (items) => {
        const maxImagesToShow = 3;
        const displayItems = items.slice(0, maxImagesToShow);
        const remainingCount = items.length - maxImagesToShow;

        return (
            <div className="d-flex align-items-center">
                {displayItems.map((item, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            marginLeft: index > 0 ? '-10px' : '0',
                            zIndex: displayItems.length - index
                        }}
                    >
                        <Image
                            src={item.product.image}
                            alt={item.product.productName}
                            style={{
                                width: '35px',
                                height: '35px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }}
                        />
                    </div>
                ))}
                {remainingCount > 0 && (
                    <div 
                        className="d-flex align-items-center justify-content-center"
                        style={{ 
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            backgroundColor: '#e9ecef',
                            marginLeft: '-10px',
                            border: '2px solid white',
                            fontSize: '0.8rem',
                            color: '#6c757d'
                        }}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>
        );
    };

    const summarizeItems = (items) => {
        if (!items || items.length === 0) return 'No items';
        
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const itemText = totalItems === 1 ? 'item' : 'items';
        
        // Show first item name and indicate if there are more
        const firstItem = items[0].product.productName;
        if (items.length === 1) {
            return `${firstItem} (${totalItems} ${itemText})`;
        }
        return `${firstItem} and ${items.length - 1} more (${totalItems} ${itemText})`;
    }

    return (
        <div>
            <Row className="align-items-center">
                <Col>
                    <h1>Order History</h1>
                </Col>
            </Row>

            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : orders.length === 0 ? (
                <Message variant='info'>You haven't placed any orders yet.</Message>
            ) : (
                <Table hover responsive className='table-sm'>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Products</th>
                            <th>Items</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map(order => (
                            <tr 
                                key={order.id}
                                onClick={() => handleRowClick(order.id)}
                                style={{ cursor: 'pointer' }}
                                className="order-row"
                            >
                                <td>#{order.id}</td>
                                <td>{formatDate(order.created_at)}</td>
                                <td>{renderItemImages(order.items)}</td>
                                <td>{summarizeItems(order.items)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <style>
                {`
                    .order-row:hover {
                        background-color: #f8f9fa;
                    }
                `}
            </style>
        </div>
    )
}

export default OrderHistoryScreen 