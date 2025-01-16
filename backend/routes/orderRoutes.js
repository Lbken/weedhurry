const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/orders/vendor/:vendorId', authMiddleware, orderController.getVendorOrders);

router.put('/orders/:orderId/status', authMiddleware, orderController.updateOrderStatus);

router.post('/orders/:orderId/notify', authMiddleware, orderController.sendVendorNotification);

module.exports = router;
