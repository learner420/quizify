import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { subject } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching quizzes for subject:', subject, 'from API URL:', API_URL);
        
        const quizzesData = await apiCall(`/api/quizzes/${subject}`);
        setQuizzes(quizzesData.quizzes || []);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [subject]);
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{subject} Quizzes</h1>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <p>Loading quizzes...</p>
      ) : quizzes.length > 0 ? (
        <Row>
          {quizzes.map((quiz, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card className="h-100 quiz-card">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{quiz}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Take this quiz to test your knowledge on {quiz} in the subject of {subject}.
                  </Card.Text>
                  <Button 
                    as={Link} 
                    to={`/quizzes/${subject}/${quiz}`} 
                    variant="primary"
                  >
                    Start Quiz
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="mb-4">No quizzes available for this subject yet.</p>
          <Button 
            as={Link} 
            to="/dashboard" 
            variant="primary"
          >
            Back to Dashboard
          </Button>
        </div>
      )}
    </Container>
  );
};

export default QuizList; 
