import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle logo click based on authentication status
  const handleLogoClick = (e) => {
    if (isAuthenticated) {
      e.preventDefault();
      navigate('/dashboard');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? "/dashboard" : "/"} onClick={handleLogoClick}>
          <i className="fas fa-brain me-2"></i>
          Quiz App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuthenticated && <Nav.Link as={Link} to="/">Home</Nav.Link>}
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                {currentUser?.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light me-2">Tokens:</span>
                  <Badge pill bg="primary" className="token-badge">
                    {currentUser?.tokens || 0}
                  </Badge>
                </Nav.Item>
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  className="me-2"
                  onClick={() => navigate('/purchase-tokens')}
                >
                  Buy Tokens
                </Button>
                <Nav.Link as={Link} to="/profile">
                  <i className="fas fa-user me-1"></i>
                  {currentUser?.username || 'Profile'}
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 