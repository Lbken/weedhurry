import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import VendorCard from './VendorCard';
import api from '../utils/api';

const VendorMap = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 34.0522,
    lng: -118.2437
  });
  const [userLocation, setUserLocation] = useState(null);

  const mapStyles = {
    height: "100vh",
    width: "100%"
  };

  useEffect(() => {
    // Create an abort controller for cleanup
    const abortController = new AbortController();

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setMapCenter(userLoc);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Fetch vendors and their products
    const fetchVendorsAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vendors
        const vendorResponse = await api.get('/vendors/nearby', {
          signal: abortController.signal
        });
        const vendorData = vendorResponse.data;
        
        if (vendorData.success && vendorData.vendors) {
          // Transform vendor data and fetch products for each vendor
          const vendorsWithProducts = await Promise.all(
            vendorData.vendors.map(async (vendor) => {
              try {
                // Normalize vendor ID
                const vendorId = vendor._id.$oid || vendor._id;
                
                // Fetch products for this vendor
                const productsResponse = await api.get(
                  `/vendor/inventory/public/${vendorId}`,
                  { signal: abortController.signal }
                );
                const productsData = productsResponse.data;

                // Process coordinates
                const coordinates = vendor.storefrontAddress?.coordinates?.map(coord => 
                  typeof coord === 'object' ? Number(coord.$numberDouble || coord.$numberInt) : Number(coord)
                );

                return {
                  ...vendor,
                  _id: vendorId,
                  products: productsData.success ? productsData.data : [],
                  coordinates: coordinates ? {
                    lat: coordinates[1],
                    lng: coordinates[0]
                  } : null
                };
              } catch (error) {
                if (error.name === 'AbortError') {
                  throw error;
                }
                console.error(`Error fetching products for vendor ${vendor._id}:`, error);
                return {
                  ...vendor,
                  _id: vendor._id.$oid || vendor._id,
                  products: [],
                  coordinates: vendor.storefrontAddress?.coordinates ? {
                    lat: Number(vendor.storefrontAddress.coordinates[1]),
                    lng: Number(vendor.storefrontAddress.coordinates[0])
                  } : null
                };
              }
            })
          );

          setVendors(vendorsWithProducts.filter(vendor => vendor.coordinates));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching vendors:', error);
          setError('Failed to load vendors. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorsAndProducts();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Map Section */}
      <div className="w-1/2 h-full relative">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={12}
            center={mapCenter}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='7' fill='%234285F4' stroke='white' stroke-width='2'/%3E%3C/svg%3E",
                  scaledSize: { width: 24, height: 24 }
                }}
              />
            )}

            {vendors.map(vendor => (
              vendor.coordinates && (
                <Marker
                  key={vendor._id}
                  position={vendor.coordinates}
                  onClick={() => setSelectedVendor(vendor)}
                  icon={{
                    url: vendor.logoUrl,
                    scaledSize: { width: 40, height: 40 }
                  }}
                />
              )
            ))}

            {selectedVendor && (
              <InfoWindow
                position={selectedVendor.coordinates}
                onCloseClick={() => setSelectedVendor(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold text-lg">{selectedVendor.dispensaryName}</h3>
                  <p className="text-sm text-gray-600">{selectedVendor.storefrontAddress.formatted}</p>
                  <p className="text-sm">{selectedVendor.dispensaryType}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Vendor Cards Section */}
      <div className="w-1/2 h-full overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-2xl font-semibold mb-4">Nearby Dispensaries</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : vendors.length === 0 ? (
          <div className="text-gray-500 p-4 text-center">No dispensaries found in your area</div>
        ) : (
          <div className="space-y-4">
            {vendors.map(vendor => (
              <VendorCard
                key={vendor._id}
                vendor={{
                  ...vendor,
                  businessHours: vendor.businessHours || {},
                  milesAway: "Calculate distance here" // You might want to add distance calculation
                }}
                orderType={vendor.dispensaryType.toLowerCase()}
                isSelected={selectedVendor?._id === vendor._id}
                onClick={() => {
                  setSelectedVendor(vendor);
                  setMapCenter(vendor.coordinates);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMap;