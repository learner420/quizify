import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError('');

        try {
            console.log('Sending password reset request to:', API_URL);
            const response = await apiCall('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            setMessage(response.message || 'Password reset email sent. Please check your inbox.');
            setEmail(''); // Clear the form
        } catch (err) {
            console.error('Error requesting password reset:', err);
            setError('Failed to send password reset email. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="mx-auto" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Forgot Password</h2>
                
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Form.Text className="text-muted">
                            We'll send you a link to reset your password.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                        <Link to="/login" className="btn btn-link text-center">
                            Back to Login
                        </Link>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default ForgotPassword; 
