// NearbyPickupPage.js
import React, { useEffect, useState, useRef } from 'react';
import VendorCard from './VendorCard';
import PickupMap from './PickupMap';
import Footer from './Footer';
import './NearbyPickupPage.css';
import api from '../api/api';
import { enrichVendor } from '../utils/coordinateUtils';

const NearbyPickupPage = ({ searchQuery }) => {
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const vendorCardsRef = useRef(null);
  const lastScrollPosition = useRef(0);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      // Get user's location from localStorage
      const savedAddress = localStorage.getItem('userAddress');
      if (!savedAddress) throw new Error('No address found');

      // Geocode the address
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          savedAddress
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status !== 'OK') throw new Error('Could not fetch location');

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
      const enrichedVendors = vendorsData.vendors
        .filter(vendor => ['Pickup', 'Pickup & Delivery'].includes(vendor.dispensaryType))
        .map(vendor => enrichVendor(vendor, lat, lng))
        .filter(Boolean)
        .sort((a, b) => a.milesAway - b.milesAway);

      console.log('Processed vendors:', enrichedVendors);
      setVendors(enrichedVendors);
      setError(null);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(error.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (vendor) => {
    setVendors((prevVendors) => {
      const filteredVendors = prevVendors.filter((v) => v._id !== vendor._id);
      return [vendor, ...filteredVendors];
    });
  };

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

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleScroll = (e) => {
    const currentScroll = e.target.scrollTop;
    const scrollingDown = currentScroll > lastScrollPosition.current;
    const scrollingUp = currentScroll < lastScrollPosition.current;
    
    if (scrollingDown && !isExpanded && currentScroll > 10) {
      setIsExpanded(true);
    }
    
    if (scrollingUp && isExpanded && currentScroll === 0) {
      const scrollDelta = lastScrollPosition.current - currentScroll;
      if (scrollDelta > 5) {
        setIsExpanded(false);
      }
    }

    lastScrollPosition.current = currentScroll;
  };

  const handleDragHandleClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="container-fluid p-0 pickup-page-container">
      <div className={`map-container ${isExpanded ? 'expanded' : ''}`}>
        <PickupMap
          dispensaries={vendors}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      <div className={`vendor-card-container ${isExpanded ? 'expanded' : ''}`}>
        <div
          className="drag-handle"
          onClick={handleDragHandleClick}
        />
        {loading ? (
          <div className="text-center my-4">
            <p>Loading vendors...</p>
          </div>
        ) : error ? (
          <div className="text-center my-4">
            <p className="text-danger">{error}</p>
          </div>
        ) : filteredVendors.length > 0 ? (
          <div 
            className="vendor-cards-wrapper px-0"
            ref={vendorCardsRef}
            onScroll={handleScroll}
          >
            {filteredVendors.map((vendor) => (
              <VendorCard 
                key={vendor._id} 
                vendor={vendor} 
                orderType="Pickup" 
              />
            ))}
            <Footer />
          </div>
        ) : (
          <p className="text-center text-muted my-4">
            {searchQuery ? 'No products match your search query.' : 'No vendors found in your area.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default NearbyPickupPage;