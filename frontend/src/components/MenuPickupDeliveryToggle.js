import React, { useEffect } from 'react';

const MenuPickupDeliveryToggle = ({ vendor, orderType, setOrderType }) => {
  const isDeliveryAvailable =
    vendor.dispensaryType === 'Delivery' || vendor.dispensaryType === 'Pickup & Delivery';
  const isPickupAvailable =
    vendor.dispensaryType === 'Pickup' || vendor.dispensaryType === 'Pickup & Delivery';

  useEffect(() => {
    // Set orderType based on availability
    if (orderType === 'Delivery' && isDeliveryAvailable) {
      setOrderType('Delivery');
    } else if (orderType === 'Pickup' && isPickupAvailable) {
      setOrderType('Pickup');
    } else if (isDeliveryAvailable) {
      setOrderType('Delivery');
    } else if (isPickupAvailable) {
      setOrderType('Pickup');
    }
  }, [isDeliveryAvailable, isPickupAvailable, setOrderType, orderType]);

  return (
    <div className="btn-group" role="group" aria-label="Delivery or Pickup toggle">
      {/* Delivery Button */}
      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnradio1"
        autoComplete="off"
        checked={orderType === 'Delivery'}
        onChange={() => setOrderType('Delivery')}
        disabled={!isDeliveryAvailable}
      />
      <label
        className="btn"
        style={{
          backgroundColor: orderType === 'Delivery' ? '#1E2024' : '#f8f9fa',
          border: '1px solid #ccc',
          padding: '4px 10px',
          fontSize: '11px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: orderType === 'Delivery' ? '600' : '400',
          color: !isDeliveryAvailable 
            ? '#a0a0a0' 
            : orderType === 'Delivery' 
              ? 'white' 
              : '#6c757d',
          borderRadius: '8px 0px 0px 8px',
          boxShadow: orderType === 'Delivery' ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : '0px 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '30px',
          opacity: !isDeliveryAvailable ? '0.7' : '1',
          cursor: !isDeliveryAvailable ? 'not-allowed' : 'pointer'
        }}
        htmlFor="btnradio1"
        onMouseOver={(e) => {
          if (orderType !== 'Delivery' && isDeliveryAvailable) {
            e.target.style.boxShadow = 'inset 0px 0px 10px rgba(0, 0, 0, 0.1)';
          }
        }}
        onMouseOut={(e) => {
          if (orderType !== 'Delivery' && isDeliveryAvailable) {
            e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.05)';
          }
        }}
      >
        Delivery
      </label>

      {/* Pickup Button */}
      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnradio2"
        autoComplete="off"
        checked={orderType === 'Pickup'}
        onChange={() => setOrderType('Pickup')}
        disabled={!isPickupAvailable}
      />
      <label
        className="btn"
        style={{
          backgroundColor: orderType === 'Pickup' ? '#1E2024' : '#f8f9fa',
          border: '1px solid #ccc',
          padding: '4px 10px',
          fontSize: '11px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: orderType === 'Pickup' ? '600' : '400',
          color: !isPickupAvailable 
            ? '#a0a0a0' 
            : orderType === 'Pickup' 
              ? 'white' 
              : '#6c757d',
          borderRadius: '0px 8px 8px 0px',
          boxShadow: orderType === 'Pickup' ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : '0px 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '30px',
          opacity: !isPickupAvailable ? '0.7' : '1',
          cursor: !isPickupAvailable ? 'not-allowed' : 'pointer'
        }}
        htmlFor="btnradio2"
        onMouseOver={(e) => {
          if (orderType !== 'Pickup' && isPickupAvailable) {
            e.target.style.boxShadow = 'inset 0px 0px 10px rgba(0, 0, 0, 0.1)';
          }
        }}
        onMouseOut={(e) => {
          if (orderType !== 'Pickup' && isPickupAvailable) {
            e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.05)';
          }
        }}
      >
        Pickup
      </label>
    </div>
  );
};

export default MenuPickupDeliveryToggle;