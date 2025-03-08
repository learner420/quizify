import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

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
        let url = `/api/quizzes/${subject}/${quizName}`;
        const params = new URLSearchParams();
        
        if (attemptId && !isNewAttempt) {
          params.append('attempt_id', attemptId);
        }
        
        if (isNewAttempt) {
          params.append('new_attempt', 'true');
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        console.log("Fetching quiz with URL:", url);
        const response = await axios.get(url);
        setQuiz(response.data);
        setQuizStarted(response.data.has_attempted);
        
        // Store the attempt ID
        if (response.data.attempt_id) {
          setAttemptId(response.data.attempt_id);
          
          // Update URL with attempt_id without navigating
          // If it was a new attempt, we'll remove the new_attempt parameter
          const newParams = new URLSearchParams();
          newParams.append('attempt_id', response.data.attempt_id);
          const newUrl = `${window.location.pathname}?${newParams.toString()}`;
          window.history.replaceState(null, '', newUrl);
          
          // Reset the new attempt flag
          setIsNewAttempt(false);
        }
        
        // Initialize selected answers array
        const savedAnswers = attemptId 
          ? localStorage.getItem(`quiz_${subject}_${quizName}_${attemptId}_answers`)
          : localStorage.getItem(`quiz_${subject}_${quizName}_answers`);
        
        const savedCurrentQuestion = attemptId
          ? localStorage.getItem(`quiz_${subject}_${quizName}_${attemptId}_current`)
          : localStorage.getItem(`quiz_${subject}_${quizName}_current`);
        
        if (savedAnswers && response.data.has_attempted && !isNewAttempt) {
          // If we have saved answers and the user has already started this quiz, restore them
          setSelectedAnswers(JSON.parse(savedAnswers));
          if (savedCurrentQuestion) {
            setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
          }
        } else {
          // Otherwise, initialize with empty values
          setSelectedAnswers(new Array(response.data.questions.length).fill(''));
        }
        
        // Show token deduction message if a token was deducted
        if (response.data.token_deducted) {
          alert(`1 token has been deducted. You now have ${response.data.user_tokens} tokens remaining.`);
        }
        // Show warning if user hasn't attempted this quiz and needs tokens
        else if (!response.data.has_attempted && response.data.token_required && !response.data.is_new_attempt) {
          if (response.data.user_tokens < 1) {
            setError('You need at least 1 token to take this quiz');
            return;
          }
          const confirmStart = window.confirm(`Taking this quiz will cost 1 token. You currently have ${response.data.user_tokens} tokens. Do you want to continue?`);
          if (!confirmStart) {
            navigate(`/quizzes/${subject}`);
            return;
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          // Check if this is a token-related error
          if (err.response.data.needs_tokens) {
            setError(
              <div>
                <p>{err.response.data.error}</p>
                <p>You currently have {err.response.data.tokens} tokens.</p>
                <Button as={Link} to="/purchase-tokens" variant="success" className="mt-2">
                  Purchase Tokens
                </Button>
              </div>
            );
          } else {
            setError('You need at least 1 token to take this quiz');
          }
        } else {
          setError('Failed to load quiz: ' + (err.response?.data?.error || err.message));
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [subject, quizName, navigate, attemptId, isNewAttempt]);
  
  const handleAnswerSelect = (answer) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = selectedAnswers.filter(answer => answer === '').length;
    
    if (unansweredQuestions > 0) {
      const confirmSubmit = window.confirm(`You have ${unansweredQuestions} unanswered question(s). Are you sure you want to submit?`);
      if (!confirmSubmit) {
        return;
      }
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Include attempt_id in the submission if we have one
      const payload = {
        answers: selectedAnswers
      };
      
      if (attemptId) {
        payload.attempt_id = attemptId;
      }
      
      await axios.post(`/api/quizzes/${subject}/${quizName}/submit`, payload);
      
      // Clear saved answers from localStorage after successful submission
      if (attemptId) {
        localStorage.removeItem(`quiz_${subject}_${quizName}_${attemptId}_answers`);
        localStorage.removeItem(`quiz_${subject}_${quizName}_${attemptId}_current`);
      } else {
        localStorage.removeItem(`quiz_${subject}_${quizName}_answers`);
        localStorage.removeItem(`quiz_${subject}_${quizName}_current`);
      }
      
      navigate(`/results/${subject}/${quizName}`);
    } catch (err) {
      console.error('Submit error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        if (err.response.status === 404) {
          // Handle the case where the quiz attempt record is missing
          setError('Your quiz session has expired. Please refresh the page to start again.');
        } else if (err.response.status === 403) {
          setError('You need at least 1 token to take this quiz');
        } else {
          setError('Failed to submit quiz: ' + (err.response.data.error || err.message));
        }
      } else {
        setError('Failed to submit quiz: Network error');
      }
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
                className={`option-btn ${selectedAnswers[currentQuestion] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Button>
            ))}
          </div>
          
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Previous
            </Button>
            
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
              >
                Next
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
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