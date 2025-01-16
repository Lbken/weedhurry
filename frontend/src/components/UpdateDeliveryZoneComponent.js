import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import MapComponent from './MapComponent';
import api from '../api/api'; // Update the path based on your folder structure

function UpdateDeliveryZoneComponent({ isLoaded, loadError }) {
  const [deliveryZone, setDeliveryZone] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDeliveryZone = async () => {
      try {
        const response = await api.get('/api/vendors/delivery-zone');

        if (response.data?.deliveryZone?.coordinates) {
          const [lng, lat] = response.data.deliveryZone.coordinates;
          setDeliveryZone({ lat, lng });
          setError('');
        }
      } catch (error) {
        console.error('Error fetching delivery zone:', error);
        setError(error.response?.data?.message || 'Failed to load delivery zone. Please try again later.');
      }
    };

    if (isLoaded) {
      fetchDeliveryZone();
    }
  }, [isLoaded]);

  const handleUpdateDeliveryZone = async () => {
    if (!deliveryZone?.lat || !deliveryZone?.lng) {
      setError('Please select a valid delivery zone before updating.');
      return;
    }

    try {
      const geoJsonDeliveryZone = {
        type: 'Point',
        coordinates: [deliveryZone.lng, deliveryZone.lat]
      };

      const response = await api.put('/api/vendors/delivery-zone', {
        deliveryZone: geoJsonDeliveryZone
      });

      if (response.data.success) {
        setSuccess('Delivery zone updated successfully!');
        setError('');
      } else {
        setError(response.data.message || 'Failed to update delivery zone.');
      }
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      setError(error.response?.data?.message || 'An error occurred while updating delivery zone.');
    }
  };

  if (loadError) return <Alert variant="danger">Error loading map: {loadError}</Alert>;
  if (!isLoaded) return <Alert variant="info">Loading map...</Alert>;

  return (
    <Form className="p-4 border rounded shadow-sm">
      <h5 className="mb-3">Delivery Zone</h5>
      <p className="text-muted">
        Orders will be limited to within 20-mile radius of marker.
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div className="mb-3 rounded border overflow-hidden" style={{ height: '400px' }}>
        <MapComponent
          onLocationChange={setDeliveryZone}
          initialLocation={deliveryZone}
        />
      </div>
      <div className="d-flex justify-content-center">
        <Button 
          variant="primary" 
          onClick={handleUpdateDeliveryZone} 
          className="mt-3 px-4 py-2"
          disabled={!deliveryZone}
        >
          Update Delivery Zone
        </Button>
      </div>
    </Form>
  );
}

export default UpdateDeliveryZoneComponent;