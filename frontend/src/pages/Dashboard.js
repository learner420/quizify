import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Add this line to get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userResponse = await axios.get(`${API_URL}/api/user/profile`, {
          withCredentials: true
        });
        setUserData(userResponse.data);
        
        // Fetch quizzes
        const quizzesResponse = await axios.get(`${API_URL}/api/quizzes`, {
          withCredentials: true
        });
        
        // Make sure quizzes is always an array, even if the API returns null or undefined
        setQuizzes(quizzesResponse.data.quizzes || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Loading dashboard data...</Alert>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Safely access user data
  const username = userData?.username || 'User';
  const tokens = userData?.tokens || 0;
  const quizAttempts = userData?.quiz_attempts || [];
  
  // This is likely where the error is occurring - make sure we're safely accessing arrays
  // and checking for undefined before accessing length or mapping
  const recentAttempts = quizAttempts && quizAttempts.length > 0 
    ? quizAttempts.slice(0, 5) 
    : [];

  return (
    <Container className="mt-5">
      <h1>Welcome, {username}!</h1>
      
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
              {quizzes.length > 0 ? (
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
              {recentAttempts.length > 0 ? (
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
              {quizAttempts?.length > 5 && (
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
