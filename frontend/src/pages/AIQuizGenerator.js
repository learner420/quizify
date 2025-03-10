import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';
import { AuthContext } from '../context/AuthContext';

const AIQuizGenerator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    numQuestions: 5,
    difficulty: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numQuestions' ? parseInt(value) : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.subject || !formData.topic) {
      return setError('Please fill in all required fields');
    }
    
    // Calculate required tokens
    const requiredTokens = Math.max(1, Math.ceil(formData.numQuestions / 5));
    
    // Check if user has enough tokens
    if (currentUser.tokens < requiredTokens) {
      return setError(`Not enough tokens. You need ${requiredTokens} tokens to generate this quiz.`);
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Generating AI quiz using API URL:', API_URL);
      
      const response = await apiCall('/api/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          num_questions: formData.numQuestions,
          difficulty: formData.difficulty
        })
      });
      
      // Update user tokens if provided in the response
      if (response.user && updateUser) {
        updateUser(response.user);
      }
      
      setSuccess('Quiz generated successfully!');
      
      // Navigate to the new quiz
      setTimeout(() => {
        navigate(`/quiz/${response.quiz.subject}/${response.quiz.name}`);
      }, 1500);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Generate AI Quiz</h1>
      
      <Card className="ai-form mb-4">
        <Card.Body>
          <Card.Title className="mb-4">Create a Custom Quiz with AI</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="subject">
              <Form.Label>Subject Area</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics, Science, History"
                required
              />
              <Form.Text className="text-muted">
                Enter a broad subject area for your quiz
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="topic">
              <Form.Label>Specific Topic</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g. Algebra, Solar System, World War II"
                required
              />
              <Form.Text className="text-muted">
                Enter a specific topic within the subject area
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="numQuestions">
              <Form.Label>Number of Questions</Form.Label>
              <Form.Select
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
              >
                <option value="5">5 Questions (1 Token)</option>
                <option value="10">10 Questions (2 Tokens)</option>
                <option value="15">15 Questions (3 Tokens)</option>
                <option value="20">20 Questions (4 Tokens)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Select how many questions you want in your quiz
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="difficulty">
              <Form.Label>Difficulty Level</Form.Label>
              <Form.Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="me-2">Available Tokens:</span>
                <span className="token-badge">{currentUser?.tokens || 0}</span>
              </div>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="px-4"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Generating...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          <Card.Title>How It Works</Card.Title>
          <ol className="mb-0">
            <li className="mb-2">Enter a subject area and specific topic for your quiz</li>
            <li className="mb-2">Select the number of questions and difficulty level</li>
            <li className="mb-2">Click "Generate Quiz" to create your custom quiz using AI</li>
            <li className="mb-2">Tokens will be deducted from your account (1 token per 5 questions)</li>
            <li>Take the quiz and see your results!</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AIQuizGenerator; 
