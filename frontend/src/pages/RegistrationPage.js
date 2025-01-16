import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import VendorRegistration from "../components/VendorRegistration";
import Footer from "../components/Footer";

const RegistrationPage = () => {
  const { auth, logout } = useAuth();

  // If user is logged in, log them out
  useEffect(() => {
    if (auth) {
      logout();
    }
  }, [auth, logout]);

  return (
    <div style={{backgroundColor: '#fafafa'}}>
      {/* Upper Section */}
      <div className="d-flex justify-content-start m-4" style={{backgroundColor: '#fafafa'}}>
        <img
          src={require('../assets/images/addressPageLogo.png')}
          alt="WeedHurry Logo"
          style={{ height: '40px' }}
        />
      </div>

      {/* Main Content Section */}
      <div style={{ margin: 0, padding: 0, backgroundColor: '#fafafa', minHeight: '100vh' }}>
        <VendorRegistration />
      </div>
      <Footer />
    </div>
  );
};

export default RegistrationPage;