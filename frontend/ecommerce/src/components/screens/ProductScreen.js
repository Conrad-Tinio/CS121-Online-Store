import React from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, ListGroupItem } from "react-bootstrap";
import { Row, Col, Image, ListGroup, Button, Card, Alert } from "react-bootstrap";
import Rating from "../Rating";
import { listProductDetails } from "../../actions/productActions";
import { addToWishlist, listWishlist } from "../../actions/wishlistActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";
import { Form } from "react-bootstrap";

function ProductScreen({ params }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [loginButtonClicked, setLoginButtonClicked] = useState(false);
  const [notification, setNotification] = useState(null);
  const dispatch = useDispatch();
  const productDetails = useSelector((state) => state.productDetails);
  const { error, loading, product } = productDetails;
  
  // Get user login information
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Get wishlist information
  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems, loading: wishlistLoading, error: wishlistError } = wishlist;

  const handleTagClick = (filterType, value) => {
    console.log('Applying filter:', filterType, value); // Debug log
    // Preserve any existing search parameters
    const searchParams = new URLSearchParams(window.location.search);
    
    // Clear any existing stock and price_range filters first
    searchParams.delete('stock');
    searchParams.delete('price_range');
    
    // Add the new filter
    searchParams.set(filterType, value);
    
    // Log the final URL for debugging
    const finalUrl = `/?${searchParams.toString()}`;
    console.log('Navigating to:', finalUrl);
    
    // Navigate with the updated filters
    navigate(finalUrl);
  };

  // Check if product is in wishlist
  const isInWishlist = wishlistItems?.some(item => {
    const itemId = String(item.product._id);
    const currentId = String(id);
    return itemId === currentId;
  });

  const getStockStatusTag = (stockCount) => {
    if (stockCount > 10) {
      return { text: 'In Stock', variant: 'success', icon: '✓', filter: 'stock=inStock' };
    } else if (stockCount > 0) {
      return { text: 'Low Stock', variant: 'warning', icon: '!', filter: 'stock=lowStock' };
    } else {
      return { text: 'Out of Stock', variant: 'danger', icon: '×', filter: 'stock=outOfStock' };
    }
  };

  const getPriceTag = (price) => {
    if (price < 1000) {
      return { text: 'Budget', variant: 'info', icon: '₱', filter: 'budget' };
    } else if (price < 5000) {
      return { text: 'Mid-Range', variant: 'primary', icon: '₱₱', filter: 'midRange' };
    } else {
      return { text: 'Premium', variant: 'dark', icon: '₱₱₱', filter: 'premium' };
    }
  };

  useEffect(() => {
    console.log('Current product ID:', id);
    console.log('Wishlist items:', wishlistItems);
    console.log('Is in wishlist:', isInWishlist);
  }, [id, wishlistItems, isInWishlist]);

  useEffect(() => {
    dispatch(listProductDetails(id));
    if (userInfo) {
      dispatch(listWishlist());
    }
  }, [dispatch, id, userInfo]);

  useEffect(() => {
    // Show error notification if wishlist operation fails
    if (wishlistError) {
      setNotification({ type: 'danger', message: wishlistError });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [wishlistError]);

  // Set initial notification if item is in wishlist
  useEffect(() => {
    if (isInWishlist) {
      setNotification({ 
        type: 'info', 
        message: 'This item is already in your wishlist' 
      });
    } else {
      setNotification(null);
    }
  }, [isInWishlist]);

  const addToCartHandler = () => {
    if (!userInfo) {
      setShowLoginMessage(true);
      setLoginButtonClicked(true);
    } else {
      navigate(`/cart/${id}?quantity=${quantity}`);
    }
  }

  const addToWishlistHandler = async () => {
    if (!userInfo) {
      setShowLoginMessage(true);
      return;
    }
    
    if (isInWishlist) {
      setNotification({ 
        type: 'info', 
        message: 'This item is already in your wishlist' 
      });
      return;
    }

    try {
      await dispatch(addToWishlist(id));
      setNotification({ 
        type: 'success', 
        message: 'Item added to wishlist successfully!' 
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ 
        type: 'danger', 
        message: error.response?.data?.detail || 'Failed to add item to wishlist' 
      });
      setTimeout(() => setNotification(null), 3000);
    }
  }

  return (
    <Container>
      <div>
        <Link to="/" className="btn btn-dark my-3">
          Go Back
        </Link>

        {notification && (
          <Alert 
            variant={notification.type} 
            onClose={() => setNotification(null)} 
            dismissible={notification.type !== 'info'}
          >
            {notification.message}
          </Alert>
        )}

        {
          loading ? (
            <Loader/>
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <Row>
              <Col md={6}>
                <Image src={product.image} all={product.name} fluid />
              </Col>

              <Col md={3}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <h3 className="mb-3">{product.productName}</h3>
                      <div className="d-flex flex-wrap gap-2" style={{ margin: '-2px' }}>
                        {/* Stock Status Tag */}
                        {(() => {
                          const stockStatus = getStockStatusTag(product.stockCount);
                          return (
                            <span 
                              onClick={() => handleTagClick('stock', stockStatus.filter.split('=')[1])}
                              className={`badge bg-${stockStatus.variant} d-flex align-items-center`}
                              style={{ 
                                padding: '8px 12px', 
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: 0.9
                              }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                            >
                              <span className="me-1">{stockStatus.icon}</span>
                              {stockStatus.text}
                            </span>
                          );
                        })()}
                        
                        {/* Price Range Tag */}
                        {(() => {
                          const priceTag = getPriceTag(product.price);
                          return (
                            <span 
                              onClick={() => handleTagClick('price_range', priceTag.filter)}
                              className={`badge bg-${priceTag.variant} d-flex align-items-center`}
                              style={{ 
                                padding: '8px 12px', 
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: 0.9
                              }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                            >
                              <span className="me-1">{priceTag.icon}</span>
                              {priceTag.text}
                            </span>
                          );
                        })()}

                        {/* Wishlist Tag */}
                        {isInWishlist && (
                          <span 
                            onClick={() => navigate('/wishlist')}
                            className="badge bg-info d-flex align-items-center"
                            style={{ 
                              padding: '8px 12px', 
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: 0.9
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                          >
                            <span className="me-1">♥</span>
                            Wishlisted
                          </span>
                        )}
                      </div>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <Rating
                        value={product.rating}
                        text={` ${product.numReviews} reviews`}
                        color={"#f8e825"}
                      />
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Brand:</strong> {product.productBrand}
                    </ListGroup.Item>

                    <ListGroup.Item style={{ textAlign: "justify" }}>
                      <strong>Description:</strong> {product.productInfo}
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>

              <Col md={3}>
                <Card>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Price:</Col>
                        <Col>
                          <strong>₱{product.price}</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>
                          {product.stockCount > 0 ? "In Stock" : "Out of Stock"} ({product.stockCount})
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    {showLoginMessage && (
                      <ListGroup.Item>
                        <Message variant="info">
                          Please <Link to="/login">login</Link> to add items to your cart
                        </Message>
                      </ListGroup.Item>
                    )}

                    {product.stockCount > 0 && (
                        <ListGroup.Item>
                          <Row>
                            <Col>Quantity: </Col>
                            <Col xs="auto" className="my-1">
                              <Form.Control 
                                as="select"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                disabled={!userInfo}
                              >
                                {[... Array(product.stockCount).keys()].map((x) => (
                                  <option key={x+1} value={x+1}>
                                    {x+1}
                                  </option>
                                ))}
                              </Form.Control>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      )
                    }

                    <ListGroup.Item>
                      {!userInfo && loginButtonClicked ? (
                        <Button
                          className="btn-block btn-secondary"
                          type="button"
                          disabled
                          style={{ cursor: 'not-allowed' }}
                        >
                          Login Required
                        </Button>
                      ) : (
                        <Button
                          className="btn-block btn-success" 
                          disabled={product.stockCount === 0}
                          type="button"
                          onClick={addToCartHandler}
                        >
                          {userInfo ? 'Add to Cart' : 'Login to Add to Cart'}
                        </Button>
                      )}
                    </ListGroup.Item>

                    {product.stockCount === 0 && (
                      <ListGroup.Item>
                        <Button
                          className={`btn-block ${isInWishlist ? 'btn-secondary' : 'btn-info'}`}
                          type="button"
                          onClick={isInWishlist ? undefined : addToWishlistHandler}
                          disabled={isInWishlist || wishlistLoading}
                          style={{
                            cursor: isInWishlist ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: 0.9
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                        >
                          {wishlistLoading ? 'Adding to Wishlist...' : 
                            !userInfo 
                              ? 'Login to Add to Wishlist'
                              : isInWishlist
                                ? 'Already in Wishlist'
                                : 'Add to Wishlist'
                          }
                        </Button>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          )
        }

      </div>
    </Container>
  );
}

export default ProductScreen;
