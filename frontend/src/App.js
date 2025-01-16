import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute"; // Import existing ProtectedRoute
import CustomNavbar from "./components/CustomNavbar";
import Cart from "./components/Cart";
import AddressPage from "./pages/AddressPage";
import DeliveryPickupPage from "./pages/DeliveryPickupPage";
import CheckoutPage from "./pages/CheckoutPage";
import Login from "./components/Login";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import VendorMenuPage from "./pages/VendorMenuPage";
import TestDashboard from "./pages/TestDashboard";
import RegistrationPage from "./pages/RegistrationPage";
import ResetPasswordRequest from './components/ResetPasswordRequest';
import ResetPassword from './components/ResetPassword';
import ContactPage from "./pages/ContactPage";
import AddStrainForm from "./pages/AddStrainForm";
import './styles.css';
import VendorDisplay from "./components/VendorDisplay";
import VendorMapNew from "./components/VendorMapNew";
import CombinedVendorView from "./components/CombinedVendorView";


function AppWrapper() {
    const location = useLocation();
    const hideNavbarRoutes = ["/register", "/checkout", "/", "/vendor-dashboard", "/nearby"];
    const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            {shouldShowNavbar && <CustomNavbar />}
            <Cart />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<AddressPage />} />
                <Route path="/nearby" element={<DeliveryPickupPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/test" element={<CombinedVendorView />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/add-strain" element={<AddStrainForm />} />
                <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/vendor/:vendorId/menu" element={<VendorMenuPage />} />

                {/* Protected Routes */}
                <Route
                    path="/vendor-dashboard"
                    element={
                        <ProtectedRoute>
                            <TestDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppWrapper />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;