import React, { useState, useEffect } from 'react';
import { Navbar, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import './CustomNavbar.css';

const CustomNavbar = () => {
  const [parsedAddress, setParsedAddress] = useState({ street: '', city: '', stateAbbreviation: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      const parts = savedAddress.split(',');
      setParsedAddress({
        street: parts[0]?.trim() || '',
        city: parts[1]?.trim() || '',
        stateAbbreviation: parts[2]?.trim().split(' ')[0] || '',
      });
    }
  }, []);

  const clearAddressAndNavigate = () => {
    localStorage.removeItem('userAddress');
    navigate('/');
  };

  return (
    <Navbar style={{ backgroundColor: '#F8F9FA', border: '0px' }} expand="lg" className="px-3 navbar">
      {/* Left Side: Logo */}
      <Navbar.Brand as={Link} to="/nearby" className="d-flex align-items-center">
        <Image
          src={require('../assets/images/navLogo.png')}
          alt="logo"
          height="60"
          className="d-inline-block align-top rounded me-2"
        />
      </Navbar.Brand>

      {/* Right Side: Location Icon and Address */}
      <div 
        className="location-selector ms-auto"
        onClick={clearAddressAndNavigate}
      >
        <MapPin 
          size={18}
          className="location-icon"
          strokeWidth={2.5}
        />
        {parsedAddress.street || parsedAddress.city || parsedAddress.stateAbbreviation ? (
          <span className="address-text">
            {parsedAddress.street || `${parsedAddress.city}, ${parsedAddress.stateAbbreviation}`}
          </span>
        ) : null}
      </div>
    </Navbar>
  );
};

export default CustomNavbar;