import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API_URL, { apiCall } from './api-config';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Log the API URL for debugging
    console.log('Dashboard - Using API URL:', API_URL);

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        // Fetch user data using the apiCall helper
        const userData = await apiCall('/api/user/profile');
        console.log('User profile data:', userData);
        setUserData(userData);
        
        // Fetch quizzes using the apiCall helper
        const quizzesData = await apiCall('/api/quizzes');
        console.log('Quizzes data:', quizzesData);
        
        // Make sure quizzes is always an array
        setQuizzes(quizzesData.quizzes || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        
        // Set a user-friendly error message
        setError("Failed to load dashboard data. Please check your connection and make sure the backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading dashboard data from {API_URL}...
          </div>
        </Alert>
      </Container>
    );
  }

  // Show error state with more details
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <hr />
          <p>
            <strong>API URL:</strong> {API_URL}<br />
            <strong>Troubleshooting:</strong>
          </p>
          <ul>
            <li>Check if the backend server is running</li>
            <li>Verify your API URL is correct</li>
            <li>Check for CORS issues in the browser console</li>
            <li>Try clearing your browser cache and cookies</li>
          </ul>
          <Button 
            variant="outline-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // Safely access user data
  const username = userData?.username || 'User';
  const tokens = userData?.tokens || 0;
  const quizAttempts = userData?.quiz_attempts || [];
  
  // Safely get recent attempts
  const recentAttempts = quizAttempts && quizAttempts.length > 0 
    ? quizAttempts.slice(0, 5) 
    : [];

  return (
    <Container className="mt-5">
      <h1>Welcome, {username}!</h1>
      <p className="text-muted">Connected to: {API_URL}</p>
      
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Your Profile</Card.Title>
              <Card.Text>
                <strong>Username:</strong> {username}<br />
                <strong>Tokens:</strong> {tokens}<br />
                <strong>Quiz Attempts:</strong> {quizAttempts?.length || 0}
              </Card.Text>
              <Link to="/profile">
                <Button variant="primary">View Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Available Quizzes</Card.Title>
              {quizzes && quizzes.length > 0 ? (
                <ul className="list-group">
                  {quizzes.map((quiz, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {quiz.name || 'Unnamed Quiz'}
                      <Link to={`/quiz/${quiz.subject}/${quiz.name}`}>
                        <Button variant="outline-primary" size="sm">Take Quiz</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Alert variant="info">No quizzes available at the moment.</Alert>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Recent Quiz Attempts</Card.Title>
              {recentAttempts && recentAttempts.length > 0 ? (
                <ul className="list-group">
                  {recentAttempts.map((attempt, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {attempt.quiz_name || 'Unnamed Quiz'}
                      <span>
                        Score: {attempt.score}/{attempt.total_questions} 
                        ({Math.round((attempt.score / attempt.total_questions) * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Alert variant="info">You haven't attempted any quizzes yet.</Alert>
              )}
              {quizAttempts && quizAttempts.length > 5 && (
                <div className="mt-3 text-center">
                  <Link to="/attempts">
                    <Button variant="outline-secondary">View All Attempts</Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
