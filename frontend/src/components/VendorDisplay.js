import React, { useState, useEffect, useRef } from 'react';
import VendorCard from './VendorCard';
import ProductCard from './ProductCard';
import api from '../api/api';

const VendorDisplay = ({ selectedVendorId, onVendorSelect }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create refs for selected vendor element
  const selectedVendorRef = useRef(null);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/map/map-vendors');
        
        if (!response.data.success) {
          setError('Failed to load vendor details. Please try again later.');
          return;
        }

        const transformedVendors = response.data.vendors
          .map(vendor => ({
            ...vendor,
            _id: vendor._id.toString(),
            businessHours: vendor.businessHours || {},
            acceptedPayments: vendor.acceptedPayments || [],
            minOrder: vendor.minOrder || 0,
            products: vendor.products || [],
            dailyPromo: vendor.dailyPromo || { applicableToSaleItems: false }
          }));

        setVendors(transformedVendors);
      } catch (err) {
        console.error('Error fetching vendor details:', err);
        setError(err.response?.data?.message || 'Failed to load vendor details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, []);

  // Effect to handle scrolling when selectedVendorId changes
  useEffect(() => {
    if (selectedVendorId && selectedVendorRef.current) {
      selectedVendorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedVendorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  // Sort vendors to put selected vendor at the top if exists
  const sortedVendors = [...vendors].sort((a, b) => {
    if (a._id === selectedVendorId) return -1;
    if (b._id === selectedVendorId) return 1;
    return 0;
  });

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Available Dispensaries ({vendors.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedVendors.map(vendor => (
          <div 
            key={vendor._id} 
            className="space-y-4"
            ref={vendor._id === selectedVendorId ? selectedVendorRef : null}
          >
            <VendorCard
              vendor={vendor}
              orderType={vendor.dispensaryType.toLowerCase()}
              isSelected={selectedVendorId === vendor._id}
              onClick={() => onVendorSelect(vendor._id)}
            />
            
            {selectedVendorId === vendor._id && vendor.products.length > 0 && (
              <div className="pl-4">
                <h3 className="text-xl font-semibold mb-3">Available Products</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vendor.products.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      vendorId={vendor._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDisplay;