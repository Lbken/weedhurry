const express = require('express');
const router = express.Router();
const { getMapVendors } = require('../controllers/mapVendorController');

// Route for getting all vendors for the map
router.get('/map-vendors', getMapVendors);

module.exports = router;