import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Import the Map Pin Icon
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AddressFilter = () => {
  const [address, setAddress] = useState('123 Main St, Los Angeles, CA'); // Default address

  const handleAddressChange = (e) => {
    setAddress(e.target.value); // Update address state when user types a new address
  };

  return (
    <div className="d-flex align-items-center justify-content-center mb-3">
      {/* Map Pin Icon */}
      <FaMapMarkerAlt className="me-2" size={20} />
      
      {/* Toggle link for address */}
      <div className="dropdown">
        <a
          href="#"
          className="text-secondary text-decoration-underline dropdown-toggle"
          id="addressDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          data-bs-auto-close="outside"
        >
          {address}
        </a>

        {/* Dropdown menu with input to set a new address */}
        <form className="dropdown-menu p-3" aria-labelledby="addressDropdown">
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Enter new address"
              value={address}
              onChange={handleAddressChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Set Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressFilter;
