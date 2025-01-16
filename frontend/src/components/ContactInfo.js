import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

const ContactInfo = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    email: '',
    consent: true, // Checkbox is pre-selected
    phone: '',
    idFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, idFile: e.target.files[0] });
  };

  const handleCheckboxChange = () => {
    setFormData({ ...formData, consent: !formData.consent });
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
      <h4>Contact Information</h4>
      <Form>
        {/* First Name and Last Name */}
        <Row className="mb-3">
          <Col>
            <Form.Label>First Name</Form.Label>
            <Form.Group controlId="firstName">
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder=""
                required // Field is required
              />
            </Form.Group>
          </Col>
          <Col>
          <Form.Label>Last Name</Form.Label>
            <Form.Group controlId="lastName">
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder=""
                required // Field is required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Date of Birth */}
        <Form.Group controlId="dob" className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Row>
            <Col>
              <Form.Control
                as="select"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                required // Field is required
              >
                <option value="">Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Form.Control>
            </Col>
            <Col>
              <Form.Control
                as="select"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required // Field is required
              >
                <option value="">Month</option>
                {[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ].map((month, i) => (
                  <option key={i + 1} value={i + 1}>
                    {month}
                  </option>
                ))}
              </Form.Control>
            </Col>
            <Col>
              <Form.Control
                as="select"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required // Field is required
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={i + 1955} value={i + 1955}>
                    {i + 1955}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Row>
        </Form.Group>

        {/* Email Address and Consent */}
        <Form.Group controlId="email" className="mb-3">
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email address"
            required // Field is required
          />
        </Form.Group>
        <Form.Group controlId="emailConsent" className="mb-3" style={{ fontSize: '14px' }}>
          <Form.Check
            type="checkbox"
            name="consent"
            label="I consent to receiving future promotional emails from WeedHurry"
            checked={formData.consent}
            onChange={handleCheckboxChange}
          />
        </Form.Group>

        {/* Phone Number */}
        <Form.Group controlId="phone" className="mb-3">
          <Form.Control
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone number"
          required // Field is required
          />
  
          {/* Small grey text under the input field */}
          <Form.Text style={{ color: 'grey', fontSize: '11px' }}>
            I consent to receive SMS texts about my order at the phone number above. Standard Msg&Data rates apply.
          </Form.Text>
        </Form.Group>


        {/* ID Upload */}
        <h6>Dispensary requires a photo of your ID</h6>
        <Form.Group controlId="idUpload" className="mb-3 d-flex align-items-center">
          <Form.Label className="me-3">Upload your ID</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileUpload}
            style={{ width: '260px', display: 'inline-block' }} // Smaller button, inline with label
            required // Field is required
          />
        </Form.Group>

        {/* Optional: Show the uploaded file name */}
        {formData.idFile && <p>Uploaded file: {formData.idFile.name}</p>}
      </Form>
    </div>
  );
};

export default ContactInfo;
