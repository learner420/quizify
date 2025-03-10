import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import API_URL, { apiCall } from '../api-config';
import { AuthContext } from '../context/AuthContext';

const TokenPurchase = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { currentUser, updateUser } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching token packages from:', API_URL);
        
        const packagesData = await apiCall('/api/payment/packages');
        setPackages(Object.entries(packagesData.packages).map(([id, pkg]) => ({
          id,
          ...pkg
        })));
      } catch (err) {
        console.error('Error fetching token packages:', err);
        setError('Failed to load token packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };
  
  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Please select a token package');
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      console.log('Processing token purchase with API URL:', API_URL);
      
      const purchaseData = await apiCall('/api/payment/purchase', {
        method: 'POST',
        body: JSON.stringify({
          package_id: selectedPackage.id
        })
      });
      
      // Update user tokens
      if (updateUser && purchaseData.user) {
        updateUser(purchaseData.user);
      }
      
      setSuccess(`Successfully purchased ${selectedPackage.tokens} tokens!`);
      setSelectedPackage(null);
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      setError('Failed to process payment. Please try again later.');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Purchase Tokens</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={8}>
          <p className="lead">
            Tokens are used to access premium quizzes. Each token allows you to take one quiz.
          </p>
        </Col>
        <Col md={4} className="text-md-end">
          <div className="d-inline-block p-3 bg-light rounded">
            <span className="me-2">Your Current Tokens:</span>
            <Badge pill bg="primary" className="token-badge">
              {currentUser?.tokens || 0}
            </Badge>
          </div>
        </Col>
      </Row>
      
      <h2 className="mb-3">Select a Package</h2>
      
      {loading ? (
        <p>Loading packages...</p>
      ) : packages.length > 0 ? (
        <Row>
          {packages.map((pkg) => (
            <Col key={pkg.id} md={4} className="mb-4">
              <Card 
                className={`payment-card h-100 ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <Card.Body className="text-center">
                  <h3 className="text-capitalize mb-3">{pkg.id} Package</h3>
                  <div className="display-4 fw-bold mb-3">
                    {pkg.tokens} <small className="fs-6">Tokens</small>
                  </div>
                  <div className="mb-4">
                    <span className="fs-3">₹{pkg.amount}</span>
                    <span className="text-muted"> / one-time</span>
                  </div>
                  <Button 
                    variant={selectedPackage?.id === pkg.id ? 'primary' : 'outline-primary'} 
                    className="w-100"
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    {selectedPackage?.id === pkg.id ? 'Selected' : 'Select'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>No packages available</p>
      )}
      
      <div className="d-flex justify-content-center mt-4">
        <Button 
          variant="success" 
          size="lg" 
          onClick={handlePurchase}
          disabled={!selectedPackage || processing}
          className="px-5"
        >
          {processing ? 'Processing...' : 'Purchase Now'}
        </Button>
      </div>
      
      <Card className="mt-5">
        <Card.Body>
          <Card.Title>How Tokens Work</Card.Title>
          <ul className="mb-0">
            <li className="mb-2">Tokens are used to access premium quizzes</li>
            <li className="mb-2">1 token allows you to take one quiz</li>
            <li className="mb-2">Tokens never expire, so you can use them anytime</li>
            <li>Purchase tokens securely using Razorpay payment gateway</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TokenPurchase; 
