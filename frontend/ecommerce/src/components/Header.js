import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Navbar, Container } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux'
import { logout } from "../actions/userActions";

function Header() {

  const userLogin = useSelector(state => state.userLogin);
  const {userInfo} = userLogin; 
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logout())
  }


  return (
    <>
      <Navbar className="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            Ecommerce Cart
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
            <form className="d-flex">
              <input
                className="form-control me-sm-2"
                type="search"
                placeholder="Search"
              />
              <button className="btn btn-secondary my-2 my-sm-0" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </Navbar>
    </>
  );
}

export default Header;