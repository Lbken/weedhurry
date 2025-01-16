import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Image, Spinner } from 'react-bootstrap';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const DailyPromoForm = () => {
    const { auth } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [applicableToSaleItems, setApplicableToSaleItems] = useState(false);
    const [promoFile, setPromoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [currentPromoImage, setCurrentPromoImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchExistingPromo();
    }, []);

    const fetchExistingPromo = async () => {
        try {
            const response = await api.get('/api/vendors/profile');
            
            if (response.data?.data?.dailyPromo) {
                const { dailyPromo } = response.data.data;
                setTitle(dailyPromo.title || '');
                setDescription(dailyPromo.description || '');
                setApplicableToSaleItems(dailyPromo.applicableToSaleItems || false);
                setCurrentPromoImage(dailyPromo.promoUrl || null);
            }
        } catch (err) {
            console.error('Error fetching promo:', err);
        } finally {
            setFetchingData(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }
            setPromoFile(file);
            // Create and set preview URL
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('applicableToSaleItems', applicableToSaleItems);
        if (promoFile) {
            formData.append('promoImage', promoFile);
        }

        try {
            const response = await api.post('/api/vendors/daily-promo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data?.data?.promoUrl) {
                setCurrentPromoImage(response.data.data.promoUrl);
            }
            
            // Clean up preview
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
            }
            
            setPromoFile(null);
            alert('Promo saved successfully!');
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
            } else {
                console.error('Error saving promo:', err);
                alert(`Failed to save promo: ${err.response?.data?.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <Card className="shadow-sm p-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm p-4">
            <Card.Body>
                <h4 className="mb-4">{currentPromoImage ? 'Update Daily Promo' : 'Create Daily Promo'}</h4>
                
                {(currentPromoImage || previewImage) && (
                    <div className="mb-4 text-center">
                        <h6 className="mb-3">{previewImage ? 'New Image Preview' : 'Current Promo Image'}</h6>
                        <Image 
                            src={previewImage || currentPromoImage}
                            alt="Promo"
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '300px', 
                                objectFit: 'contain',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                padding: '8px'
                            }}
                        />
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="promoTitle" className="mb-3">
                        <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter promo title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </Form.Group>

                    <Form.Group controlId="promoDescription" className="mb-3">
                        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter promo description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            maxLength={500}
                        />
                        <Form.Text className="text-muted">
                            Maximum 500 characters
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="applicableToSaleItems" className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Applicable to sale items"
                            checked={applicableToSaleItems}
                            onChange={(e) => setApplicableToSaleItems(e.target.checked)}
                        />
                    </Form.Group>

                    <Form.Group controlId="promoImage" className="mb-4">
                        <Form.Label>Promo Image {!currentPromoImage && <span className="text-danger">*</span>}</Form.Label>
                        <Form.Control 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            required={!currentPromoImage}
                        />
                        <Form.Text className="text-muted">
                            {currentPromoImage ? 'Upload new image to replace current promo image' : 'Choose an image for your promo'} (Max 5MB)
                        </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading}
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Saving...
                                </>
                            ) : (
                                currentPromoImage ? 'Update Promo' : 'Save Promo'
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default DailyPromoForm;