import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import VendorCard from './VendorCard';

const VendorMapNew = ({ selectedVendorId, onVendorSelect }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 34.0522,
    lng: -118.2437
  });

  const mapStyles = {
    height: "70vh",
    width: "100%"
  };

  const defaultOptions = {
    panControl: true,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    clickableIcons: true,
    keyboardShortcuts: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    fullscreenControl: true,
  };

  // Inside the fetchVendors function in VendorMapNew.js
useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors/nearby');
        const data = await response.json();
        
        if (data.success && data.vendors) {
          const formattedVendors = data.vendors
            .filter(vendor => 
              vendor._id && 
              vendor.storefrontAddress?.coordinates?.length === 2
            )
            .map(vendor => ({
              ...vendor,
              // Handle potential MongoDB Extended JSON format
              _id: typeof vendor._id === 'object' ? 
                   vendor._id.$oid || vendor._id.toString() : 
                   vendor._id.toString(),
              coordinates: {
                lat: parseFloat(vendor.storefrontAddress.coordinates[1]),
                lng: parseFloat(vendor.storefrontAddress.coordinates[0])
              }
            }));

          setVendors(formattedVendors);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    fetchVendors();
}, []);

  useEffect(() => {
    if (selectedVendorId) {
      const vendor = vendors.find(v => v._id === selectedVendorId);
      setSelectedVendor(vendor);
      
      if (vendor?.coordinates) {
        setMapCenter(vendor.coordinates);
      }
    } else {
      setSelectedVendor(null);
    }
  }, [selectedVendorId, vendors]);

  const handleMarkerClick = (vendor) => {
    onVendorSelect(vendor._id.toString());
  };

  return (
    <div className="w-full">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Vendor Locations</h2>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={11}
            center={mapCenter}
            options={defaultOptions}
          >
            {vendors.map(vendor => (
              <Marker
                key={vendor._id}
                position={vendor.coordinates}
                onClick={() => handleMarkerClick(vendor)}
                icon={{
                  url: vendor.logoUrl || 'default-marker.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            ))}

            {selectedVendor && (
              <InfoWindow
                position={selectedVendor.coordinates}
                onCloseClick={() => onVendorSelect(null)}
              >
                <div className="p-4 bg-white rounded-lg max-w-md">
                  <VendorCard
                    vendor={selectedVendor}
                    orderType={selectedVendor.dispensaryType.toLowerCase()}
                    isSelected={true}
                    onClick={() => onVendorSelect(selectedVendor._id)}
                  />
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default VendorMapNew;