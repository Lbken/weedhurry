import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';

const BusinessHoursComponent = ({ initialHours = {}, onUpdate }) => {
  const [businessHours, setBusinessHours] = useState({});

  const containerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    maxWidth: '800px',
    margin: '2rem auto',
  };

  const headerStyle = {
    color: '#2c3e50',
    marginBottom: '2rem',
    fontSize: '1.75rem',
    fontWeight: '600',
    textAlign: 'center',
  };

  const dayLabelStyle = {
    fontSize: '1rem',
    color: '#34495e',
    fontWeight: '500',
    marginBottom: '0.5rem',
  };

  const selectStyle = {
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '0.5rem',
    fontSize: '0.95rem',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease-in-out',
  };

  useEffect(() => {
    if (initialHours && Object.keys(initialHours).length > 0) {
      const formattedHours = {};
      Object.keys(initialHours).forEach(day => {
        if (initialHours[day]) {
          formattedHours[day] = {
            open: initialHours[day].open || '',
            close: initialHours[day].close || ''
          };
        }
      });
      setBusinessHours(formattedHours);
    }
  }, [initialHours]);

  // Generate time slots from 6:00 AM to 11:30 PM in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minutes of ['00', '30']) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        slots.push({
          display: `${displayHour}:${minutes} ${period}`,
          value: `${String(hour).padStart(2, '0')}:${minutes}`
        });
      }
    }
    // Add 11:30 PM slot
    slots.push({ display: '11:30 PM', value: '23:30' });
    return slots;
  };

  const availableTimes = generateTimeSlots();

  const handleTimeChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day] || {}, [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(businessHours);
  };

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  return (
    <Container fluid style={containerStyle}>
      <Form onSubmit={handleSubmit}>
        <h2 style={headerStyle}>Business Hours</h2>
        
        {days.map((day) => (
          <Row key={day} className="mb-4 align-items-center">
            <Col xs={12} md={3}>
              <div style={dayLabelStyle}>{day}</div>
            </Col>
            <Col xs={5} md={4}>
              <Form.Select
                style={selectStyle}
                value={businessHours[day.toLowerCase()]?.open || ''}
                onChange={(e) => handleTimeChange(day.toLowerCase(), 'open', e.target.value)}
              >
                <option value="">Opening Time</option>
                {availableTimes.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.display}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={2} md={1} className="text-center">
              <span style={{ color: '#64748b', fontWeight: '500' }}>to</span>
            </Col>
            <Col xs={5} md={4}>
              <Form.Select
                style={selectStyle}
                value={businessHours[day.toLowerCase()]?.close || ''}
                onChange={(e) => handleTimeChange(day.toLowerCase(), 'close', e.target.value)}
              >
                <option value="">Closing Time</option>
                {availableTimes.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.display}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        ))}
        
        <div className="text-center mt-4">
          <Button
            type="submit"
            style={{
              backgroundColor: '#3b82f6',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '1rem',
              transition: 'all 0.2s ease-in-out',
            }}
            className="hover-shadow"
          >
            Update Hours
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default BusinessHoursComponent;