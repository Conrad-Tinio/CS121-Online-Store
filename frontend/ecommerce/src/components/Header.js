import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";
import axios from 'axios';
import { Link } from "react-router-dom";

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
  
  // New state for arrival status
  const [arrivalStatus, setArrivalStatus] = useState(searchParams.get('arrival') || '');

  // Arrival status options
  const arrivalOptions = [
    { value: 'new', text: 'New Arrivals', variant: 'success', icon: '🆕' },
    { value: 'recent', text: 'Recent', variant: 'info', icon: '📅' },
    { value: 'classic', text: 'Classic', variant: 'dark', icon: '⭐' },
  ];

  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setCategory(params.get('category') || '');
    setArrivalStatus(params.get('arrival') || '');
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
    setCategory(newCategory);
    
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

  // Handle arrival status click - only update local state, don't navigate
  const handleArrivalClick = (value) => {
    console.log('Arrival status clicked:', value);
    // Toggle the arrival status
    const newStatus = value === arrivalStatus ? '' : value;
    console.log('Setting new arrival status:', newStatus);
    setArrivalStatus(newStatus);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('\nSubmitting filters from Header:');
    console.log('Current state:', {
      keyword,
      category,
      arrivalStatus
    });
    
    // Create a new URLSearchParams object
    const params = new URLSearchParams();
    
    // Update parameters
    if (keyword.trim()) {
      params.set('keyword', keyword);
    }
    
    if (category) {
      params.set('category', category);
    }
    
    if (arrivalStatus) {
      params.set('arrival', arrivalStatus);
      console.log('Setting arrival status:', arrivalStatus);
    }

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
    setCategory('');
    setArrivalStatus('');
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
      arrivalStatus
    );
  };

  // Helper function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (keyword) count++;
    if (category) count++;
    if (arrivalStatus) count++;
    return count;
  };

  // Helper function to get active filter summary
  const getActiveFilterSummary = () => {
    const filters = [];
    if (keyword) filters.push(`Search: "${keyword}"`);
    if (category) filters.push(`Category: ${category}`);
    
    if (arrivalStatus) {
      const arrivalOption = arrivalOptions.find(opt => opt.value === arrivalStatus);
      filters.push(`Arrival: ${arrivalOption.text}`);
    }
    return filters;
  };

  // Render arrival status options
  const renderArrivalOptions = () => (
    <div className="d-flex flex-wrap gap-2">
      {arrivalOptions.map(option => (
        <button
          key={option.value}
          type="button"
          className={`badge bg-${arrivalStatus === option.value ? option.variant : 'secondary'}`}
          style={{
            cursor: 'pointer',
            opacity: arrivalStatus === option.value ? 1 : 0.7,
            padding: '8px 12px',
            fontSize: '0.9rem',
            border: 'none',
          }}
          onClick={() => handleArrivalClick(option.value)}
        >
          <span className="me-1">{option.icon}</span>
          {option.text}
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

          <Form onSubmit={submitHandler}>
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

            {/* Arrival Status Filter */}
            <Form.Group className="mb-3">
              <Form.Label>Arrival Status</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {arrivalOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={arrivalStatus === option.value ? option.variant : 'outline-secondary'}
                    className="d-flex align-items-center"
                    onClick={() => handleArrivalClick(option.value)}
                    type="button"
                  >
                    <span className="me-1">{option.icon}</span>
                    {option.text}
                  </Button>
                ))}
              </div>
            </Form.Group>

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