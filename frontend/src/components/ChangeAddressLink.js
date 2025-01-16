import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChangeAddressLink = () => {
  const navigate = useNavigate();

  const handleChangeAddress = () => {
    // Clear the saved address from localStorage
    localStorage.removeItem('userAddress');

    // Navigate back to the address page
    navigate('/');
  };

  return (
    <button
      onClick={handleChangeAddress}
      className="btn btn-link p-0"
      style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
    >
      Change Address
    </button>
  );
};

export default ChangeAddressLink;
