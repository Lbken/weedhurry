import React, { useEffect, useRef, useCallback } from 'react';

const PickupMap = ({ dispensaries, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);

  // Function to load Google Maps script dynamically
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        // Google Maps already loaded
        resolve();
      } else {
        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
        } else {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.id = 'google-maps-script';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        }
      }
    });
  };

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 34.0522, lng: -118.2437 }, // Default center (Los Angeles)
        zoom: 12,
      });
      console.log('Map initialized.');
    }
  };

  // Add markers to the map
const addMarkers = useCallback(() => {
  if (!mapInstance.current || !dispensaries?.length) {
    console.warn('No dispensaries or map instance available to add markers.');
    return;
  }

  // Clear previous markers
  markers.current.forEach((marker) => marker.setMap(null));
  markers.current = [];

  // Create bounds object to fit all markers
  const bounds = new window.google.maps.LatLngBounds();

  dispensaries.forEach((dispensary) => {
    if (!dispensary.coordinates || dispensary.coordinates.length !== 2) {
      console.warn(`Invalid coordinates for ${dispensary.dispensaryName}`);
      return;
    }

    const [lng, lat] = dispensary.coordinates;
    const position = { lat, lng };

    const marker = new window.google.maps.Marker({
      position,
      map: mapInstance.current,
      title: dispensary.dispensaryName
    });

    bounds.extend(position);
    marker.addListener('click', () => onMarkerClick?.(dispensary));
    markers.current.push(marker);
  });

  // Fit map to show all markers
  if (markers.current.length > 0) {
    mapInstance.current.fitBounds(bounds);
  }
}, [dispensaries, onMarkerClick]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        console.log('Google Maps script loaded successfully.');
        initializeMap();
        addMarkers();
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }, [addMarkers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default PickupMap;