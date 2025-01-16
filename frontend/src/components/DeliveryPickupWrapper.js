import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import NearbyVendorsPage from './NearbyVendorsPage';
import NearbyPickupPage from './NearbyPickupPage';
import SearchBar from './SearchBar';
import DPNavBar from './DPNavBar';
import './DeliveryPickupWrapper.css';

const DeliveryPickupWrapper = () => {
  const [selectedOption, setSelectedOption] = useState('Delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [animate, setAnimate] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [parsedAddress, setParsedAddress] = useState({ 
    street: '', 
    city: '', 
    stateAbbreviation: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      const parts = savedAddress.split(',');
      setParsedAddress({
        street: parts[0]?.trim() || '',
        city: parts[1]?.trim() || '',
        stateAbbreviation: parts[2]?.trim().split(' ')[0] || '',
      });
    }

    // Add scroll listener for toolbar shadow
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearAddressAndNavigate = () => {
    localStorage.removeItem('userAddress');
    navigate('/');
  };

  return (
    <div className={`delivery-pickup-wrapper ${animate ? 'slide-in' : ''}`}>
      {/* Navbar */}
      <DPNavBar 
        selectedOption={selectedOption} 
        setSelectedOption={setSelectedOption}
      />

      {/* Toolbar Section */}
      <div className={`toolbar-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="toolbar-inner">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          {/* Address Selector */}
          <div 
            className="location-selector"
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
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {selectedOption === 'Delivery' ? (
          <NearbyVendorsPage searchQuery={searchQuery} />
        ) : (
          <NearbyPickupPage searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default DeliveryPickupWrapper;