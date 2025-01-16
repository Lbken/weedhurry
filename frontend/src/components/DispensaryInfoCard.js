import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import api from '../api/api';

const DispensaryInfoCard = () => {
    const [dispensary, setDispensary] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        dispensaryName: '',
        license: '',
    });
    const [alert, setAlert] = useState({ message: '', variant: '' });

    useEffect(() => {
        const fetchDispensaryData = async () => {
            try {
                const response = await api.get('/api/vendors/profile');
                if (response.data.success) {
                    setDispensary(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dispensary details:', error);
                setAlert({ 
                    message: error.response?.data?.message || 'Failed to load dispensary details.', 
                    variant: 'danger' 
                });
            }
        };
        fetchDispensaryData();
    }, []);

    const handleEdit = () => {
        setFormData({
            dispensaryName: dispensary.dispensaryName || '',
            license: dispensary.license || '',
        });
        setShowModal(true);
    };
    
    const handleUpdate = async () => {
        try {
            const response = await api.put('/api/vendors/dispensary-info', {
                ...formData,
                dispensaryType: dispensary.dispensaryType // Preserve existing type
            });
    
            if (response.data.success) {
                setDispensary(response.data.data);
                setAlert({ message: 'Dispensary information updated successfully!', variant: 'success' });
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error updating dispensary details:', error);
            setAlert({ 
                message: error.response?.data?.message || 'Failed to update details.', 
                variant: 'danger' 
            });
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setAlert({ message: '', variant: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                            <Card.Title 
                                className="mb-3" 
                                style={{ fontSize: '1.25rem', fontWeight: '600' }}
                            >
                                {dispensary.dispensaryName || 'N/A'}
                            </Card.Title>
                            <Badge 
                                bg="light" 
                                text="dark" 
                                className="border mb-3"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    borderRadius: '6px'
                                }}
                            >
                                {dispensary.dispensaryType || 'Type N/A'}
                            </Badge>
                            <div 
                                className="text-muted" 
                                style={{ fontSize: '1rem' }}
                            >
                                <div className="mt-2">
                                    License: {dispensary.license || 'LICENSE N/A'}
                                </div>
                            </div>
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
                onHide={handleClose}
                centered
                size="md"
            >
                <Modal.Header 
                    closeButton 
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                >
                    <Modal.Title>Edit Dispensary Information</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label>Dispensary Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="dispensaryName"
                                value={formData.dispensaryName}
                                onChange={handleInputChange}
                                placeholder="Enter dispensary name"
                                style={{ 
                                    borderRadius: '8px',
                                    padding: '0.625rem'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>License Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="license"
                                value={formData.license}
                                onChange={handleInputChange}
                                placeholder="Enter license number"
                                style={{ 
                                    borderRadius: '8px',
                                    padding: '0.625rem'
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #e0e0e0' }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={handleClose}
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

export default DispensaryInfoCard;