import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './QuizResults.css'; // We'll create this CSS file next

const QuizResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  
  const { subject, quizName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract attempt_id from query parameters if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const attemptIdParam = searchParams.get('attempt_id');
    if (attemptIdParam) {
      setAttemptId(attemptIdParam);
    }
  }, [location.search]);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get the most recent attempt for this quiz
        const attemptsResponse = await axios.get('/api/quizzes/attempts');
        const attempts = attemptsResponse.data.attempts;
        
        let quizAttempt;
        
        if (attemptId) {
          // If we have an attempt ID, find that specific attempt
          quizAttempt = attempts.find(
            attempt => attempt.id === parseInt(attemptId, 10)
          );
        } else {
          // Otherwise, find the most recent attempt for this quiz
          quizAttempt = attempts.find(
            attempt => attempt.subject === subject && attempt.quiz_name === quizName
          );
        }
        
        if (!quizAttempt) {
          throw new Error('Quiz attempt not found');
        }
        
        // Store the attempt ID for future use
        setAttemptId(quizAttempt.id);
        
        console.log("Found quiz attempt:", quizAttempt);
        
        // Get user answers from the attempt record
        if (quizAttempt.user_answers && quizAttempt.user_answers.length > 0) {
          console.log("Using user answers from attempt record:", quizAttempt.user_answers);
          setUserAnswers(quizAttempt.user_answers);
        } else {
          console.log("No user answers found in attempt record");
          
          // Try to get saved answers from localStorage as a fallback
          const savedAnswersKey = `quiz_${subject}_${quizName}_${quizAttempt.id}_answers`;
          const savedAnswers = localStorage.getItem(savedAnswersKey);
          
          if (savedAnswers) {
            console.log("Found saved answers in localStorage");
            setUserAnswers(JSON.parse(savedAnswers));
          } else {
            console.log("No saved answers found in localStorage");
          }
        }
        
        // Submit the quiz again to get the results
        // This is a workaround since we don't store the detailed results in the database
        try {
          // Include attempt_id in the request if we have one
          const url = `/api/quizzes/${subject}/${quizName}?attempt_id=${quizAttempt.id}`;
            
          const quizResponse = await axios.get(url);
          const quiz = quizResponse.data;
          
          // Use the user answers from the attempt record or localStorage
          const answersToSubmit = userAnswers.length > 0 ? userAnswers : new Array(quiz.questions.length).fill('');
          
          // Submit the quiz with the user's answers to get the correct answers
          const submitPayload = {
            answers: answersToSubmit,
            attempt_id: quizAttempt.id,
            preserve_score: true // Add a flag to preserve the existing score
          };
          
          const submitResponse = await axios.post(`/api/quizzes/${subject}/${quizName}/submit`, submitPayload);
          
          // Make sure results is defined
          const quizResults = submitResponse.data.results || [];
          
          // If we got user answers from the response, update our state
          if (submitResponse.data.user_answers && submitResponse.data.user_answers.length > 0) {
            console.log("Using user answers from submit response:", submitResponse.data.user_answers);
            setUserAnswers(submitResponse.data.user_answers);
          }
          
          // Use the actual score from the attempt record, not from the submit response
          // This ensures we don't overwrite the actual score
          const finalResults = {
            score: quizAttempt.score,
            totalQuestions: quizAttempt.total_questions,
            percentage: quizAttempt.percentage,
            results: quizResults,
            attempt_id: quizAttempt.id,
            user_answers: submitResponse.data.user_answers || userAnswers
          };
          
          console.log("Setting final results:", finalResults);
          setResults(finalResults);
        } catch (submitErr) {
          console.error('Error getting quiz details:', submitErr);
          
          // Fallback to just showing the score without details
          setResults({
            score: quizAttempt.score,
            totalQuestions: quizAttempt.total_questions,
            percentage: quizAttempt.percentage,
            results: [], // Ensure results is an empty array, not undefined
            attempt_id: quizAttempt.id,
            user_answers: userAnswers
          });
        }
      } catch (err) {
        setError('Failed to load quiz results: ' + (err.message || 'Unknown error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [subject, quizName, attemptId]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <p>Loading results...</p>
      </Container>
    );
  }
  
  if (!results) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Results not found</Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
          className="mt-3"
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  // Determine performance level
  let performanceLevel = 'Needs Improvement';
  let performanceColor = 'danger';
  
  if (results.percentage >= 80) {
    performanceLevel = 'Excellent';
    performanceColor = 'success';
  } else if (results.percentage >= 60) {
    performanceLevel = 'Good';
    performanceColor = 'primary';
  } else if (results.percentage >= 40) {
    performanceLevel = 'Average';
    performanceColor = 'warning';
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quiz Results: {quizName}</h1>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-home me-2"></i>
          Back to Dashboard
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Results Summary */}
      <Card className="mb-4">
        <Card.Body>
          <div className="text-center mb-4">
            <h2>Your Score</h2>
            <div className="display-1 fw-bold text-primary mb-2">
              {results.score}/{results.totalQuestions}
            </div>
            <h4>
              <Badge bg={performanceColor}>{results.percentage.toFixed(1)}% - {performanceLevel}</Badge>
            </h4>
          </div>
          
          <ProgressBar 
            now={results.percentage} 
            variant={performanceColor} 
            className="mb-4" 
            style={{ height: '20px' }} 
          />
          
          <div className="d-flex justify-content-center gap-4">
            <div className="text-center">
              <h5>{results.score}</h5>
              <p className="text-muted">Correct</p>
            </div>
            <div className="text-center">
              <h5>{results.totalQuestions - results.score}</h5>
              <p className="text-muted">Incorrect</p>
            </div>
            <div className="text-center">
              <h5>{results.totalQuestions}</h5>
              <p className="text-muted">Total</p>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Question Review */}
      <h2 className="mb-3">Question Review</h2>
      
      {results.results && results.results.length > 0 ? (
        results.results.map((result, index) => {
          // Get the user's answer for this question from results.user_answers if available
          // or from the result object itself as a fallback
          const userAnswer = results.user_answers && results.user_answers[index] 
            ? results.user_answers[index] 
            : (result.user_answer || '');
            
          const isCorrect = userAnswer === result.correct_answer;
          
          return (
            <Card key={index} className="question-container mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  Question {index + 1}: {result.question}
                </h5>
                
                <div className="mb-4 options-container">
                  {result.options && result.options.length > 0 ? (
                    result.options.map((option, optIndex) => {
                      // Determine if this option is the correct answer
                      const isCorrectAnswer = option === result.correct_answer;
                      // Determine if this option was the user's answer
                      const isUserAnswer = option === userAnswer;
                      
                      // Determine the CSS class for this option
                      let optionClass = "option-btn";
                      if (isCorrectAnswer && isUserAnswer) {
                        // User selected the correct answer
                        optionClass += " correct-answer";
                      } else if (isCorrectAnswer) {
                        // This is the correct answer but user didn't select it
                        optionClass += " correct-answer";
                      } else if (isUserAnswer) {
                        // User selected this but it's wrong
                        optionClass += " incorrect-answer";
                      }
                      
                      return (
                        <div 
                          key={optIndex}
                          className={optionClass}
                        >
                          <div className="option-letter">
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <div className="option-text">
                            {option}
                            {isCorrectAnswer && (
                              <i className="fas fa-check ms-2 correct-icon"></i>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <i className="fas fa-times ms-2 incorrect-icon"></i>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No options available for this question.</p>
                  )}
                </div>
                
                <div className="explanation">
                  <h6>Explanation:</h6>
                  <p>{result.explanation || 'No explanation provided.'}</p>
                  
                  <div className="user-answer-summary">
                    <p>
                      <strong>Your answer: </strong> 
                      <span className={isCorrect ? "text-success" : "text-danger"}>
                        {userAnswer || 'No answer provided'}
                        {isCorrect ? 
                          <i className="fas fa-check-circle ms-2"></i> : 
                          <i className="fas fa-times-circle ms-2"></i>
                        }
                      </span>
                    </p>
                    <p>
                      <strong>Correct answer: </strong>
                      <span className="text-success">
                        {result.correct_answer}
                      </span>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })
      ) : (
        <Alert variant="info">
          Detailed question review is not available for this quiz attempt.
        </Alert>
      )}
      
      {/* Actions */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button 
          onClick={() => {
            // Clear any saved answers for this quiz before retaking
            if (results && results.attempt_id) {
              localStorage.removeItem(`quiz_${subject}_${quizName}_${results.attempt_id}_answers`);
              localStorage.removeItem(`quiz_${subject}_${quizName}_${results.attempt_id}_current`);
            }
            navigate(`/quizzes/${subject}/${quizName}?new_attempt=true`);
          }}
          variant="primary"
        >
          <i className="fas fa-redo me-2"></i>
          Retake Quiz
        </Button>
        <Button 
          as={Link} 
          to={`/quizzes/${subject}`} 
          variant="outline-primary"
        >
          <i className="fas fa-list me-2"></i>
          More {subject} Quizzes
        </Button>
      </div>
    </Container>
  );
};

export default QuizResults; 