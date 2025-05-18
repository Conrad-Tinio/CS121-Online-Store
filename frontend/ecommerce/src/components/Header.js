import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal, Badge, NavDropdown } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";
import { listWishlist } from "../actions/wishlistActions";
import axios from 'axios';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCircleUser, 
  faBox, 
  faRightFromBracket,
  faMagnifyingGlass,
  faHeart,
  faCartShopping,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import logo from '../logo/Toy_Logo.png';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Check if we're on the login or register page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Check if we're on the profile/account page
  const isProfilePage = location.pathname === '/account';

  // Initialize state from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [currentCategory, setCurrentCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(false);
  
  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // Get user info and wishlist from Redux store
  const wishlist = useSelector(state => state.wishlist);
  const { wishlistItems } = wishlist;

  // Get cart items count from Redux store
  const cart = useSelector(state => state.cart);
  const { cartItems } = cart;

  const categoryContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setCurrentCategory(params.get('category') || '');
  }, [location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axios.get('/api/categories/')
      setCategories(data)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (userInfo) {
      dispatch(listWishlist());
    }
  }, [dispatch, userInfo]);

  const logoutHandler = () => {
    dispatch(logout())
    setExpanded(false);
  }

  const handleCategoryChange = (newCategory = '') => {
    console.log('Category changed to:', newCategory);
    setCurrentCategory(newCategory);
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams(location.search);
    
    // Update category
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    
    // Keep search keyword if exists
    if (keyword.trim()) {
      params.set('keyword', keyword);
    }
    
    // Navigate to the new URL
    navigate({
      pathname: '/',
      search: params.toString() ? `?${params.toString()}` : ''
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Update parameters
    if (keyword.trim()) {
      params.set('keyword', keyword);
    }
    
    if (currentCategory) {
      params.set('category', currentCategory);
    }

    const searchQuery = params.toString();
    console.log('Final URL params:', searchQuery);
    
    // Navigate with the new search params
    navigate({
      pathname: '/',
      search: searchQuery ? `?${searchQuery}` : ''
    });
    
    setExpanded(false);
  };

  // Close navbar when navigating
  const handleNavigation = () => {
    setExpanded(false);
  };

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    if (categoryContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Scroll handlers
  const handleScrollLeft = () => {
    if (categoryContainerRef.current) {
      const scrollAmount = 200;
      const container = categoryContainerRef.current;
      const targetScroll = Math.max(0, container.scrollLeft - scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (categoryContainerRef.current) {
      const scrollAmount = 200;
      const container = categoryContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const targetScroll = Math.min(maxScroll, container.scrollLeft + scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = categoryContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      
      // Check scroll buttons when window resizes
      window.addEventListener('resize', checkScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      }
    };
  }, [categories]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-light py-2">
        <Container className="d-flex justify-content-end">
          {userInfo ? (
            <NavDropdown 
              title={<span className="text-dark"><FontAwesomeIcon icon={faUser} className="me-1" /> My Account</span>} 
              id="basic-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/account">
                <FontAwesomeIcon icon={faCircleUser} className="me-2" />Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/account" state={{ activeTab: 'orders' }}>
                <FontAwesomeIcon icon={faBox} className="me-2" />Orders
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logoutHandler}>
                <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />Logout
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Link to="/login" className="text-dark">
              <FontAwesomeIcon icon={faUser} className="me-1" /> Log in / Sign up
            </Link>
          )}
        </Container>
      </div>

      {/* Main Header */}
      <style>
        {`
          @keyframes gradientAnimation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .brand-text {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.8rem;
            font-weight: bold;
            margin-left: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }

          .brand-text:hover {
            background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientAnimation 3s ease infinite;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.2);
            transform: scale(1.05);
          }
        `}
      </style>
      <Navbar bg="primary" variant="dark" expand="lg" expanded={expanded}>
        <Container className="py-2">
          <Navbar.Brand as={Link} to="/" className="me-5 d-flex align-items-center">
            <img
              src={logo}
              height="40"
              className="d-inline-block align-top"
              alt="Logo"
            />
            <span className="brand-text">
              Toy Kingdom
            </span>
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            onClick={() => setExpanded(!expanded)}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            {!isAuthPage && (
              <Form onSubmit={submitHandler} className="d-flex justify-content-center align-items-center flex-grow-1 mx-lg-5">
                <div className="position-relative d-flex" style={{ width: '100%', maxWidth: '600px' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="search-input"
                    style={{
                      borderRadius: '30px',
                      paddingRight: '50px',
                      paddingLeft: '20px',
                      border: 'none',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      height: '45px',
                      width: '100%'
                    }}
                  />
                  <Button 
                    type="submit" 
                    style={{
                      backgroundColor: '#FFD700',
                      border: 'none',
                      borderRadius: '50%',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      right: '0',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    className="d-flex align-items-center justify-content-center"
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFC700'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#000' }} />
                  </Button>
                </div>
              </Form>
            )}

            <div className="d-flex align-items-center gap-4">
              {userInfo && !isAuthPage && (
                <Link to="/wishlist" className="icon-button position-relative">
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                  {wishlistItems?.length > 0 && (
                    <span className="badge-counter">{wishlistItems.length}</span>
                  )}
                </Link>
              )}
              {!isAuthPage && (
                <Link to="/cart" className="icon-button position-relative">
                  <FontAwesomeIcon icon={faCartShopping} size="lg" />
                  <span className="badge-counter">{cartItems?.length || 0}</span>
                </Link>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Category Navigation */}
      {!isAuthPage && !isProfilePage && (
        <nav className="category-nav border-bottom" style={{ backgroundColor: '#e8f4ff' }}>
          <Container className="position-relative d-flex align-items-center">
            {/* Left scroll button */}
            <Button 
              variant="light" 
              className="category-scroll-button"
              onClick={handleScrollLeft}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                color: '#0275d8',
                opacity: showLeftScroll ? 1 : 0.5,
                cursor: showLeftScroll ? 'pointer' : 'not-allowed',
                border: 'none',
                marginLeft: '0.5rem'
              }}
              disabled={!showLeftScroll}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>

            {/* Category buttons */}
            <div 
              ref={categoryContainerRef}
              className="d-flex category-container flex-grow-1"
              style={{
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                padding: '1rem 3rem',
                gap: '1rem',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                position: 'relative',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
              onScroll={checkScrollButtons}
            >
              <Button
                onClick={() => handleCategoryChange('')}
                className="category-button all-products"
                variant={!currentCategory ? 'primary' : 'outline-primary'}
                style={{
                  whiteSpace: 'nowrap',
                  borderRadius: '20px',
                  padding: '0.5rem 1.2rem',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  border: !currentCategory ? 'none' : '2px solid #28a745',
                  backgroundColor: !currentCategory ? '#28a745' : 'white',
                  color: !currentCategory ? 'white' : '#28a745',
                  fontWeight: '500',
                  minWidth: 'fit-content',
                  boxShadow: !currentCategory ? '0 4px 8px rgba(40, 167, 69, 0.3)' : 'none'
                }}
              >
                All Products
              </Button>
              {categories.map(categoryItem => (
                <Button
                  key={categoryItem._id}
                  onClick={() => handleCategoryChange(categoryItem.name)}
                  className="category-button"
                  variant={categoryItem.name === currentCategory ? 'primary' : 'outline-primary'}
                  style={{
                    whiteSpace: 'nowrap',
                    borderRadius: '20px',
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    border: categoryItem.name === currentCategory ? 'none' : '2px solid #0275d8',
                    backgroundColor: categoryItem.name === currentCategory ? '#024b8b' : 'white',
                    color: categoryItem.name === currentCategory ? 'white' : '#0275d8',
                    fontWeight: '500',
                    minWidth: 'fit-content',
                    boxShadow: categoryItem.name === currentCategory ? '0 4px 8px rgba(2, 75, 139, 0.3)' : 'none'
                  }}
                >
                  {categoryItem.name}
                </Button>
              ))}
            </div>

            {/* Right scroll button */}
            {showRightScroll && (
              <Button 
                variant="light" 
                className="category-scroll-button right"
                onClick={handleScrollRight}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  color: '#0275d8',
                  border: 'none',
                  marginRight: '0.5rem',
                  opacity: showRightScroll ? 1 : 0.5,
                  cursor: showRightScroll ? 'pointer' : 'not-allowed'
                }}
                disabled={!showRightScroll}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            )}
          </Container>
        </nav>
      )}
    </>
  );
}

export default Header;