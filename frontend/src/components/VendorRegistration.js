import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import './VendorRegistration.css';

const libraries = ['places'];

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dispensaryName: '',
    dispensaryType: '',
    contactNumber: {
      formatted: '',
      e164: ''
    },
    license: '',
  });

  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 }); // Los Angeles default

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById('address-input'),
        { types: ['address'], componentRestrictions: { country: 'us' } }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Ensure coordinates are numbers and in the correct format
          const validLng = parseFloat(lng.toFixed(7));
          const validLat = parseFloat(lat.toFixed(7));
          
          setCoordinates([validLng, validLat]); // MongoDB uses [longitude, latitude] format
          setMapCenter({ lat: validLat, lng: validLng });
          setAddress(place.formatted_address);
          
          console.log('Set coordinates:', [validLng, validLat]);
          console.log('Set formatted address:', place.formatted_address);
        }
      });
    }
  }, [isLoaded]);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    const e164 = '+1' + e.target.value.replace(/[^\d]/g, '');
    
    setFormData(prev => ({
      ...prev,
      contactNumber: {
        formatted: formattedNumber,
        e164: e164
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (['Pickup', 'Pickup & Delivery'].includes(formData.dispensaryType)) {
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        setError('Valid address with coordinates is required for Pickup services');
        setLoading(false);
        return;
      }
      
      if (!address) {
        setError('Formatted address is required for Pickup services');
        setLoading(false);
        return;
      }
    }
    
    // Validate coordinates format
    if (coordinates && (!Array.isArray(coordinates) || coordinates.length !== 2 || 
        typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number')) {
      setError('Invalid coordinate format');
      setLoading(false);
      return;
    }

    try {
      // Format registration data
      const registrationData = {
        ...formData,
        // Only include storefrontAddress for Pickup types
        storefrontAddress: ['Pickup', 'Pickup & Delivery'].includes(formData.dispensaryType) 
          ? {
              type: 'Point',
              coordinates: coordinates,
              formatted: address
            }
          : null,
        // Only include deliveryZone for Delivery types
        deliveryZone: ['Delivery', 'Pickup & Delivery'].includes(formData.dispensaryType)
          ? {
              type: 'Point',
              coordinates: coordinates
            }
          : null
      };

      // Log the data being sent
      console.log('Sending registration data:', JSON.stringify(registrationData, null, 2));

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
        credentials: 'include'
      });

      const data = await response.json();

      console.log('Server response:', data);

      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div className="text-center mt-4">Error loading maps</div>;
  if (!isLoaded) return <div className="text-center mt-4">Loading maps...</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Vendor Registration</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Dispensary Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.dispensaryName}
                    onChange={(e) => setFormData({...formData, dispensaryName: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    value={formData.contactNumber.formatted}
                    onChange={handlePhoneChange}
                    placeholder="(555) 555-5555"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">License Number (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.license}
                    onChange={(e) => setFormData({...formData, license: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Dispensary Type</label>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="dispensaryType"
                      id="delivery"
                      value="Delivery"
                      checked={formData.dispensaryType === "Delivery"}
                      onChange={(e) => setFormData({...formData, dispensaryType: e.target.value})}
                    />
                    <label className="form-check-label" htmlFor="delivery">
                      Delivery Only
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="dispensaryType"
                      id="pickup"
                      value="Pickup"
                      checked={formData.dispensaryType === "Pickup"}
                      onChange={(e) => setFormData({...formData, dispensaryType: e.target.value})}
                    />
                    <label className="form-check-label" htmlFor="pickup">
                      Pickup Only
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="dispensaryType"
                      id="both"
                      value="Pickup & Delivery"
                      checked={formData.dispensaryType === "Pickup & Delivery"}
                      onChange={(e) => setFormData({...formData, dispensaryType: e.target.value})}
                    />
                    <label className="form-check-label" htmlFor="both">
                      Pickup & Delivery
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    id="address-input"
                    className="form-control"
                    placeholder="Enter your address"
                    required={['Pickup', 'Pickup & Delivery'].includes(formData.dispensaryType)}
                  />
                </div>

                {coordinates && (
                  <div className="mb-3" style={{ height: '300px', width: '100%' }}>
                    <GoogleMap
                      zoom={15}
                      center={mapCenter}
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                    >
                      <Marker position={mapCenter} />
                    </GoogleMap>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;