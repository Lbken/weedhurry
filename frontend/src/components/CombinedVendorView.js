import React, { useState } from 'react';
import VendorDisplay from './VendorDisplay';
import VendorMapNew from './VendorMapNew';

const CombinedVendorView = () => {
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // Handler for when a vendor is selected either from map or list
  const handleVendorSelect = (vendorId) => {
    setSelectedVendorId(vendorId === selectedVendorId ? null : vendorId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Vendor Directory</h1>
      
      {/* Map Section */}
      <div className="mb-8">
        <VendorMapNew 
          selectedVendorId={selectedVendorId}
          onVendorSelect={handleVendorSelect}
        />
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>
      
      {/* Vendor List Section */}
      <div>
        <VendorDisplay 
          selectedVendorId={selectedVendorId}
          onVendorSelect={handleVendorSelect}
        />
      </div>
    </div>
  );
};

export default CombinedVendorView;