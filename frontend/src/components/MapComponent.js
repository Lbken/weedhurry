import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
const libraries = ['places'];
const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
  // Improve map performance
  gestureHandling: 'cooperative',
  disableDoubleClickZoom: true,
  // Custom style for better visibility
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

function MapComponent({ onLocationChange, initialLocation }) {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [location, setLocation] = useState(initialLocation || null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Handle initial location updates
  useEffect(() => {
    if (initialLocation && map && isMapLoaded) {
      setLocation(initialLocation);
      map.panTo(initialLocation);
    }
  }, [initialLocation, map, isMapLoaded]);

  // Map load handler
  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setIsMapLoaded(true);
  }, []);

  // Map unmount handler
  const handleMapUnmount = useCallback(() => {
    setMap(null);
    setIsMapLoaded(false);
  }, []);

  // Marker load handler
  const handleMarkerLoad = useCallback((markerInstance) => {
    setMarker(markerInstance);
  }, []);

  // Map click handler
  const handleMapClick = useCallback((event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    
    setLocation(newLocation);
    
    if (marker) {
      marker.setPosition(newLocation);
    }
    
    if (map) {
      map.panTo(newLocation);
    }
    
    onLocationChange(newLocation);
  }, [marker, map, onLocationChange]);

  // Marker drag end handler
  const handleMarkerDragEnd = useCallback((event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    
    setLocation(newLocation);
    
    if (map) {
      map.panTo(newLocation);
    }
    
    onLocationChange(newLocation);
  }, [map, onLocationChange]);

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location || defaultCenter}
        zoom={12}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        options={mapOptions}
        libraries={libraries}
      >
        {location && (
          <Marker
            position={location}
            draggable={true}
            onLoad={handleMarkerLoad}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
}

export default React.memo(MapComponent);