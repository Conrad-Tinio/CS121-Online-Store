import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Container, Form, Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";
import axios from 'axios';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin;

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axios.get('/api/categories/')
      setCategories(data)
    }
    fetchCategories()
  }, [])

  const logoutHandler = () => {
    dispatch(logout())
  }

  const submitHandler = (e) => {
    e.preventDefault()
    let searchParams = new URLSearchParams()
    
    if (keyword.trim()) {
      searchParams.append('keyword', keyword)
    }
    if (category) {
      searchParams.append('category', category)
    }
    if (minPrice) {
      searchParams.append('min_price', minPrice)
    }
    if (maxPrice) {
      searchParams.append('max_price', maxPrice)
    }

    const searchQuery = searchParams.toString()
    navigate(searchQuery ? `/?${searchQuery}` : '/')
    setShowFilter(false)
  }

  return (
    <>
      <Navbar className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            Toy Kingdom
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarColor02"
            aria-controls="navbarColor02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor02">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink to="/" className="nav-link">
                  Home 
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/cart" className="nav-link">
                  Cart
                </NavLink>
              </li>

              {userInfo ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
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
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    New User?
                  </a>

                  <div className="dropdown-menu">
                    <NavLink to="/login" className="dropdown-item">
                      Login
                    </NavLink>
                    <NavLink to="/register" className="dropdown-item">
                      Signup
                    </NavLink>
                  </div>
                </li>
              )}
            </ul>

            <Form onSubmit={submitHandler} className="d-flex gap-2">
              <Form.Select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-auto"
                style={{ minWidth: '150px' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="me-2"
              />
              <Button 
                variant="light" 
                type="button"
                onClick={() => setShowFilter(true)}
                className="d-flex align-items-center"
              >
                <i className="fas fa-filter"></i>
              </Button>
              <Button 
                variant="light" 
                type="submit"
                className="d-flex align-items-center gap-2"
              >
                <i className="fas fa-search"></i>
                Search
              </Button>
            </Form>
          </div>
        </div>
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