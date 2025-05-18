import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Button, Modal, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowLeft, faHeart } from '@fortawesome/free-solid-svg-icons'
import Message from './Message'
import Loader from './Loader'
import { listWishlist, removeFromWishlist } from '../actions/wishlistActions'
import { addToCart } from '../actions/cartActions'
import './screens/WishlistScreen.css'

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

    const addToCartHandler = (productId) => {
        dispatch(addToCart(productId, 1))
    }

    if (!userInfo) {
        return (
            <Container className="py-3">
                <Message variant='info'>
                    Please <Link to="/login">login</Link> to view your wishlist
                </Message>
            </Container>
        )
    }

    return (
        <div className="wishlist-container">
            <Container>
                <Row className="mb-4">
                    <Col>
                        <Link to="/" className="btn continue-shopping-btn">
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />Continue Shopping
                        </Link>
                    </Col>
                </Row>

                {notification && (
                    <Message variant={notification.type}>{notification.message}</Message>
                )}

                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant='danger'>{error}</Message>
                ) : (
                    <Row>
                        <Col md={12}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="mb-0">My Wishlist ({wishlistItems.length} items)</h2>
                            </div>

                            {wishlistItems.length === 0 ? (
                                <div className="empty-wishlist">
                                    <FontAwesomeIcon icon={faHeart} className="mb-3" />
                                    <p>Your wishlist is empty</p>
                                    <Link to="/" className="btn continue-shopping-btn">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {wishlistItems.map(item => (
                                        <div key={item.id} className="wishlist-item">
                                            <Row className="align-items-center">
                                                <Col md={2}>
                                                    <Link to={`/product/${item.product._id}`}>
                                                        <img src={item.product.image} alt={item.product.productName} className="img-fluid" />
                                                    </Link>
                                                </Col>

                                                <Col md={4}>
                                                    <Link 
                                                        to={`/product/${item.product._id}`}
                                                        className="text-decoration-none"
                                                    >
                                                        <h5 className="wishlist-item-title">{item.product.productName}</h5>
                                                    </Link>
                                                    {item.product.productBrand && (
                                                        <p className="wishlist-item-brand">{item.product.productBrand}</p>
                                                    )}
                                                </Col>

                                                <Col md={2} className="text-center">
                                                    <span className="wishlist-item-price">₱{item.product.price}</span>
                                                </Col>

                                                <Col md={2} className="text-center">
                                                    {item.product.stockCount > 0 ? (
                                                        <Button
                                                            className="add-to-cart-btn"
                                                            onClick={() => addToCartHandler(item.product._id)}
                                                        >
                                                            Add to Cart
                                                        </Button>
                                                    ) : (
                                                        <span className="stock-status out-of-stock">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </Col>

                                                <Col md={2} className="text-end">
                                                    <Button
                                                        className="remove-wishlist-btn"
                                                        onClick={() => handleShowDeleteModal(item)}
                                                        aria-label="Remove from wishlist"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                )}

                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Remove from Wishlist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to remove {itemToDelete?.product.productName} from your wishlist?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Remove
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    )
}

export default WishlistScreen 