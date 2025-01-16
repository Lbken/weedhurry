const express = require('express');
const { 
    registerVendor, 
    loginVendor, 
    logoutVendor, 
    resetPasswordRequest, 
    resetPassword 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/logout', logoutVendor);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPassword);

// Validate Vendor Authentication
router.get('/validate', authMiddleware, (req, res) => {
    try {
        res.status(200).json({ 
            success: true, 
            vendorId: req.vendorId 
        });
    } catch (error) {
        console.error('Error in /validate route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;