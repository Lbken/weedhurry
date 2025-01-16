import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const DeliveryAddress = ({ onSaveAddress }) => {
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    county: '',
    state: '',
    zip: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData({ ...addressData, [name]: value });
  };

  const handleSave = () => {
    if (onSaveAddress) {
      onSaveAddress(addressData);
    }
  };

  return (
    <div
      className="mb-1 p-4"
      style={{
        backgroundColor: '#f8f9fa', // Light background
        margin: '20px', // Small margin from screen edges
        borderRadius: '8px',
      }}
    >
      <h4>Delivery Address</h4>
      <Form>
        {/* Street Address */}
        <Form.Group controlId="street" className="mb-3">
          <Form.Label>Street Address</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={addressData.street}
            onChange={handleInputChange}
            placeholder="Enter street address"
            required
          />
        </Form.Group>

        {/* City and County */}
        <Row className="mb-3">
          <Col>
            <Form.Label>City</Form.Label>
            <Form.Group controlId="city">
              <Form.Control
                type="text"
                name="city"
                value={addressData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Label>County</Form.Label>
            <Form.Group controlId="county">
              <Form.Control
                type="text"
                name="county"
                value={addressData.county}
                onChange={handleInputChange}
                placeholder="Enter county"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* State and ZIP Code */}
        <Row className="mb-3">
          <Col>
            <Form.Label>State</Form.Label>
            <Form.Group controlId="state">
              <Form.Control
                type="text"
                name="state"
                value={addressData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Label>ZIP Code</Form.Label>
            <Form.Group controlId="zip">
              <Form.Control
                type="text"
                name="zip"
                value={addressData.zip}
                onChange={handleInputChange}
                placeholder="Enter ZIP code"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Save Address Button */}
        <Form.Group controlId="saveAddress" className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Address
          </button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default DeliveryAddress;
