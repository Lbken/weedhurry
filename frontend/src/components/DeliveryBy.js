import React from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryBy = ({ logoUrl, dispensaryName, vendorId, orderType, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    onClose(); // Close the cart slide-in
    navigate(`/vendor/${vendorId}/menu`); // Navigate to the vendor storefront page
  };

  return (
    <div className="text-center mt-3">
      <p className="mb-1" style={{ fontSize: '0.85rem', fontWeight: 'regular' }}>
        {orderType === 'Pickup' ? 'Pickup at' : 'Delivery by'}
      </p>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ cursor: 'pointer' }}
        onClick={handleNavigate}
      >
        {/* Vendor Logo */}
        <img
          src={logoUrl || '/placeholder-logo.png'}
          alt={dispensaryName}
          style={{
            width: '25px',
            height: '25px',
            borderRadius: '8px', // Rounded square
            objectFit: 'cover',
            marginRight: '5px',
          }}
        />
        {/* Vendor Name */}
        <span style={{ fontSize: '0.85rem', fontWeight: 'bolder', color: '#555' }}>
          {dispensaryName}
        </span>
      </div>
    </div>
  );
};

export default DeliveryBy;