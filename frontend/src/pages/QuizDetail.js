import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';

const QuizDetail = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [isNewAttempt, setIsNewAttempt] = useState(false);
  
  const { subject, quizName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract attempt_id and new_attempt from query parameters if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const attemptIdParam = searchParams.get('attempt_id');
    const newAttemptParam = searchParams.get('new_attempt');
    
    if (attemptIdParam) {
      setAttemptId(attemptIdParam);
    }
    
    if (newAttemptParam === 'true') {
      setIsNewAttempt(true);
      // Clear any existing attempt ID to force a new attempt
      setAttemptId(null);
      // Clear any saved answers for this quiz
      localStorage.removeItem(`quiz_${subject}_${quizName}_answers`);
      localStorage.removeItem(`quiz_${subject}_${quizName}_current`);
      
      // We'll keep the new_attempt parameter in the URL for the backend
    }
  }, [location.search, subject, quizName]);
  
  // Save answers to localStorage to persist across page refreshes
  useEffect(() => {
    if (quiz && selectedAnswers.length > 0 && attemptId) {
      localStorage.setItem(`quiz_${subject}_${quizName}_${attemptId}_answers`, JSON.stringify(selectedAnswers));
      localStorage.setItem(`quiz_${subject}_${quizName}_${attemptId}_current`, currentQuestion.toString());
    }
  }, [selectedAnswers, currentQuestion, quiz, subject, quizName, attemptId]);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build the URL with appropriate parameters
        let endpoint = `/api/quizzes/${subject}/${quizName}`;
        const params = new URLSearchParams();
        
        if (attemptId && !isNewAttempt) {
          params.append('attempt_id', attemptId);
        }
        
        if (isNewAttempt) {
          params.append('new_attempt', 'true');
        }
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
        
        console.log("Fetching quiz with URL:", API_URL + endpoint);
        const quizData = await apiCall(endpoint);
        setQuiz(quizData);
        setQuizStarted(quizData.has_attempted);
        
        // Store the attempt ID
        if (quizData.attempt_id) {
          setAttemptId(quizData.attempt_id);
        }
        
        // Load saved answers if they exist
        if (quizData.attempt_id) {
          const savedAnswers = localStorage.getItem(`quiz_${subject}_${quizName}_${quizData.attempt_id}_answers`);
          const savedCurrentQuestion = localStorage.getItem(`quiz_${subject}_${quizName}_${quizData.attempt_id}_current`);
          
          if (savedAnswers) {
            setSelectedAnswers(JSON.parse(savedAnswers));
          }
          
          if (savedCurrentQuestion) {
            setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
          }
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [subject, quizName, attemptId, isNewAttempt]);
  
  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Start the quiz
      const startResponse = await apiCall(`/api/quizzes/${subject}/${quizName}/start`, {
        method: 'POST'
      });
      
      setQuizStarted(true);
      setAttemptId(startResponse.attempt_id);
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError('Failed to start quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // Prepare the answers in the format expected by the API
      const formattedAnswers = selectedAnswers.map((answerIndex, questionIndex) => ({
        question_id: quiz.questions[questionIndex].id,
        selected_answer_index: answerIndex
      }));
      
      // Submit the quiz
      const submitResponse = await apiCall(`/api/quizzes/${subject}/${quizName}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: formattedAnswers
        })
      });
      
      // Navigate to the results page
      navigate(`/quiz-results/${subject}/${quizName}?attempt_id=${attemptId}`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError('Failed to submit quiz. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Loading quiz...</p>
      </Container>
    );
  }
  
  // Handle the case where the user doesn't have enough tokens
  if (error) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center">
            <Card.Title className="mb-4">Token Required</Card.Title>
            
            {typeof error === 'string' ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              error
            )}
            
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button 
                as={Link} 
                to="/purchase-tokens" 
                variant="success"
              >
                <i className="fas fa-coins me-2"></i>
                Purchase Tokens
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate(`/quizzes/${subject}`)}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Quizzes
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Quiz not found</Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate(`/quizzes/${subject}`)}
          className="mt-3"
        >
          Back to Quizzes
        </Button>
      </Container>
    );
  }
  
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{quiz.quiz_name}</h1>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(`/quizzes/${subject}`)}
        >
          <i className="fas fa-times me-2"></i>
          Exit Quiz
        </Button>
      </div>
      
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <ProgressBar now={progress} variant="primary" />
      </div>
      
      <Card className="question-container">
        <Card.Body>
          <h4 className="mb-4">{question.question}</h4>
          
          <div className="mb-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline-primary"
                className={`option-btn ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Button>
            ))}
          </div>
          
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Previous
            </Button>
            
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <div className="mt-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={currentQuestion === index ? 'primary' : selectedAnswers[index] ? 'outline-success' : 'outline-secondary'}
              className="rounded-circle"
              style={{ width: '40px', height: '40px', padding: '0' }}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default QuizDetail; 
