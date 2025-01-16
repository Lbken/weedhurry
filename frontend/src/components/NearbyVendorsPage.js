// NearbyVendorsPage.js
import React, { useEffect, useState } from 'react';
import VendorCard from './VendorCard';
import Footer from './Footer';
import api from '../api/api';
import { enrichVendor } from '../utils/coordinateUtils';

const NearbyVendorsPage = ({ searchQuery }) => {
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedAddress, setParsedAddress] = useState({
    street: '',
    city: '',
    stateAbbreviation: ''
  });

  // Process saved address when component mounts
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

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const savedAddress = localStorage.getItem('userAddress');
      if (!savedAddress) {
        throw new Error('No address found');
      }

      // Get coordinates using geocoding
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          savedAddress
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.status !== 'OK') {
        throw new Error('Could not find location');
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      console.log('User location:', { lat, lng });

      // Fetch nearby vendors
      const { data: vendorsData } = await api.get('/api/map/map-vendors', {
        params: { lat, lng }
      });

      if (!vendorsData?.vendors || !Array.isArray(vendorsData.vendors)) {
        throw new Error('No vendors found near your location');
      }

      // Process vendors with the utility function
      const processedVendors = vendorsData.vendors
        .filter(vendor => ['Delivery', 'Pickup & Delivery'].includes(vendor.dispensaryType))
        .map(vendor => enrichVendor(vendor, lat, lng))
        .filter(Boolean)
        .sort((a, b) => a.milesAway - b.milesAway);

      console.log('Processed vendors:', processedVendors);
      setVendors(processedVendors);
      setError(null);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load of vendors
  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors based on search query
  const filteredVendors = vendors.map((vendor) => {
    const filteredProducts = vendor.products?.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      return (
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.strain?.toLowerCase().includes(query)
      );
    }) || [];

    return { ...vendor, products: filteredProducts };
  });

  return (
    <div className="container-fluid p-0">
      <div className="vendor-list">
        {loading ? (
          <p className="text-center my-4">Loading vendors...</p>
        ) : error ? (
          <p className="text-danger text-center my-4">{error}</p>
        ) : filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div key={vendor._id} className="vendors-page vendor-card-wrapper">
              <VendorCard 
                vendor={vendor}
                orderType="Delivery"
              />
            </div>
          ))
        ) : (
          <p className="text-center text-muted my-4">
            {searchQuery ? 'No vendors match your search.' : 'No vendors found in your area.'}
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NearbyVendorsPage;