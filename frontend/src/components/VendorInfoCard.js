import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import api from '../api/api';

const VendorInfoCard = () => {
    const [vendor, setVendor] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: {
            formatted: '',
            e164: ''
        },
        email: '',
    });
    const [alert, setAlert] = useState({ message: '', variant: '' });

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const response = await api.get('/api/vendors/profile');
                setVendor(response.data.data);
            } catch (error) {
                console.error('Error fetching vendor details:', error);
                setAlert({ message: 'Failed to load vendor details.', variant: 'danger' });
            }
        };
        fetchVendorData();
    }, []);

    const handleEdit = () => {
        const currentPhone = vendor.contactNumber || {};
        setFormData({
            firstName: vendor.firstName || '',
            lastName: vendor.lastName || '',
            contactNumber: {
                formatted: formatPhoneNumber(typeof currentPhone === 'object' ? 
                    currentPhone.formatted || '' : currentPhone || ''),
                e164: typeof currentPhone === 'object' ? 
                    currentPhone.e164 || '' : formatE164(currentPhone || '')
            },
            email: vendor.email || '',
        });
        setShowModal(true);
    };

    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (!match) return value;
        return [
            match[1] && `(${match[1]}`,
            match[2] && `${match[1] ? ') ' : ''}${match[2]}`,
            match[3] && `-${match[3]}`,
        ]
            .filter(Boolean)
            .join('');
    };

    const formatE164 = (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length === 10 ? `+1${cleaned}` : '';
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'contactNumber') {
            const cleaned = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                contactNumber: {
                    formatted: formatPhoneNumber(value),
                    e164: formatE164(cleaned)
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUpdate = async () => {
        const phoneNumber = formData.contactNumber.formatted.replace(/\D/g, '');
        if (phoneNumber.length !== 10) {
            setAlert({ message: 'Phone number must be 10 digits.', variant: 'danger' });
            return;
        }
    
        if (!validateEmail(formData.email)) {
            setAlert({ message: 'Invalid email address.', variant: 'danger' });
            return;
        }
    
        try {
            // Use the api instance instead of axios directly
            const response = await api.put('/api/vendors/profile', {
                ...formData,
                contactNumber: {
                    formatted: formData.contactNumber.formatted,
                    e164: formData.contactNumber.e164
                }
            });
            
            setVendor(response.data.data);
            setAlert({ message: 'Details updated successfully!', variant: 'success' });
            setShowModal(false);
        } catch (error) {
            console.error('Error updating vendor details:', error);
            setAlert({ 
                message: error.response?.data?.message || 'Failed to update details.', 
                variant: 'danger' 
            });
        }
    };

    const displayPhoneNumber = (contactNumber) => {
        if (!contactNumber) return 'N/A';
        if (typeof contactNumber === 'object') {
            return contactNumber.formatted || 'N/A';
        }
        return formatPhoneNumber(contactNumber);
    };

    return (
        <div className="container py-4">
            {alert.message && (
                <Alert 
                    variant={alert.variant}
                    className="mb-4"
                    style={{ maxWidth: '500px', margin: '0 auto' }}
                >
                    {alert.message}
                </Alert>
            )}

            <Card 
                className="shadow-sm" 
                style={{ 
                    maxWidth: '500px', 
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                }}
            >
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <Card.Title className="mb-3" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                {vendor.firstName || 'N/A'} {vendor.lastName || 'N/A'}
                            </Card.Title>
                            <Card.Text style={{ fontSize: '1rem', color: '#555' }}>
                                <div className="mb-2">
                                    <i className="bi bi-telephone me-2"></i>
                                    {displayPhoneNumber(vendor.contactNumber)}
                                </div>
                                <div>
                                    <i className="bi bi-envelope me-2"></i>
                                    {vendor.email || 'N/A'}
                                </div>
                            </Card.Text>
                        </div>
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={handleEdit}
                            style={{
                                borderRadius: '8px',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            Edit
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered
                size="md"
            >
                <Modal.Header closeButton style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Modal.Title>Edit Vendor Information</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber.formatted}
                                onChange={handleChange}
                                maxLength="14"
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowModal(false)}
                        style={{ borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUpdate}
                        style={{ borderRadius: '8px' }}
                    >
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VendorInfoCard;