import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
//import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const styles = {
        mainContainer: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafafa'
        },
        pageWrapper: {
            flex: '1 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        },
        card: {
            width: '100%',
            maxWidth: '420px',
            borderRadius: '12px',
            border: '1px solid #eaeaea',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff'
        },
        cardBody: {
            padding: '2.5rem'
        },
        title: {
            color: '#2d3748',
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            textAlign: 'center'
        },
        formLabel: {
            color: '#4a5568',
            fontWeight: '600',
            fontSize: '0.95rem',
            marginBottom: '0.5rem'
        },
        formControl: {
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '1rem',
            backgroundColor: '#ffffff'
        },
        submitButton: {
            padding: '0.75rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            backgroundColor: '#2d3748',
            border: 'none',
            transition: 'background-color 0.2s ease'
        },
        forgotPassword: {
            color: '#4a5568',
            textDecoration: 'none',
            fontSize: '0.95rem',
            transition: 'color 0.2s ease'
        },
        footerWrapper: {
            flexShrink: 0
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data?.success) {
                const { vendorId } = response.data;
                await login(vendorId);
                navigate('/vendor-dashboard');
            } else {
                throw new Error(response.data?.message || 'Unexpected response structure');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(
                err.response?.data?.message || 
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.mainContainer}>
            <div style={styles.pageWrapper}>
                <Container>
                    <Card style={styles.card}>
                        <Card.Body style={styles.cardBody}>
                            <h2 style={styles.title}>Vendor Login</h2>
                            {error && (
                                <Alert 
                                    variant="danger" 
                                    style={{
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="email" className="mb-4">
                                    <Form.Label style={styles.formLabel}>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={styles.formControl}
                                        className="hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    />
                                </Form.Group>

                                <Form.Group controlId="password" className="mb-4">
                                    <Form.Label style={styles.formLabel}>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={styles.formControl}
                                        className="hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    />
                                </Form.Group>

                                <Button
                                    variant="dark"
                                    type="submit"
                                    className="w-100 mb-4 hover:bg-gray-800 active:bg-gray-900"
                                    style={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link 
                                        to="/reset-password-request" 
                                        style={styles.forgotPassword}
                                        className="hover:text-gray-700"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <div style={styles.footerWrapper}>
                <Footer />
            </div>
        </div>
    );
};

export default Login;