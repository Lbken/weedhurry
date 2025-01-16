import React from 'react';
import { Navbar, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DeliveryPickupToggle from './DeliveryPickupToggle';
import './DPNavBar.css';

const DPNavBar = ({ selectedOption, setSelectedOption }) => {
  return (
    <Navbar style={{ backgroundColor: '#F8F9FA' }} expand="lg" className="px-3 py-3 navbar">
      {/* Left Side: Logo */}
      <Navbar.Brand as={Link} to="/nearby" className="d-flex align-items-center">
        <Image
          src={require('../assets/images/navLogo.png')}
          alt="logo"
          height="60"
          className="d-inline-block align-top rounded me-2"
        />
      </Navbar.Brand>

      {/* Right Side: DeliveryPickupToggle */}
      <div className="ms-auto">
        <DeliveryPickupToggle 
          selectedOption={selectedOption} 
          setSelectedOption={setSelectedOption}
        />
      </div>
    </Navbar>
  );
};

export default DPNavBar;