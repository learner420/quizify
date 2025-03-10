import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API_URL, { apiCall } from '../api-config';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get token and email from URL parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid reset link');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        setError('');

        try {
            console.log('Resetting password using API URL:', API_URL);
            const response = await apiCall('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    email,
                    new_password: newPassword
                })
            });
            
            setMessage(response.message || 'Password has been reset successfully.');
            // Clear form
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect to login page after a delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Failed to reset password. The link may have expired or is invalid.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token || !email) {
        return (
            <Container className="py-5">
                <div className="mx-auto" style={{ maxWidth: '400px' }}>
                    <Alert variant="danger">
                        Invalid reset link. Please request a new password reset.
                    </Alert>
                    <Link to="/forgot-password" className="btn btn-primary">
                        Request New Reset Link
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="mx-auto" style={{ maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Reset Password</h2>
                
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword; 
