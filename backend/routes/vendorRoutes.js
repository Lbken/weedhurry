const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { handleLogoUpload } = require('../utils/fileUpload');
const { handlePromoUpload } = require('../utils/fileUpload');

const Vendor = require('../models/Vendor');


const {
    updateDispensaryInfo,
    getVendorById,
    getVendorProfile,
    updateVendorProfile,
    updateDeliveryZone,
    deactivateVendorAccount,
    updateBusinessHours,
    updateStoreNotice,
    updateMinOrder,
    uploadVendorLogo,
    getNearbyVendors,
    handleDailyPromo,
} = require('../controllers/vendorController');


const router = express.Router();

// Define specific routes before dynamic routes
router.put('/dispensary-info', authMiddleware, updateDispensaryInfo);
router.get('/profile', authMiddleware, getVendorProfile);
router.put('/profile', authMiddleware, updateVendorProfile);
router.get('/delivery-zone', authMiddleware, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendorId).select('deliveryZone');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ deliveryZone: vendor.deliveryZone });
    } catch (error) {
        console.error('Error fetching delivery zone:', error);
        res.status(500).json({ message: 'Error fetching delivery zone' });
    }
});

  
router.put('/delivery-zone', authMiddleware, updateDeliveryZone);
router.put('/business-hours', authMiddleware, updateBusinessHours);
router.put('/store-notice', authMiddleware, updateStoreNotice);
router.put('/min-order', authMiddleware, updateMinOrder);

router.post('/upload-logo', authMiddleware, handleLogoUpload, uploadVendorLogo);
router.put('/deactivate-account', authMiddleware, deactivateVendorAccount);

router.get('/nearby', getNearbyVendors);


router.post('/daily-promo', authMiddleware, handlePromoUpload, handleDailyPromo);
// Place dynamic vendorId route last
router.get('/:vendorId', getVendorById);


module.exports = router;

