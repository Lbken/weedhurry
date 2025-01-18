import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryPickupWrapper from '../components/DeliveryPickupWrapper';
import api from '../api/api';
import './DeliveryPickupPage.css';

const DeliveryPickupPage = () => {
  const [vendors, setVendors] = useState([]);
  const [parsedAddress, setParsedAddress] = useState({ street: '', city: '', stateAbbreviation: '' });
  const [animate, setAnimate] = useState(false);

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
    return R * c;
  };

  const fetchVendors = useCallback(async () => {
    const address = localStorage.getItem('userAddress');
    if (!address) {
      console.log('No address found in localStorage');
      return;
    }

    try {
      // Get coordinates from Google Geocoding API
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.status !== 'OK') {
        console.error('Geocoding failed:', geocodeData.status);
        return;
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      console.log('User coordinates:', { lat, lng });

      // Fetch vendors using configured axios instance
      const { data: vendorsData } = await api.get('/api/map/map-vendors', {
        params: { lat, lng }
      });

      if (!vendorsData?.vendors || !Array.isArray(vendorsData.vendors)) {
        console.log('No vendors found or invalid response format');
        return;
      }

      const vendorsWithDistance = vendorsData.vendors.map((vendor) => {
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

        const [vLng, vLat] = coordinates.map(coord => 
          typeof coord === 'object' ? parseFloat(coord.$numberDouble || coord.$numberInt) : parseFloat(coord)
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
      }).filter(Boolean);

      console.log(`Found ${vendorsWithDistance.length} valid vendors`);
      setVendors(vendorsWithDistance);

    } catch (error) {
      console.error('Error fetching vendors:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }, []);

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