import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button } from 'react-bootstrap';
import { BsPersonCircle } from 'react-icons/bs';
import api from '../api/api';

const VendorLogoCard = ({ vendorId, apiUrl }) => {
    const [logoUrl, setLogoUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    // Fetch vendor logo on component mount
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await api.get('/api/vendors/profile');
                setLogoUrl(response.data.data.logoUrl || '');
            } catch (err) {
                console.error('Error fetching vendor logo:', err);
            }
        };
        fetchLogo();
    }, [apiUrl]);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Generate a preview URL for the selected file
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result); // Set preview URL from file data
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewUrl(''); // Clear the preview if no file is selected
        }
    };

    // Handle logo upload
    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        setLoading(true);
    
        const formData = new FormData();
        formData.append('logo', file);
    
        try {
            const response = await api.post('/api/vendors/upload-logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setLogoUrl(response.data.logoUrl);
            alert('Logo updated successfully!');
        } catch (err) {
            console.error('Error uploading logo:', err);
            alert('Failed to upload logo.');
        } finally {
            setFile(null);
            setPreviewUrl('');
            setLoading(false);
        }
    };
    
    return (
        <Card className="text-center shadow-sm" style={{ width: '300px', margin: '1rem auto' }}>
            <Card.Body>
                <Card.Title className="mb-3">Store Logo</Card.Title>
                <div className="d-flex flex-column align-items-center">
                    {previewUrl ? (
                        // Show the preview if an image is selected
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="rounded"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px dashed gray' }}
                        />
                    ) : logoUrl ? (
                        // Show the saved logo if no preview is available
                        <img
                            src={logoUrl}
                            alt="Vendor Logo"
                            className="rounded"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                    ) : (
                        // Show placeholder icon if no logo is available
                        <BsPersonCircle size={150} className="text-secondary" />
                    )}
                    <Button
                        variant="outline-secondary"
                        className="mt-3 btn-sm"
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        {logoUrl || previewUrl ? 'Edit' : 'Upload'}
                    </Button>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <Button
                    variant="primary"
                    className="mt-3"
                    disabled={!file || loading}
                    onClick={handleUpload}
                >
                    {loading ? 'Uploading...' : 'Save'}
                </Button>
            </Card.Body>
        </Card>
    );
};

export default VendorLogoCard;
