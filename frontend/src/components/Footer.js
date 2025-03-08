import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5>Quizify</h5>
            <p className="text-light opacity-75">
              Feel free to contact us for any queries.
            </p>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-light opacity-75">Home</Link></li>
              <li><Link to="/dashboard" className="text-decoration-none text-light opacity-75">Dashboard</Link></li>
              <li><Link to="/purchase-tokens" className="text-decoration-none text-light opacity-75">Buy Tokens</Link></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contact</h5>
            <ul className="list-unstyled text-light opacity-75">
              <li><i className="fas fa-envelope me-2"></i> dk12548@gmail.com </li>
              <li><i className="fas fa-phone me-2"></i> 8732062596 </li>
              <li><i className="fas fa-map-marker-alt me-2"></i> AG Office, Mizoram</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3 bg-light opacity-25" />
        <Row>
          <Col className="text-center text-light opacity-75">
            <small>&copy; {new Date().getFullYear()} Quiz App. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 