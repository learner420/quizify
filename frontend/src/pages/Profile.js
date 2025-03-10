import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const [attempts, setAttempts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching profile data from:', API_URL);
        
        // Fetch quiz attempts
        const attemptsData = await apiCall('/api/quizzes/attempts');
        setAttempts(attemptsData.attempts || []);
        
        // Fetch transactions
        const transactionsData = await apiCall('/api/payment/transactions');
        setTransactions(transactionsData.transactions || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
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
  const totalSpent = transactions
    .filter(t => t.payment_status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTokensPurchased = transactions
    .filter(t => t.payment_status === 'completed')
    .reduce((sum, t) => sum + t.tokens_purchased, 0);
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Your Profile</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* User Info */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h5>{currentUser?.username}</h5>
              <p className="text-muted mb-0">{currentUser?.email}</p>
            </Col>
            <Col md={9}>
              <Row>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="border rounded p-3">
                    <h3 className="mb-1">{currentUser?.tokens || 0}</h3>
                    <p className="text-muted mb-0">Available Tokens</p>
                  </div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="border rounded p-3">
                    <h3 className="mb-1">{totalAttempts}</h3>
                    <p className="text-muted mb-0">Quizzes Taken</p>
                  </div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="border rounded p-3">
                    <h3 className="mb-1">{averageScore}%</h3>
                    <p className="text-muted mb-0">Average Score</p>
                  </div>
                </Col>
                <Col sm={6} md={3} className="text-center mb-3">
                  <div className="border rounded p-3">
                    <h3 className="mb-1">₹{totalSpent}</h3>
                    <p className="text-muted mb-0">Total Spent</p>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <p className="mb-2">
                  <strong>Member Since:</strong> {new Date(currentUser?.created_at).toLocaleDateString()}
                </p>
                <p className="mb-0">
                  <strong>Total Tokens Purchased:</strong> {totalTokensPurchased}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Tabs for Quiz History and Transactions */}
      <Tabs defaultActiveKey="quizzes" className="mb-4">
        <Tab eventKey="quizzes" title="Quiz History">
          {loading ? (
            <p className="py-3">Loading quiz history...</p>
          ) : attempts.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, index) => (
                    <tr key={index}>
                      <td>{new Date(attempt.attempt_date).toLocaleDateString()}</td>
                      <td>{attempt.subject}</td>
                      <td>{attempt.quiz_name}</td>
                      <td>
                        <Badge bg={attempt.percentage >= 70 ? 'success' : attempt.percentage >= 40 ? 'warning' : 'danger'}>
                          {attempt.score}/{attempt.total_questions} ({attempt.percentage.toFixed(1)}%)
                        </Badge>
                      </td>
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
              </Table>
            </div>
          ) : (
            <p className="py-3">You haven't taken any quizzes yet.</p>
          )}
        </Tab>
        
        <Tab eventKey="transactions" title="Transaction History">
          {loading ? (
            <p className="py-3">Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Tokens</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td>
                        {transaction.tokens_purchased === 10 ? 'Basic' : 
                         transaction.tokens_purchased === 25 ? 'Standard' : 
                         transaction.tokens_purchased === 75 ? 'Premium' : 'Custom'}
                      </td>
                      <td>₹{transaction.amount}</td>
                      <td>{transaction.tokens_purchased}</td>
                      <td>
                        <Badge bg={transaction.payment_status === 'completed' ? 'success' : transaction.payment_status === 'pending' ? 'warning' : 'danger'}>
                          {transaction.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="py-3">You haven't made any transactions yet.</p>
          )}
        </Tab>
      </Tabs>
      
      {/* Actions */}
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        <Button as={Link} to="/dashboard" variant="outline-primary">
          <i className="fas fa-home me-2"></i>
          Dashboard
        </Button>
        <Button as={Link} to="/purchase-tokens" variant="outline-info">
          <i className="fas fa-coins me-2"></i>
          Buy Tokens
        </Button>
      </div>
    </Container>
  );
};

export default Profile; 
