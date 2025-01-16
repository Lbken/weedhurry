import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, Tab, Col, Row, Accordion, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';

// Components
import RecentOrders from '../components/RecentOrders';
import InventoryComponent from '../components/InventoryComponent';
import UpdateDeliveryZoneComponent from '../components/UpdateDeliveryZoneComponent';
import BusinessHoursComponent from '../components/BusinessHoursComponent';
import MinOrderComponent from '../components/MinOrderComponent';
import DailyPromoForm from './DailyPromoForm';
import DashNavBar from '../components/DashNavBar';
import AddProductPage from '../components/AddProductPage';
import Footer from '../components/Footer';

// Utilities and Context
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

// Constants
const DEFAULT_HOURS = {
  monday: { open: '', close: '' },
  tuesday: { open: '', close: '' },
  wednesday: { open: '', close: '' },
  thursday: { open: '', close: '' },
  friday: { open: '', close: '' },
  saturday: { open: '', close: '' },
  sunday: { open: '', close: '' },
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 24; hour++) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    slots.push(`${displayHour}:00 ${period}`);
  }
  return slots;
};

const VendorDashboard = () => {
  // State
  const [vendorData, setVendorData] = useState(null);
  const [initialHours, setInitialHours] = useState(DEFAULT_HOURS);
  const [initialMinOrder, setInitialMinOrder] = useState(0);
  const [initialAcceptedPayments, setInitialAcceptedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Hooks
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Load Google Maps
  const { isLoaded: mapsLoaded, loadError: mapsError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Handle session expiration
  const handleExpiredToken = useCallback(() => {
    console.warn('Session expired. Redirecting to login...');
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Fetch vendor data
  const fetchVendorData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vendors/profile');
      const { data } = response.data;
      
      // Format business hours
      const formattedHours = Object.keys(DEFAULT_HOURS).reduce((acc, day) => {
        acc[day] = {
          open: data?.businessHours?.[day]?.open || '',
          close: data?.businessHours?.[day]?.close || ''
        };
        return acc;
      }, {});
      
      setInitialHours(formattedHours);
      setInitialMinOrder(data?.minOrder || 0);
      setInitialAcceptedPayments(data?.acceptedPayments || []);
      setVendorData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      if (error.response?.status === 401) {
        handleExpiredToken();
      } else {
        setError('Failed to fetch vendor data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [handleExpiredToken]);

  // Initial data fetch
  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  // Handle settings updates
  const handleUpdateSettings = async (formData) => {
    try {
      const response = await api.put('/api/vendors/min-order', {
        minOrder: formData.minOrder,
        acceptedPayments: formData.acceptedPayments
      });

      if (response.data.success) {
        setInitialMinOrder(formData.minOrder);
        setInitialAcceptedPayments(formData.acceptedPayments);
        return { success: true, message: 'Settings updated successfully!' };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update settings.'
      };
    }
  };

  // Handle business hours update
  const handleUpdateBusinessHours = async (updatedHours) => {
    try {
      const response = await api.put('/api/vendors/business-hours', {
        businessHours: updatedHours
      });

      if (response.data.success) {
        setInitialHours(updatedHours);
        return { success: true, message: 'Business hours updated successfully!' };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error updating business hours:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update business hours.'
      };
    }
  };

  // Loading states
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}
        <button 
          className="btn btn-link"
          onClick={fetchVendorData}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashNavBar vendorData={vendorData} />
      
      <div style={{ marginTop: '76px' }}> 
        <div className="container-fluid py-4">
          <Tabs 
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
            id="vendor-dashboard-tabs" 
            className="mb-3"
            style={{
              backgroundColor: '#F1F1F1',
              padding: '10px 10px 0 10px',
              borderRadius: '4px 4px 0 0'
            }}
          >
            <Tab eventKey="orders" title="Orders">
              <RecentOrders />
            </Tab>
            
            <Tab eventKey="inventory" title="Menu">
              <InventoryComponent />
            </Tab>
            
            <Tab eventKey="products" title="Add Products">
              <AddProductPage />
            </Tab>
            
            <Tab eventKey="profile" title="Settings">
              <div className="bg-white rounded-bottom shadow-sm p-4">
                <Accordion defaultActiveKey="0">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Delivery Zone</Accordion.Header>
                    <Accordion.Body>
                      <UpdateDeliveryZoneComponent 
                        isLoaded={mapsLoaded} 
                        loadError={mapsError}
                      />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Business Hours</Accordion.Header>
                    <Accordion.Body>
                      <BusinessHoursComponent
                        initialHours={initialHours}
                        onUpdate={handleUpdateBusinessHours}
                        availableTimes={generateTimeSlots()}
                      />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Daily Promotion</Accordion.Header>
                    <Accordion.Body>
                      <DailyPromoForm onSuccess={fetchVendorData} />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="3">
                    <Accordion.Header>Payment Settings</Accordion.Header>
                    <Accordion.Body>
                      <MinOrderComponent
                        minOrder={initialMinOrder}
                        acceptedPayments={initialAcceptedPayments}
                        onUpdate={handleUpdateSettings}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VendorDashboard;