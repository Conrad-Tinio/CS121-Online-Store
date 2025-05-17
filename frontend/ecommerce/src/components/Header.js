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
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';

  // Initialize state from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // State for tag types
  const [tagTypes, setTagTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});

  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setCategory(params.get('category') || '');
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
        newSelectedTags[type.name] = value;
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

  // Handle tag selection
  const handleTagSelect = (tagType, tagName) => {
    setSelectedTags(prev => {
      const newTags = { ...prev };
      if (newTags[tagType] === tagName) {
        delete newTags[tagType];
      } else {
        newTags[tagType] = tagName;
      }
      return newTags;
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('\nSubmitting filters from Header:');
    console.log('Current state:', {
      keyword,
      category,
      selectedTags
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

    // Add tag filters
    Object.entries(selectedTags).forEach(([type, value]) => {
      params.set(type.toLowerCase(), value);
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
    setCategory('');
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
      category ||
      Object.keys(selectedTags).length > 0
    );
  };

  // Helper function to count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (keyword) count++;
    if (category) count++;
    count += Object.keys(selectedTags).length;
    return count;
  };

  // Helper function to get active filter summary
  const getActiveFilterSummary = () => {
    const filters = [];
    if (keyword) filters.push(`Search: "${keyword}"`);
    if (category) filters.push(`Category: ${category}`);
    
    // Add tag filters to summary
    Object.entries(selectedTags).forEach(([type, value]) => {
      filters.push(`${type}: ${value}`);
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
                variant={selectedTags[tagType.name] === tag.name ? tagType.color : 'outline-secondary'}
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
                    disabled={isLoginPage}
                  />
                  <Button type="submit" variant="light" className="px-3" disabled={isLoginPage}>
                    <i className="fas fa-search"></i>
                  </Button>
                  <Button
                    variant="light"
                    className="ms-2 position-relative"
                    onClick={() => setShowFilter(!showFilter)}
                    disabled={isLoginPage}
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