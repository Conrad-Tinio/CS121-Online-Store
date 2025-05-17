import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal, Badge, NavDropdown } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";
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

  // Initialize state from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [currentCategory, setCurrentCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // State for tag types
  const [tagTypes, setTagTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});

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

  // Fetch tag types
  useEffect(() => {
    const fetchTagTypes = async () => {
      try {
        const { data } = await axios.get('/api/tag-types/');
        setTagTypes(data);
      } catch (error) {
        console.error('Error fetching tag types:', error);
      }
    };
    fetchTagTypes();
  }, []);

  // Update selected tags from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSelectedTags = {};
    tagTypes.forEach(type => {
      const value = params.get(type.name.toLowerCase());
      if (value) {
        // Split comma-separated values into array
        newSelectedTags[type.name] = value.split(',');
      } else {
        newSelectedTags[type.name] = [];
      }
    });
    setSelectedTags(newSelectedTags);
  }, [location.search, tagTypes]);

  const logoutHandler = () => {
    dispatch(logout())
    setExpanded(false);
  }

  // Handle category change
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
    
    // Keep other existing filters
    const searchQuery = params.toString();
    
    // Navigate to the new URL
    navigate({
      pathname: '/',
      search: searchQuery ? `?${searchQuery}` : ''
    });
  };

  // Handle tag selection
  const handleTagSelect = (tagType, tagName) => {
    setSelectedTags(prev => {
      const newTags = { ...prev };
      if (!newTags[tagType]) {
        newTags[tagType] = [];
      }
      
      const index = newTags[tagType].indexOf(tagName);
      if (index === -1) {
        // Add tag if not selected
        newTags[tagType] = [...newTags[tagType], tagName];
      } else {
        // Remove tag if already selected
        newTags[tagType] = newTags[tagType].filter(t => t !== tagName);
      }
      return newTags;
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('\nSubmitting filters from Header:');
    console.log('Current state:', {
      keyword,
      currentCategory,
      selectedTags
    });
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Update parameters
    if (keyword.trim()) {
      params.set('keyword', keyword);
    }
    
    if (currentCategory) {
      params.set('category', currentCategory);
    }

    // Add tag filters
    Object.entries(selectedTags).forEach(([type, values]) => {
      if (values.length > 0) {
        params.set(type.toLowerCase(), values.join(','));
      }
    });

    const searchQuery = params.toString();
    console.log('Final URL params:', searchQuery);
    
    // Navigate with the new search params
    navigate({
      pathname: '/',
      search: searchQuery ? `?${searchQuery}` : ''
    });
    
    // Close modals
    setShowFilter(false);
    setExpanded(false);
  };

  const clearFilters = () => {
    console.log('Clearing all filters');
    setKeyword('');
    setCurrentCategory('');
    setSelectedTags({});
    navigate('/', { replace: true });
    setShowFilter(false);
  };

  // Close navbar when navigating
  const handleNavigation = () => {
    setExpanded(false);
  };

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return Boolean(
      keyword ||
      currentCategory ||
      Object.keys(selectedTags).length > 0
    );
  };

  // Helper function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (keyword) count++;
    if (currentCategory) count++;
    count += Object.keys(selectedTags).length;
    return count;
  };

  // Helper function to get active filter summary
  const getActiveFilterSummary = () => {
    const filters = [];
    if (keyword) filters.push(`Search: "${keyword}"`);
    if (currentCategory) filters.push(`Category: ${currentCategory}`);
    
    // Add tag filters to summary
    Object.entries(selectedTags).forEach(([type, values]) => {
      filters.push(`${type}: ${values.join(', ')}`);
    });

    return filters;
  };

  // Render tag type filters
  const renderTagTypeFilters = () => (
    <>
      {tagTypes.map(tagType => (
        <Form.Group className="mb-3" key={tagType.id}>
          <Form.Label>{tagType.name}</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {tagType.tags.map(tag => (
              <Button
                key={tag.id}
                variant={selectedTags[tagType.name]?.includes(tag.name) ? tagType.color : 'outline-secondary'}
                className="d-flex align-items-center"
                onClick={() => handleTagSelect(tagType.name, tag.name)}
                type="button"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </Form.Group>
      ))}
    </>
  );

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    if (categoryContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll handlers
  const handleScrollLeft = () => {
    if (categoryContainerRef.current) {
      categoryContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (categoryContainerRef.current) {
      categoryContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = categoryContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
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
      <Navbar bg="primary" variant="dark" expand="lg" className="py-3">
        <Container>
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img 
              src={logo} 
              alt="Toy Kingdom Logo" 
              style={{ 
                height: '40px', 
                marginRight: '10px'
              }} 
            />
            Toy Kingdom
          </Link>

          {!isAuthPage && (
          <Form onSubmit={submitHandler} className="search-form d-flex mx-lg-4">
              <div className="position-relative w-100">
            <Form.Control
              type="text"
                  placeholder="Search for product"
                  className="search-input pe-5"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
                <Button 
                  type="submit" 
                  className="search-button position-absolute end-0 top-50 translate-middle-y"
                  style={{
                    borderRadius: '0 25px 25px 0',
                    height: '100%',
                    padding: '0 1.5rem',
                    marginRight: '0'
                  }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Button>
              </div>
          </Form>
          )}

          <div className="d-flex align-items-center">
            {userInfo && !isAuthPage && (
              <Link to="/wishlist" className="icon-button position-relative me-3">
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
        </Container>
      </Navbar>

      {/* Category Navigation - Only show if not on auth pages */}
      {!isAuthPage && (
        <nav className="category-nav border-bottom" style={{ backgroundColor: '#e8f4ff' }}>
          <style>
            {`
              .category-button {
                transition: all 0.2s ease !important;
              }
              .category-button:hover {
                background-color: #0275d8 !important;
                color: white !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
              }
            `}
          </style>
          <Container className="position-relative">
            <Button 
              variant="light" 
              className="category-scroll-button left"
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
            
            <div 
              ref={categoryContainerRef}
              className="d-flex category-container"
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

      {/* Filter Modal */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Filter Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mb-4">
              <h6 className="mb-2">Active Filters:</h6>
              <div className="d-flex flex-wrap gap-2">
                {getActiveFilterSummary().map((filter, index) => (
                  <Badge
                    key={index}
                    bg="info"
                    className="py-2 px-3"
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
              <small className="text-muted d-block mt-2">
                * Items must match ALL selected filters to be shown
              </small>
            </div>
          )}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                value={currentCategory} 
                onChange={(e) => {
                  const newCategory = e.target.value;
                  handleCategoryChange(newCategory);
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Tag Type Filters */}
            {renderTagTypeFilters()}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowFilter(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button variant="primary" onClick={submitHandler}>
                Apply Filters
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Header;