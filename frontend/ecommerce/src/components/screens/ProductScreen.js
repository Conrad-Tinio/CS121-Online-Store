import React from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Row, Col, Image, ListGroup, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faHeart } from '@fortawesome/free-solid-svg-icons';
import Rating from "../Rating";
import { listProductDetails } from "../../actions/productActions";
import { addToWishlist, listWishlist } from "../../actions/wishlistActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";
import { addToCart } from "../../actions/cartActions";

function ProductScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const dispatch = useDispatch();
  const productDetails = useSelector((state) => state.productDetails);
  const { error, loading, product } = productDetails;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const wishlist = useSelector((state) => state.wishlist);
  const { wishlistItems } = wishlist;

  const isInWishlist = wishlistItems?.some(item => String(item.product._id) === String(id));

  const handleTagClick = (filterType, value) => {
    if (!filterType || !value) return;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (filterType.toLowerCase() === 'arrival status') {
      searchParams.set('arrival', value.toLowerCase());
    } else {
      searchParams.set(filterType.toLowerCase(), value);
    }
    
    const finalUrl = `/?${searchParams.toString()}`;
    navigate(finalUrl);
  };

  const renderTags = (tags) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
    
    return (
      <div className="d-flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => {
          if (!tag.tag_type || !tag.name) return null;

          return (
            <span 
              key={index}
              onClick={() => handleTagClick(tag.tag_type, tag.name)}
              className={`badge bg-${tag.color || 'secondary'}`}
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
              {tag.tag_type}: {tag.name}
            </span>
          );
        })}
        {isInWishlist && (
          <span 
            onClick={() => navigate('/wishlist')}
            className="badge bg-info"
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
    );
  };

  useEffect(() => {
    dispatch(listProductDetails(id));
    if (userInfo) {
      dispatch(listWishlist());
    }
  }, [dispatch, id, userInfo]);

  const addToCartHandler = () => {
    if (!userInfo) {
      setShowLoginMessage(true);
    } else {
      dispatch(addToCart(id, quantity));
      navigate('/cart');
    }
  }

  const addToWishlistHandler = () => {
    if (!userInfo) {
      setShowLoginMessage(true);
      return;
    }
    if (!isInWishlist) {
      dispatch(addToWishlist(id));
    }
  }

  return (
    <Container className="py-4">
      <Button 
        variant="light" 
        onClick={() => navigate('/')} 
        className="mb-4"
      >
        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
        Back
      </Button>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          <Col md={6} className="mb-4">
            <Image src={product.image} alt={product.productName} fluid className="rounded" />
          </Col>

          <Col md={6}>
            <div className="mb-4">
              <h2 className="mb-3">{product.productName}</h2>
              {renderTags(product.tags)}
              <div className="d-flex align-items-center mb-3">
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color={"#f8e825"}
                />
              </div>
              <h3 className="mb-4">₱{product.price}</h3>
            </div>

            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>
                    <strong>{product.stockCount > 0 ? "In Stock" : "Out of Stock"}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              {product.stockCount > 0 && (
                <ListGroup.Item>
                  <Row className="align-items-center">
                    <Col>Quantity:</Col>
                    <Col xs="auto">
                      <Form.Control
                        as="select"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-select-lg"
                      >
                        {[...Array(product.stockCount).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}

              {showLoginMessage && (
                <ListGroup.Item>
                  <Message variant="info">
                    Please <Link to="/login">login</Link> to add items to your cart
                  </Message>
                </ListGroup.Item>
              )}
            </ListGroup>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                className="py-3"
                onClick={addToCartHandler}
                disabled={product.stockCount === 0}
              >
                <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} />
                {product.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              {!isInWishlist && product.stockCount === 0 && (
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="py-3"
                  onClick={addToWishlistHandler}
                >
                  <FontAwesomeIcon icon={faHeart} style={{ marginRight: '8px' }} />
                  Add to Wishlist
                </Button>
              )}
            </div>

            <div className="mt-4">
              <h4>Product Details</h4>
              <p>{product.productInfo}</p>
              {product.productBrand && (
                <p><strong>Brand:</strong> {product.productBrand}</p>
              )}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default ProductScreen;
