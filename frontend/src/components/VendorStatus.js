import React from 'react';
import { Dropdown } from 'react-bootstrap';

const VendorStatus = ({ vendor, vendorStatus }) => {
  if (!vendor || !vendor.businessHours) {
    return <p>Loading...</p>;
  }

  // Format time to AM/PM format
  const formatTime = (time) => {
    if (!time) return 'Closed';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 hour to 12
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Format business hours into a readable format
  const formatBusinessHours = (hours) => {
    return Object.entries(hours).map(([day, { open, close }]) => (
      <div key={day} style={{ marginBottom: '5px' }}>
        <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{' '}
        {formatTime(open)} - {formatTime(close)}
      </div>
    ));
  };

  return (
    <Dropdown>
      {/* Custom Toggle */}
      <Dropdown.Toggle as="div" id="custom-toggle" className="d-flex align-items-center">
        {/* Status Circle */}
        <span
          className={`status-circle ${
            vendorStatus.status === 'open' ? 'bg-success' : 'bg-danger'
          }`}
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            marginRight: '8px',
          }}
        ></span>
        {/* Status Text */}
        <span className="me-auto">
          {vendorStatus.status === 'open'
            ? `Open until ${vendorStatus.until} pm`
            : `Closed until ${vendorStatus.until} am`}
        </span>
      </Dropdown.Toggle>

      {/* Dropdown Menu */}
      <Dropdown.Menu align="end" style={{ minWidth: '300px' }}>
        {/* Contact Links Row */}
        <div className="d-flex justify-content-around px-3 py-2">
          <a
            href={`tel:${vendor.contactNumber}`}
            className="text-decoration-none text-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-telephone-fill me-2"></i>
            Call
          </a>
          <a
            href={`sms:${vendor.contactNumber}`}
            className="text-decoration-none text-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-chat-dots-fill me-2"></i>
            Text
          </a>
        </div>

        <Dropdown.Divider />

        {/* Business Hours */}
        <Dropdown.Header>Business Hours</Dropdown.Header>
        <div style={{ padding: '0 1rem' }}>{formatBusinessHours(vendor.businessHours)}</div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default VendorStatus;