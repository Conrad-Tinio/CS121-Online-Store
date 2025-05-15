import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal, Row, Col } from "react-bootstrap";
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
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [expanded, setExpanded] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    setCategory(params.get('category') || '');
    setMinPrice(params.get('min_price') || '');
    setMaxPrice(params.get('max_price') || '');
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

  const submitHandler = (e) => {
    e.preventDefault()
    // Start with current parameters and override/add new ones
    let searchParams = new URLSearchParams(location.search)
    
    // Update or remove parameters
    if (keyword.trim()) {
      searchParams.set('keyword', keyword)
    } else {
      searchParams.delete('keyword')
    }
    
    // Maintain category from URL if present
    const currentCategory = searchParams.get('category')
    if (!currentCategory && category) {
      searchParams.set('category', category)
    }
    
    if (minPrice) {
      searchParams.set('min_price', minPrice)
    } else {
      searchParams.delete('min_price')
    }
    
    if (maxPrice) {
      searchParams.set('max_price', maxPrice)
    } else {
      searchParams.delete('max_price')
    }

    const searchQuery = searchParams.toString()
    navigate(searchQuery ? `/?${searchQuery}` : '/')
    setShowFilter(false)
    setExpanded(false);
  }

  // Close navbar when navigating
  const handleNavigation = () => {
    setExpanded(false);
  };

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
          <NavLink to="/" className="navbar-brand" onClick={handleNavigation}>
            <span className="fw-bold">Toy Kingdom</span>
          </NavLink>
          
          <Navbar.Toggle aria-controls="navbarColor02" />
          
          <Navbar.Collapse id="navbarColor02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className="nav-link px-3" onClick={handleNavigation}>
                  Home 
                </NavLink>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle px-3"
                  data-bs-toggle="dropdown"
                  href="#"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Categories
                </a>

                <div className="dropdown-menu">
                  <NavLink 
                    to="/" 
                    className={`dropdown-item ${!category ? 'active' : ''}`}
                    onClick={() => {
                      const params = new URLSearchParams(location.search);
                      params.delete('category');
                      navigate(`/?${params.toString()}`);
                      handleNavigation();
                    }}
                  >
                    All Products
                  </NavLink>
                  {categories.map(cat => (
                    <NavLink 
                      key={cat._id} 
                      to={`/?category=${cat.name}`}
                      className={`dropdown-item ${category === cat.name ? 'active' : ''}`}
                      onClick={handleNavigation}
                    >
                      {cat.name}
                    </NavLink>
                  ))}
                </div>
              </li>

              <li className="nav-item">
                <NavLink to="/cart" className="nav-link px-3" onClick={handleNavigation}>
                  Cart
                </NavLink>
              </li>

              {userInfo ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle px-3"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Welcome {userInfo.name}!
                  </a>

                  <div className="dropdown-menu">
                    <NavLink className="dropdown-item" onClick={logoutHandler}>
                      Logout
                    </NavLink>
                  </div>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle px-3"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    New User?
                  </a>

                  <div className="dropdown-menu">
                    <NavLink to="/login" className="dropdown-item" onClick={handleNavigation}>
                      Login
                    </NavLink>
                    <NavLink to="/register" className="dropdown-item" onClick={handleNavigation}>
                      Signup
                    </NavLink>
                  </div>
                </li>
              )}
            </ul>

            <Form onSubmit={submitHandler} className="d-flex flex-wrap gap-2 mt-3 mt-lg-0">
              <div className="d-flex flex-grow-1">
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="me-2 flex-grow-1"
                  size="sm"
                />
                <Button 
                  variant="light" 
                  type="button"
                  onClick={() => setShowFilter(true)}
                  className="d-flex align-items-center"
                  size="sm"
                >
                  <i className="fas fa-filter"></i>
                </Button>
              </div>
              <Button 
                variant="light" 
                type="submit"
                className="d-flex align-items-center gap-2"
                size="sm"
              >
                <i className="fas fa-search"></i>
                <span className="d-none d-sm-inline">Search</span>
              </Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Price Filter Modal */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter by Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Minimum Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Maximum Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilter(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={submitHandler}>
            Apply Filters
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setMinPrice('');
              setMaxPrice('');
              setShowFilter(false);
              submitHandler({ preventDefault: () => {} });
            }}
          >
            Clear Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header;