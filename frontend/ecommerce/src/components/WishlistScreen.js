import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Button, Card, Alert, Modal } from 'react-bootstrap'
import Message from './Message'
import Loader from './Loader'
import { listWishlist, removeFromWishlist } from '../actions/wishlistActions'

function WishlistScreen() {
    const dispatch = useDispatch()
    const [notification, setNotification] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    const wishlist = useSelector(state => state.wishlist)
    const { loading, error, wishlistItems } = wishlist

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        if (userInfo) {
            dispatch(listWishlist())
                .catch(error => {
                    setNotification({
                        type: 'danger',
                        message: error.response?.data?.detail || 'Failed to load wishlist'
                    })
                    setTimeout(() => setNotification(null), 3000)
                })
        }
    }, [dispatch, userInfo])

    const handleShowDeleteModal = (item) => {
        setItemToDelete(item)
        setShowDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setItemToDelete(null)
    }

    const confirmDelete = () => {
        if (itemToDelete) {
            dispatch(removeFromWishlist(itemToDelete.product._id))
                .then(() => {
                    setNotification({
                        type: 'success',
                        message: 'Item removed from wishlist successfully!'
                    })
                    setTimeout(() => setNotification(null), 3000)
                })
                .catch(error => {
                    setNotification({
                        type: 'danger',
                        message: error.response?.data?.detail || 'Failed to remove item from wishlist'
                    })
                    setTimeout(() => setNotification(null), 3000)
                })
            handleCloseDeleteModal()
        }
    }

    return (
        <div>
            <h1>My Wishlist</h1>
            {notification && (
                <Alert variant={notification.type} onClose={() => setNotification(null)} dismissible>
                    {notification.message}
                </Alert>
            )}
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : (
                <Row>
                    <Col md={8}>
                        {wishlistItems.length === 0 ? (
                            <Message variant='info'>
                                Your wishlist is empty
                            </Message>
                        ) : (
                            <ListGroup variant='flush'>
                                {wishlistItems.map(item => (
                                    <ListGroup.Item key={item.id}>
                                        <Row>
                                            <Col md={2}>
                                                <img src={item.product.image} alt={item.product.productName} className="img-fluid rounded" />
                                            </Col>

                                            <Col md={3}>
                                                {item.product.productName}
                                            </Col>

                                            <Col md={2}>
                                                ${item.product.price}
                                            </Col>

                                            <Col md={3}>
                                                <span className="text-danger">Out of Stock</span>
                                            </Col>

                                            <Col md={2}>
                                                <Button
                                                    type='button'
                                                    variant='light'
                                                    onClick={() => handleShowDeleteModal(item)}
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
                </Row>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove{' '}
                    <strong>{itemToDelete?.product.productName}</strong> from your wishlist?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default WishlistScreen 