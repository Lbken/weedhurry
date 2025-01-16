import React, { useEffect, useState } from 'react';
import VendorCard from './VendorCard';
import Footer from './Footer';
import api from '../api/api';
import { geocodeAddress } from '../utils/googleMapsLoader';
import { processVendorCoordinates } from '../utils/coordinateUtils';

const NearbyVendorsPage = ({ searchQuery }) => {
  const [vendors, setVendors] = useState([]);
  const [parsedAddress, setParsedAddress] = useState({ 
    street: '', 
    city: '', 
    stateAbbreviation: '' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 3963; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  // Fetch and process vendors
  const fetchVendors = async () => {
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
      const { data: vendorsData } = await api.get('/api/vendors/nearby', {
        params: { lat, lng }
      });

      if (!vendorsData?.vendors || !Array.isArray(vendorsData.vendors)) {
        throw new Error('No vendors found near your location');
      }

      console.log('Total vendors found:', vendorsData.vendors.length);

      // Process vendors and their coordinates
      const processedVendors = vendorsData.vendors
        .filter(vendor => ['Delivery', 'Pickup & Delivery'].includes(vendor.dispensaryType))
        .map(vendor => {
          // Extract and validate coordinates
          let coordinates = null;
          
          // For Pickup & Delivery vendors, try storefront first
          if (vendor.dispensaryType === 'Pickup & Delivery' && vendor.storefrontAddress?.coordinates) {
            coordinates = processVendorCoordinates(vendor);
          }
          
          // If no valid coordinates yet, try delivery zone
          if (!coordinates && vendor.deliveryZone?.coordinates) {
            coordinates = vendor.deliveryZone.coordinates.map(coord => {
              if (coord && typeof coord === 'object' && coord.$numberDouble !== undefined) {
                return parseFloat(coord.$numberDouble);
              }
              return parseFloat(coord);
            });
          }

          if (!coordinates || coordinates.length !== 2) {
            console.warn(`Invalid coordinates for vendor ${vendor.dispensaryName}`);
            return null;
          }

          const [vLng, vLat] = coordinates;

          // Calculate distance from user location
          const milesAway = parseFloat(calculateDistance(
            lat,
            lng,
            vLat,
            vLng
          ).toFixed(1));

          return {
            ...vendor,
            coordinates,
            milesAway
          };
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => a.milesAway - b.milesAway); // Sort by distance

      console.log('Processed vendors:', processedVendors.length);
      setVendors(processedVendors);

    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.message || 'Failed to load vendors');
    }
  };

  // Initial load of vendors
  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);
      try {
        await fetchVendors();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
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

  // Render component
  return (
    <div className="container-fluid p-0">
      <div className="vendor-list">
        {loading ? (
          <p>Loading vendors...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : filteredVendors.length ? (
          filteredVendors.map((vendor) => (
            <div key={vendor._id} className="vendors-page vendor-card-wrapper">
              <VendorCard vendor={vendor} />
            </div>
          ))
        ) : searchQuery ? (
          <p className="text-center text-muted my-4">No vendors match your search.</p>
        ) : (
          <p className="text-center text-muted my-4">No vendors found in your area.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NearbyVendorsPage;