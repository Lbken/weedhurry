import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import axios from 'axios';

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/api/auth/reset-password-request', { email });

            if (response.data?.message) {
                setSuccess(response.data.message);
            }
        } catch (err) {
            console.error('Error sending reset password request:', err);
            setError('Failed to send reset password request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ maxWidth: '400px' }} className="shadow p-4">
                <Card.Body>
                    <h3 className="text-center mb-4">Reset Password</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPasswordRequest;
