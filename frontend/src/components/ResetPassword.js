import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams(); // Extract token from URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/api/auth/reset-password', {
                token,
                password,
            });

            if (response.data?.success) {
                setSuccess('Password reset successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login'); // Redirect to login page
                }, 3000);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Failed to reset password. The link may have expired or is invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ maxWidth: '400px' }} className="shadow p-4">
                <Card.Body>
                    <h3 className="text-center mb-4">Reset Your Password</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPassword;
