import React from 'react';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold">Test Your Knowledge with AI-Powered Quizzes</h1>
              <p className="lead my-4">
                Enhance your learning experience with our intelligent quiz platform. 
                Generate custom quizzes on any topic using AI technology.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/register" variant="light" size="lg">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Login
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <Image 
                src="https://via.placeholder.com/600x400?text=Quiz+App" 
                alt="Quiz App" 
                fluid 
                className="rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Key Features</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div className="feature-icon bg-primary text-white rounded-circle p-3 mb-3">
                  <i className="fas fa-robot fa-2x"></i>
                </div>
                <Card.Title>AI-Generated Quizzes</Card.Title>
                <Card.Text>
                  Create custom quizzes on any topic using our advanced AI technology. 
                  Just provide the subject and topic, and let our AI do the rest.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div className="feature-icon bg-success text-white rounded-circle p-3 mb-3">
                  <i className="fas fa-coins fa-2x"></i>
                </div>
                <Card.Title>Token System</Card.Title>
                <Card.Text>
                  Purchase tokens to generate quizzes. Our flexible token packages 
                  allow you to choose what works best for your needs.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div className="feature-icon bg-info text-white rounded-circle p-3 mb-3">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
                <Card.Title>Progress Tracking</Card.Title>
                <Card.Text>
                  Track your quiz performance over time. Review your answers, 
                  see explanations, and monitor your improvement.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5 mb-5">
        <Container>
          <h2 className="text-center mb-4">How It Works</h2>
          <Row className="justify-content-center">
            <Col md={10}>
              <div className="d-flex flex-column flex-md-row justify-content-between">
                <div className="text-center mb-4 mb-md-0">
                  <div className="step-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    1
                  </div>
                  <h5>Create Account</h5>
                  <p className="text-muted">Sign up and get started in seconds</p>
                </div>
                <div className="text-center mb-4 mb-md-0">
                  <div className="step-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    2
                  </div>
                  <h5>Purchase Tokens</h5>
                  <p className="text-muted">Choose a token package that suits you</p>
                </div>
                <div className="text-center mb-4 mb-md-0">
                  <div className="step-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    3
                  </div>
                  <h5>Generate Quizzes</h5>
                  <p className="text-muted">Create AI-powered quizzes on any topic</p>
                </div>
                <div className="text-center">
                  <div className="step-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    4
                  </div>
                  <h5>Learn & Improve</h5>
                  <p className="text-muted">Take quizzes and track your progress</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="mb-5 text-center">
        <h2>Ready to Test Your Knowledge?</h2>
        <p className="lead mb-4">
          Join thousands of users who are already enhancing their learning with our AI-powered quizzes.
        </p>
        <Button as={Link} to="/register" variant="primary" size="lg">
          Get Started Now
        </Button>
      </Container>
    </div>
  );
};

export default Home; 