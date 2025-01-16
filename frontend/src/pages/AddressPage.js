import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { Typewriter } from 'react-simple-typewriter';
import Footer from '../components/Footer';

const AddressPage = () => {
  const [address, setAddress] = useState('');
  const [isOver18, setIsOver18] = useState(true); // Track checkbox state
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (!isLoaded) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        setAddress(place.formatted_address);
        localStorage.setItem('userAddress', place.formatted_address);
        navigate('/nearby');
      }
    });
  }, [isLoaded, navigate]);

  if (loadError) {
    return <p>Error loading Google Maps API</p>;
  }

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <div className="d-flex flex-column justify-content-between vh-100" style={{ backgroundColor: '#F8F9FA', padding: '20px' }}>
      {/* Upper Section */}
      <div className="d-flex justify-content-start">
        <img
          src={require('../assets/images/addressPageLogo.png')}
          alt="WeedHurry Logo"
          style={{ height: '40px' }}
        />
      </div>

      {/* Middle Section */}
      <div className="text-center">
        {/* Animated Heading */}
        <h3 className="mb-4" style={{ color: '#333333', fontWeight: '600', whiteSpace: 'nowrap' }}>
          <Typewriter
            words={['Find nearby pickup and delivery']}
            loop={1}
            cursor={false} // Disable blinking cursor
            typeSpeed={40} // Speed up typing speed
            deleteSpeed={30}
            delaySpeed={1000}
          />
        </h3>

        {/* Address Input Field */}
        <div className="input-group mb-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            ref={inputRef}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            className="form-control rounded-pill px-3"
            style={{
              border: '1px solid #ced4da',
              paddingRight: '2.5rem',
              backgroundColor: '#ffffff',
            }}
            disabled={!isOver18} // Disable input if checkbox is unchecked
          />
        </div>

        {/* Checkbox for Age Confirmation */}
        <div className="d-flex justify-content-center align-items-center mb-3 custom-checkbox">
  <input
    type="checkbox"
    className="form-check-input me-2"
    id="ageCheck"
    checked={isOver18}
    onChange={(e) => setIsOver18(e.target.checked)}
    style={{
      backgroundColor: isOver18 ? '#000' : '#fff',
      marginTop: '-.2px',
      borderColor: '#000',
      '&:focus': {
        borderColor: '#000',
        boxShadow: '0 0 0 0.25rem rgba(0, 0, 0, 0.25)'
      }
    }}
  />
  <label 
    className="form-check-label" 
    htmlFor="ageCheck" 
    style={{ 
      color: '#333333', 
      fontWeight: '500', 
      margin: '0' 
    }}
  >
    I am 18 or older
  </label>
</div>
      </div>
      <Footer />
    </div>
  );
};

export default AddressPage;
