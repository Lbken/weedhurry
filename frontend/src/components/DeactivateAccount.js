import React, { useState } from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom'; // Import navigation hook

const DeactivateAccount = () => {
    const [showModal, setShowModal] = useState(false);
    const [alert, setAlert] = useState({ message: '', variant: '' });
    const { auth, logout } = useAuth(); // Access the auth and logout functions from AuthContext
    const navigate = useNavigate(); // For redirection

    // Handle account deactivation
    const handleDeactivate = async () => {
        try {
            const response = await axios.put(
                '/api/vendors/deactivate-account',
                {}, // No body required
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`, // Use token from context
                    },
                }
            );
            setAlert({ message: response.data.message, variant: 'success' });
            logout(navigate); // Log out the user and redirect to the home page
        } catch (error) {
            console.error('Error deactivating account:', error);
            setAlert({ message: 'Failed to deactivate account. Please try again.', variant: 'danger' });
        } finally {
            setShowModal(false);
        }
    };

    return (
        <div>
            {/* Alert Message */}
            {alert.message && <Alert variant={alert.variant}>{alert.message}</Alert>}

            {/* Deactivate Account Button */}
            <Button variant="danger" onClick={() => setShowModal(true)}>
                Deactivate Account
            </Button>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deactivation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to deactivate your account? You will need to register again to reactivate it.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeactivate}>
                        Confirm Deactivate
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DeactivateAccount;
