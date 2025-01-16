import React from 'react';

const DeliveryPickupToggle = ({ selectedOption, setSelectedOption }) => (
  <div className="btn-group" role="group" aria-label="Delivery or Pickup toggle">
    {/* Delivery Button */}
    <input
      type="radio"
      className="btn-check"
      name="btnradio"
      id="btnradio1"
      autoComplete="off"
      checked={selectedOption === 'Delivery'}
      onChange={() => setSelectedOption('Delivery')}
    />
    <label
      className="btn"
      style={{
        backgroundColor: selectedOption === 'Delivery' ? '#1E2024' : '#f8f9fa',
        border: '1px solid #ccc',
        padding: '8px 16px',
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: selectedOption === 'Delivery' ? '600' : '400',
        color: selectedOption === 'Delivery' ? 'white' : '#6c757d',
        borderRadius: '8px 0px 0px 8px',
        boxShadow: selectedOption === 'Delivery' ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : '0px 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        textAlign: 'center', // Center align text
        display: 'flex', // Use flexbox
        alignItems: 'center', // Align text vertically
        justifyContent: 'center', // Align text horizontally
        height: '36px', // Set consistent height for both buttons
      }}
      htmlFor="btnradio1"
      onMouseOver={(e) => {
        if (selectedOption !== 'Delivery') {
          e.target.style.boxShadow = 'inset 0px 0px 10px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseOut={(e) => {
        if (selectedOption !== 'Delivery') {
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
      id="btnradio3"
      autoComplete="off"
      checked={selectedOption === 'Pickup'}
      onChange={() => setSelectedOption('Pickup')}
    />
    <label
      className="btn"
      style={{
        backgroundColor: selectedOption === 'Pickup' ? '#1E2024' : '#f8f9fa',
        border: '1px solid #ccc',
        padding: '8px 16px',
        fontSize: '12px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: selectedOption === 'Pickup' ? '600' : '400',
        color: selectedOption === 'Pickup' ? 'white' : '#6c757d',
        borderRadius: '0px 8px 8px 0px',
        boxShadow: selectedOption === 'Pickup' ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : '0px 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        textAlign: 'center', // Center align text
        display: 'flex', // Use flexbox
        alignItems: 'center', // Align text vertically
        justifyContent: 'center', // Align text horizontally
        height: '36px', // Set consistent height for both buttons
      }}
      htmlFor="btnradio3"
      onMouseOver={(e) => {
        if (selectedOption !== 'Pickup') {
          e.target.style.boxShadow = 'inset 0px 0px 10px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseOut={(e) => {
        if (selectedOption !== 'Pickup') {
          e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.05)';
        }
      }}
    >
      Pickup
    </label>
  </div>
);

export default DeliveryPickupToggle;
