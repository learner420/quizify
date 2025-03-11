import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch subjects
        const subjectsResponse = await axios.get('/api/quizzes');
        setSubjects(subjectsResponse.data.subjects);
        
        // Fetch user's quiz attempts
        const attemptsResponse = await axios.get('/api/quizzes/attempts');
        setAttempts(attemptsResponse.data.attempts);
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate stats
  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0 
    ? (attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts).toFixed(1) 
    : 0;
  
  // Get recent attempts (last 5)
  const recentAttempts = attempts.slice(0, 5);

  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* User Stats */}
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="h-100 bg-primary text-white">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{currentUser?.tokens || 0}</h1>
              <p className="mb-0">Available Tokens</p>
              <Button 
                as={Link} 
                to="/purchase-tokens" 
                variant="light" 
                className="mt-3"
              >
                Buy More Tokens
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="h-100 bg-success text-white">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{totalAttempts}</h1>
              <p className="mb-0">Quizzes Taken</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 bg-info text-white">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h1 className="display-4 fw-bold">{averageScore}%</h1>
              <p className="mb-0">Average Score</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/purchase-tokens" variant="success">
                  <i className="fas fa-coins me-2"></i>
                  Buy Tokens
                </Button>
                <Button as={Link} to="/profile" variant="info">
                  <i className="fas fa-user me-2"></i>
                  View Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Available Subjects */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Available Subjects</h2>
          {loading ? (
            <p>Loading subjects...</p>
          ) : subjects.length > 0 ? (
            <Row>
              {subjects.map((subject, index) => (
                <Col key={index} md={4} className="mb-3">
                  <Card className="h-100 quiz-card">
                    <Card.Body>
                      <Card.Title>{subject}</Card.Title>
                      <Card.Text>
                        Explore quizzes related to {subject}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={`/quizzes/${subject}`} 
                        variant="primary"
                      >
                        View Quizzes
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p>No subjects available. Try generating a quiz!</p>
          )}
        </Col>
      </Row>
      
      {/* Recent Attempts */}
      <Row>
        <Col>
          <h2 className="mb-3">Recent Quiz Attempts</h2>
          {loading ? (
            <p>Loading attempts...</p>
          ) : recentAttempts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((attempt, index) => (
                    <tr key={index}>
                      <td>{attempt.subject}</td>
                      <td>{attempt.quiz_name}</td>
                      <td>
                        <Badge bg={attempt.percentage >= 70 ? 'success' : attempt.percentage >= 40 ? 'warning' : 'danger'}>
                          {attempt.score}/{attempt.total_questions} ({attempt.percentage.toFixed(1)}%)
                        </Badge>
                      </td>
                      <td>{new Date(attempt.attempt_date).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          as={Link} 
                          to={`/results/${attempt.subject}/${attempt.quiz_name}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          View Results
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No quiz attempts yet. Start taking quizzes to see your results here!</p>
          )}
          
          {totalAttempts > 5 && (
            <div className="text-center mt-3">
              <Button as={Link} to="/profile" variant="outline-primary">
                View All Attempts
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 
