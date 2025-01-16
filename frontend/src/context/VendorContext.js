import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const VendorContext = createContext();
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.weedhurry.com';


export const VendorProvider = ({ vendorId, children }) => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorStatus, setVendorStatus] = useState(null);

  // Calculate vendor status based on business hours
  const calculateVendorStatus = useCallback((businessHours) => {
    if (!businessHours) return null;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });

    const todayHours = businessHours[currentDay];
    if (!todayHours?.open || !todayHours?.close) return null;

    const isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;

    if (isOpen) {
      return {
        status: 'open',
        until: todayHours.close, // Return full time string
        currentDay
      };
    }

    if (currentTime < todayHours.open) {
      return {
        status: 'closed',
        until: todayHours.open, // Return full time string
        currentDay
      };
    }

    let nextDay = currentDay;
    let daysChecked = 0;
    
    while (daysChecked < 7) {
      const currentIndex = days.indexOf(nextDay);
      nextDay = days[(currentIndex + 1) % 7];
      const nextDayHours = businessHours[nextDay];

      if (nextDayHours?.open) {
        return {
          status: 'closed',
          until: nextDayHours.open, // Return full time string
          currentDay: nextDay
        };
      }
      daysChecked++;
    }

    return null;
  }, []);

  // Update status every minute
  useEffect(() => {
    if (vendor?.businessHours) {
      const updateStatus = () => {
        const newStatus = calculateVendorStatus(vendor.businessHours);
        setVendorStatus(newStatus);
      };

      updateStatus();
      const intervalId = setInterval(updateStatus, 60000);
      return () => clearInterval(intervalId);
    }
  }, [vendor?.businessHours, calculateVendorStatus]);

  // Normalize product data from VendorProduct document
  const normalizeProduct = useCallback((vp) => {
    return {
      _id: vp._id,
      name: vp.name,
      brand: vp.brand,
      category: vp.category,
      strain: vp.strain || vp.variation?.strain || 'N/A',
      thcContent: vp.thcContent || vp.variation?.thcContent || null,
      price: vp.price || vp.variation?.price || 0,
      salePrice: vp.salePrice || vp.variation?.salePrice || null,
      image: vp.image || vp.variation?.image || "/placeholder-image.png",
      description: vp.description || '',
      amount: vp.amount || vp.variation?.amount || 'N/A',
      vendorId: vp.vendorId,
      status: vp.status || 'Active',
      tags: vp.tags || vp.variation?.tags || [],
    };
  }, []);

  // Fetch vendor and products data
  const fetchVendorAndProducts = useCallback(async (id) => {
  setLoading(true);
  setError(null);

  try {
    // Convert id to string if it's an ObjectId or object
    const vendorId = id?._id || id?.toString() || id;

    console.log('Fetching vendor data for ID:', vendorId);

    const [vendorResponse, productsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/api/vendors/${vendorId}`),
      axios.get(`${BASE_URL}/api/vendor/inventory/public/${vendorId}`)
    ]);

    const vendorData = vendorResponse.data.data;
    const productsData = productsResponse.data.data || [];
    
    // Ensure coordinates are properly formatted
    if (vendorData.storefrontAddress?.coordinates) {
      vendorData.storefrontAddress.coordinates = vendorData.storefrontAddress.coordinates.map(
        coord => typeof coord === 'object' ? parseFloat(coord.$numberDouble || coord.$numberInt) : parseFloat(coord)
      );
    }

    const formattedProducts = productsData.map(normalizeProduct);
    
    setVendor({
      ...vendorData,
      products: formattedProducts,
      _id: vendorId // Ensure _id is a string
    });

    setProducts(formattedProducts);

    const initialStatus = calculateVendorStatus(vendorData.businessHours);
    setVendorStatus(initialStatus);

  } catch (err) {
    console.error("Failed to fetch vendor data:", err);
    console.error("Error details:", {
      message: err.message,
      response: err.response?.data
    });
    setError("Failed to load vendor or products data.");
  } finally {
    setLoading(false);
  }
}, [normalizeProduct, calculateVendorStatus]);

  const updateMinOrder = async (formData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/vendors/min-order`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setVendor(prev => ({ 
          ...prev, 
          minOrder: formData.minOrder,
          acceptedPayments: formData.acceptedPayments 
        }));
        return { success: true, message: 'Settings updated successfully!' };
      }
      return { success: false, message: response.data.message || 'Failed to update settings.' };
    } catch (err) {
      console.error('Error updating settings:', err.message);
      return { success: false, message: 'An error occurred while updating settings.' };
    }
  };

  const updateBusinessHours = async (businessHours) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/vendors/business-hours`,
        { businessHours },
        { withCredentials: true }
      );

      if (response.data.success) {
        setVendor(prev => ({ ...prev, businessHours }));
        const newStatus = calculateVendorStatus(businessHours);
        setVendorStatus(newStatus);
        return { success: true, message: 'Business hours updated successfully!' };
      }
      return { success: false, message: response.data.message || 'Failed to update business hours.' };
    } catch (err) {
      console.error('Error updating business hours:', err.message);
      return { success: false, message: 'An error occurred while updating business hours.' };
    }
  };

  const refreshVendorData = async () => {
    if (vendorId) {
      await fetchVendorAndProducts(vendorId);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendorAndProducts(vendorId);
    }
  }, [vendorId, fetchVendorAndProducts]);

  return (
    <VendorContext.Provider
      value={{
        vendor,
        products,
        loading,
        error,
        vendorStatus,
        updateMinOrder,
        updateBusinessHours,
        refreshVendorData,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};