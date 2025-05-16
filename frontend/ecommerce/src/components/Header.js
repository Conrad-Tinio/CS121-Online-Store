import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Initialize state from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // New state for tags
  const [activeTags, setActiveTags] = useState({
    stock: searchParams.get('stock') || '',
    price_range: searchParams.get('price_range') || '',
  });

  // Tag definitions with exact price ranges
  const tagOptions = {
    stock: [
      { value: 'inStock', text: 'In Stock', variant: 'success', icon: '✓' },
      { value: 'lowStock', text: 'Low Stock', variant: 'warning', icon: '!' },
      { value: 'outOfStock', text: 'Out of Stock', variant: 'danger', icon: '×' },
    ],
    price_range: [
      { value: 'budget', text: 'Budget (< ₱1,000)', variant: 'info', icon: '₱' },
      { value: 'midRange', text: 'Mid-Range (₱1,000 - ₱4,999)', variant: 'primary', icon: '₱₱' },
      { value: 'premium', text: 'Premium (₱5,000+)', variant: 'dark', icon: '₱₱₱' },
    ],
  };

  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setCategory(params.get('category') || '');
    setActiveTags({
      stock: params.get('stock') || '',
      price_range: params.get('price_range') || '',
    });
  }, [location.search]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axios.get('/api/categories/')
      setCategories(data)
    }
    fetchCategories()
  }, [])

  const logoutHandler = () => {
    dispatch(logout())
    setExpanded(false);
  }

  // Handle category change
  const handleCategoryChange = (newCategory = '') => {
    console.log('Category changed to:', newCategory);
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams(location.search);
    
    // Clear existing category
    params.delete('category');
    
    // Add new category if one is selected
    if (newCategory) {
      params.set('category', newCategory);
    }
    
    // Keep other existing filters
    const searchQuery = params.toString();
    
    // Navigate to the new URL
    navigate({
      pathname: '/',
      search: searchQuery ? `?${searchQuery}` : ''
    });
    
    // Close the filter popup and navbar
    setShowFilter(false);
    setExpanded(false);
  };

  // Handle tag click with debug logging
  const handleTagClick = (type, value) => {
    console.log('Tag clicked:', type, value);
    console.log('Current active tags:', activeTags);
    
    // Toggle the clicked tag while preserving other tag types
    const newActiveTags = {
      ...activeTags,
      [type]: activeTags[type] === value ? '' : value
    };
    console.log('New active tags:', newActiveTags);
    setActiveTags(newActiveTags);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('\nSubmitting filters...');
    console.log('Current state:', {
      category,
      keyword,
      activeTags
    });
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Add all parameters if they exist
    if (keyword.trim()) {
      console.log('Adding keyword:', keyword);
      params.set('keyword', keyword);
    }
    
    if (category) {
      console.log('Adding category:', category);
      params.set('category', category);
    }
    
    // Handle price range tag first
    if (activeTags.price_range) {
      console.log('Adding price range tag:', activeTags.price_range);
      params.set('price_range', activeTags.price_range);
    }
    
    // Handle stock tag
    if (activeTags.stock) {
      console.log('Adding stock tag:', activeTags.stock);
      params.set('stock', activeTags.stock);
    }

    const searchQuery = params.toString();
    console.log('Final URL params:', searchQuery);
    
    // Log the expected filters that should be applied
    console.log('\nExpected filtering:');
    if (category) console.log(`- Category should be: ${category}`);
    if (activeTags.stock) console.log(`- Stock should be: ${activeTags.stock}`);
    if (activeTags.price_range) {
      const priceTag = tagOptions.price_range.find(t => t.value === activeTags.price_range);
      console.log(`- Price should be: ${priceTag.text}`);
    }
    
    // Navigate without hash
    navigate({
      pathname: '/',
      search: `?${searchQuery}`
    }, { replace: true });
    
    setShowFilter(false);
    setExpanded(false);
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setActiveTags({
      stock: '',
      price_range: '',
    });
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
      category ||
      activeTags.stock ||
      activeTags.price_range
    );
  };

  // Helper function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (keyword) count++;
    if (category) count++;
    if (activeTags.stock) count++;
    if (activeTags.price_range) count++;
    return count;
  };

  // Helper function to get active filter summary
  const getActiveFilterSummary = () => {
    const filters = [];
    if (keyword) filters.push(`Search: "${keyword}"`);
    if (category) filters.push(`Category: ${category}`);
    
    if (activeTags.stock) {
      const stockTag = tagOptions.stock.find(t => t.value === activeTags.stock);
      filters.push(`Stock: ${stockTag.text}`);
    }
    if (activeTags.price_range) {
      const priceTag = tagOptions.price_range.find(t => t.value === activeTags.price_range);
      filters.push(`Price Range: ${priceTag.text}`);
    }
    return filters;
  };

  // Update the category dropdown menu
  const renderCategoryMenu = () => (
    <div className="dropdown-menu">
      <button
        type="button"
        className={`dropdown-item ${!category ? 'active' : ''}`}
        onClick={() => handleCategoryChange()}
      >
        All Products
      </button>
      {categories.map(cat => (
        <button
          key={cat._id}
          type="button"
          className={`dropdown-item ${category === cat.name ? 'active' : ''}`}
          onClick={() => handleCategoryChange(cat.name)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  // Update the filter modal tag rendering
  const renderFilterTags = (type, options) => (
    <div className="d-flex flex-wrap gap-2">
      {options.map(tag => (
        <button
          key={tag.value}
          type="button"
          className={`badge bg-${activeTags[type] === tag.value ? tag.variant : 'secondary'}`}
          style={{
            cursor: 'pointer',
            opacity: activeTags[type] === tag.value ? 1 : 0.7,
            padding: '8px 12px',
            fontSize: '0.9rem',
            border: 'none',
          }}
          onClick={() => {
            console.log(`Clicking ${type} tag:`, tag.value);
            handleTagClick(type, tag.value);
          }}
        >
          <span className="me-1">{tag.icon}</span>
          {tag.text}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Navbar 
        bg="dark" 
        variant="dark" 
        expand="lg" 
        className="py-2"
        expanded={expanded}
        onToggle={(expanded) => setExpanded(expanded)}
      >
        <Container fluid className="px-3 px-md-4">
          <button
            className="navbar-brand"
            onClick={() => {
              clearFilters();
              handleNavigation();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer'
            }}
          >
            <span className="fw-bold" style={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              Toy Kingdom
            </span>
          </button>
          
          <Navbar.Toggle aria-controls="navbarColor02" />
          
          <Navbar.Collapse id="navbarColor02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button
                  className="nav-link px-3"
                  onClick={() => {
                    clearFilters();
                    handleNavigation();
                  }}
                >
                  Home 
                </button>
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle px-3"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Categories
                </button>

                {renderCategoryMenu()}
              </li>

              <li className="nav-item">
                <button
                  className="nav-link px-3"
                  onClick={() => {
                    navigate('/cart');
                    handleNavigation();
                  }}
                >
                  Cart
                </button>
              </li>

              {userInfo && (
                <li className="nav-item">
                  <button
                    className="nav-link px-3"
                    onClick={() => {
                      navigate('/wishlist');
                      handleNavigation();
                    }}
                  >
                    Wishlist
                  </button>
                </li>
              )}

              {userInfo ? (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle px-3"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {userInfo ? `Welcome, ${userInfo.name}!` : 'Welcome!'}
                  </button>

                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/account');
                        handleNavigation();
                      }}
                    >
                      My Account
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/orders');
                        handleNavigation();
                      }}
                    >
                      My Orders
                    </button>
                    {userInfo.isAdmin && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/admin/dashboard');
                          handleNavigation();
                        }}
                      >
                        Dashboard
                      </button>
                    )}
                    <button className="dropdown-item" onClick={logoutHandler}>
                      Logout
                    </button>
                  </div>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle px-3"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    New User?
                  </button>

                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/login');
                        handleNavigation();
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/register');
                        handleNavigation();
                      }}
                    >
                      Signup
                    </button>
                  </div>
                </li>
              )}
            </ul>

            <Form onSubmit={submitHandler} className="d-flex flex-grow-1 mx-lg-4">
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    className="me-2"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Button type="submit" variant="light" className="px-3">
                    <i className="fas fa-search"></i>
                  </Button>
                  <Button
                    variant="light"
                    className="ms-2 position-relative"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <i className="fas fa-filter"></i>
                    {hasActiveFilters() && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ marginTop: '-5px', marginLeft: '-8px' }}
                      >
                        {getActiveFilterCount()}
                        <span className="visually-hidden">active filters</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

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

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                value={category} 
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

            {/* Stock Status Filter */}
            <Form.Group className="mb-3">
              <Form.Label>Stock Status</Form.Label>
              {renderFilterTags('stock', tagOptions.stock)}
            </Form.Group>

            {/* Price Range Tags */}
            <Form.Group className="mb-3">
              <Form.Label>Price Category</Form.Label>
              {renderFilterTags('price_range', tagOptions.price_range)}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilter(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={clearFilters}>
            Clear All Filters
          </Button>
          <Button variant="primary" onClick={submitHandler}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header;