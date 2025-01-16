import React, { useEffect, useState, useRef } from 'react';
import VendorCard from './VendorCard';
import PickupMap from './PickupMap';
import Footer from './Footer';
import './NearbyPickupPage.css';
import api from '../api/api';

const NearbyPickupPage = ({ searchQuery }) => {
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const vendorCardsRef = useRef(null);
  const lastScrollPosition = useRef(0);

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
  
  // In NearbyPickupPage.js, update the fetchVendors function:

const fetchVendors = async () => {
  try {
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        localStorage.getItem('userAddress')
      )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.status !== 'OK') throw new Error('Could not fetch location.');

    const { lat, lng } = geocodeData.results[0].geometry.location;
    console.log('Making API request with coordinates:', { lat, lng });

    const { data: vendorsData } = await api.get('/api/vendors/nearby', {
      params: { lat, lng }
    });

    console.log('Raw vendors response:', vendorsData);

    if (!vendorsData?.vendors || !vendorsData.vendors.length) {
      throw new Error('No vendors found near your location.');
    }

    // Add debug logging for coordinate data
    vendorsData.vendors.forEach(vendor => {
      console.log('Vendor coordinate data:', {
        name: vendor.dispensaryName,
        type: vendor.dispensaryType,
        storefrontCoords: vendor.storefrontAddress?.coordinates,
        deliveryCoords: vendor.deliveryZone?.coordinates
      });
    });

    // Filter for Pickup and Pickup & Delivery vendors
    const pickupVendors = vendorsData.vendors.filter(
      vendor => ['Pickup', 'Pickup & Delivery'].includes(vendor.dispensaryType)
    );

    const enrichedVendors = pickupVendors.map((vendor) => {
      console.log('Raw vendor data:', {
        name: vendor.dispensaryName,
        storefrontAddress: vendor.storefrontAddress,
        deliveryZone: vendor.deliveryZone
      });
    
      let coordinates = null;
      let source = null;
    
      if (vendor.storefrontAddress?.coordinates) {
        coordinates = vendor.storefrontAddress.coordinates;
        source = 'storefront';
      } else if (vendor.dispensaryType === 'Pickup & Delivery' && vendor.deliveryZone?.coordinates) {
        coordinates = vendor.deliveryZone.coordinates;
        source = 'delivery';
      }
    
      console.log('Selected coordinates:', {
        name: vendor.dispensaryName,
        coordinates,
        source
      });
    
      const extractCoordinate = (coord) => {
        if (typeof coord === 'object') {
          if (coord.$numberDouble !== undefined) {
            return parseFloat(coord.$numberDouble);
          }
          return null;
        }
        return parseFloat(coord);
      };
    
      if (!coordinates || !Array.isArray(coordinates)) {
        console.warn(`${vendor.dispensaryName} coordinates not in array format:`, coordinates);
        return null;
      }
    
      const vLng = extractCoordinate(coordinates[0]);
      const vLat = extractCoordinate(coordinates[1]);
    
      if (vLng === null || vLat === null || isNaN(vLng) || isNaN(vLat)) {
        console.warn(`${vendor.dispensaryName} invalid coordinate values:`, { vLng, vLat });
        return null;
      }
    
      console.log('Processed coordinates:', {
        name: vendor.dispensaryName,
        lng: vLng,
        lat: vLat
      });
    
      return {
        ...vendor,
        coordinates: [vLng, vLat],
        coordinateSource: source,
        milesAway: parseFloat(calculateDistance(lat, lng, vLat, vLng).toFixed(1))
      };
    }).filter(Boolean);

    

    console.log('Processed vendors:', enrichedVendors);
    setVendors(enrichedVendors);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    setError(error.message || 'Failed to load vendors.');
  }
};
  

  const handleMarkerClick = (vendor) => {
    setVendors((prevVendors) => {
      const filteredVendors = prevVendors.filter((v) => v._id !== vendor._id);
      return [vendor, ...filteredVendors]; // Bring clicked vendor to the top
    });
  };

  const filteredVendors = vendors
    .filter((vendor) =>
      // Show both Pickup and Pickup & Delivery vendors
      vendor.dispensaryType === 'Pickup' || vendor.dispensaryType === 'Pickup & Delivery'
    )
    .map((vendor) => {
      const filteredProducts = vendor.products?.filter((product) => {
        const matchesProductName = product.name?.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchesBrand = product.brand?.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchesStrain = product.strain?.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchesProductName || matchesBrand || matchesStrain;
      });

      // Include all vendors but limit products to matches
      return { ...vendor, products: filteredProducts || [] };
    });

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleScroll = (e) => {
    const currentScroll = e.target.scrollTop;
    const scrollingDown = currentScroll > lastScrollPosition.current;
    const scrollingUp = currentScroll < lastScrollPosition.current;
    
    // Expand when scrolling down
    if (scrollingDown && !isExpanded && currentScroll > 10) {
      setIsExpanded(true);
    }
    
    // Collapse when trying to scroll up at the top
    if (scrollingUp && isExpanded && currentScroll === 0) {
      // Only collapse if we're still trying to scroll up when already at the top
      const scrollDelta = lastScrollPosition.current - currentScroll;
      if (scrollDelta > 5) { // Small threshold to prevent accidental collapse
        setIsExpanded(false);
      }
    }

    lastScrollPosition.current = currentScroll;
  };

  const handleDragHandleClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling
    setIsExpanded(!isExpanded); // Toggle expansion state
  };

  return (
    <div className="container-fluid p-0 pickup-page-container">
      <div className={`map-container ${isExpanded ? 'expanded' : ''}`}>
        <PickupMap
          dispensaries={vendors.map((vendor) => ({
            ...vendor,
            location: vendor.coordinates,
          }))}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      <div className={`vendor-card-container ${isExpanded ? 'expanded' : ''}`}>
        <div
          className="drag-handle"
          onClick={handleDragHandleClick}
        />
        {filteredVendors.length > 0 ? (
          <div 
            className="vendor-cards-wrapper px-0"
            ref={vendorCardsRef}
            onScroll={handleScroll}
          >
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor._id} vendor={vendor} orderType="Pickup" />
            ))}
            <Footer />
          </div>
          
        ) : (
          <p className="text-center text-muted my-4">No products match your search query.</p>
        )}
      </div>
      
    </div>
  );
};

export default NearbyPickupPage;