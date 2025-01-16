import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryPickupWrapper from '../components/DeliveryPickupWrapper';
import './DeliveryPickupPage.css';

const DeliveryPickupPage = () => {
  const [vendors, setVendors] = useState([]);
  const [parsedAddress, setParsedAddress] = useState({ street: '', city: '', stateAbbreviation: '' });
  const [animate, setAnimate] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.weedhurry.com';

  useEffect(() => {
    // Trigger slide-in animation on mount
    setAnimate(true);

    // Parse the saved address from localStorage
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

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 3958.8; // Radius of Earth in miles
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  };

  const fetchVendors = useCallback(async () => {
    const address = localStorage.getItem('userAddress');
    if (!address) return;

    try {
      // Fetch coordinates of user's saved address
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status !== 'OK') return;

      const { lat, lng } = geocodeData.results[0].geometry.location;

      // Fetch vendors nearby
      const vendorsResponse = await fetch(`${BASE_URL}/api/vendors/nearby?lat=${lat}&lng=${lng}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const vendorsData = await vendorsResponse.json();

      if (!vendorsData.vendors || vendorsData.vendors.length === 0) return;

      // Calculate distance for each vendor
      // In DeliveryPickupPage.js, update this section:
const vendorsWithDistance = vendorsData.vendors.map((vendor) => {
  // First get the appropriate coordinates
  let coordinates = null;
  if (vendor.deliveryZone?.coordinates) {
    coordinates = vendor.deliveryZone.coordinates;
  } else if (vendor.storefrontAddress?.coordinates) {
    coordinates = vendor.storefrontAddress.coordinates;
  }

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.warn(`Vendor ${vendor.dispensaryName} has invalid coordinates`);
    return null;
  }

  // Handle potential MongoDB $numberDouble format
  const [vLng, vLat] = coordinates.map(coord => 
    typeof coord === 'object' ? parseFloat(coord.$numberDouble) : parseFloat(coord)
  );

  if (isNaN(vLat) || isNaN(vLng)) {
    console.warn(`Invalid coordinate values for vendor ${vendor.dispensaryName}`);
    return null;
  }

  const milesAway = calculateDistance(lat, lng, vLat, vLng);
  return { 
    ...vendor, 
    coordinates: [vLng, vLat],
    milesAway: milesAway.toFixed(1) 
  };
}).filter(Boolean); // Remove any null entries

setVendors(vendorsWithDistance);

      setVendors(vendorsWithDistance);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  if (!parsedAddress.street && !parsedAddress.city && !parsedAddress.stateAbbreviation) {
    return <p className='mt-4'>No address set. Please go back and <a href="/">enter your address</a>.</p>;
  }

  return (
    <div
      className={`delivery-pickup-page ${animate ? 'slide-in' : ''}`}
      style={{
        minHeight: '100vh',
        overflowX: 'visible',
        backgroundColor: '#F8F9FA',
      }}
    >
      <DeliveryPickupWrapper 
        vendors={vendors}
        onNavigate={navigate}
      />
    </div>
  );
};

export default DeliveryPickupPage;