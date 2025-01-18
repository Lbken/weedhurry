const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const mongoose = require('mongoose');

// Update the vendor registration part in authController.js
const registerVendor = async (req, res) => {
    const { email, password, storefrontAddress, contactNumber, dispensaryType, ...otherDetails } = req.body;

    try {
        // ... (previous validation code remains the same)

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Prepare vendor data
        const vendorData = {
            ...otherDetails,
            email,
            password: hashedPassword,
            status: 'active',
            contactNumber,
            dispensaryType,
            deliveryZone: null
        };

        // Handle coordinates for Pickup types
        if (['Pickup', 'Pickup & Delivery'].includes(dispensaryType)) {
            if (!storefrontAddress?.coordinates || !storefrontAddress.formatted) {
                return res.status(400).json({
                    success: false,
                    message: 'Storefront address with coordinates is required for Pickup vendors.'
                });
            }

            // Force coordinates to be plain numbers using parseFloat
            const lng = parseFloat(parseFloat(storefrontAddress.coordinates[0]).toFixed(7));
            const lat = parseFloat(parseFloat(storefrontAddress.coordinates[1]).toFixed(7));

            // Create storefrontAddress with plain number coordinates
            vendorData.storefrontAddress = {
                type: 'Point',
                coordinates: [lng, lat],
                formatted: storefrontAddress.formatted
            };
        }

        // Create vendor document
        const vendor = new Vendor(vendorData);
        
        // Force coordinates to be numbers one more time before saving
        if (vendor.storefrontAddress && Array.isArray(vendor.storefrontAddress.coordinates)) {
            vendor.storefrontAddress.coordinates = [
                parseFloat(vendor.storefrontAddress.coordinates[0]),
                parseFloat(vendor.storefrontAddress.coordinates[1])
            ];
        }

        // Save using lean() to get plain JavaScript objects
        await vendor.save();

        res.status(201).json({
            success: true,
            message: 'Vendor registered successfully. Please log in.',
        });
    } catch (error) {
        console.error('Error registering vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message,
        });
    }
};
const loginVendor = async (req, res) => {
    try {
        console.log('==== Login Request Started ====');
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Check if credentials are provided
        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find vendor
        console.log('Searching for vendor with email:', email);
        const vendor = await Vendor.findOne({ email });
        
        if (!vendor) {
            console.log('No vendor found with email:', email);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Password comparison
        const isMatch = await bcrypt.compare(password, vendor.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Token generation
        const accessToken = jwt.sign(
            { id: vendor._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const refreshToken = jwt.sign(
            { id: vendor._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.weedhurry.com',
            maxAge: 604800000 
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.weedhurry.com',
            maxAge: 604800000 // 7 days
        });

        console.log('Login successful for vendor ID:', vendor._id);
        return res.status(200).json({
            success: true,
            vendorId: vendor._id,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('==== Login Error Details ====');
        console.error('Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({
            success: false,
            message: 'Server error during login',
            details: error.message
        });
    }
};

const logoutVendor = async (req, res) => {
    try {
        res.clearCookie('token'); // Clear the token cookie
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout error', error: error.message });
    }
};

const resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        vendor.resetPasswordToken = resetToken;
        vendor.resetPasswordExpires = Date.now() + 604800000; // Token valid for 1 hour
        await vendor.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail(email, 'Password Reset Request', `Reset your password here: ${resetLink}`);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Reset password request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const vendor = await Vendor.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!vendor) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        vendor.password = await bcrypt.hash(newPassword, 10);
        vendor.resetPasswordToken = undefined;
        vendor.resetPasswordExpires = undefined;
        await vendor.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const vendor = await Vendor.findById(decoded.id);
        
        if (!vendor) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const accessToken = jwt.sign(
            { id: vendor._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 604800000,
            domain: '.weedhurry.com'
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};

module.exports = { registerVendor, loginVendor, logoutVendor, resetPasswordRequest, resetPassword, refreshToken };