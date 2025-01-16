const express = require('express');
const { addProductToInventory, getVendorInventory, updateVendorProduct, changeProductStatus, deleteVendorProduct, getPublicVendorProducts } = require('../controllers/vendorProductController');
const { handleProductImageUpload } = require('../utils/fileUpload');
const authMiddleware = require('../middleware/authMiddleware'); // To protect routes

const router = express.Router();

router.post('/upload-product-image', 
  authMiddleware, 
  handleProductImageUpload,
  async (req, res) => {
    try {
      if (!req.imageUrl) {
        return res.status(400).json({ error: 'No image URL generated' });
      }
      res.json({ 
        imageUrl: req.imageUrl,
        imageKey: req.imageKey 
      });
    } catch (error) {
      console.error('Error in product image upload:', error);
      res.status(500).json({ error: 'Failed to process image upload' });
    }
  }
);

// Route to add product to vendor inventory
router.post('/', authMiddleware, addProductToInventory);

// Public route to fetch vendor products
router.get('/public/:vendorId', getPublicVendorProducts);

// Fetch all products in the vendor's inventory
router.get('/:vendorId', getVendorInventory);

// Update product details (price, stock) in the vendor's inventory
router.put('/:id', authMiddleware, updateVendorProduct);

// Change product status
router.patch('/:id/status', authMiddleware, changeProductStatus);

// Delete product from inventory
router.delete('/:id', authMiddleware, deleteVendorProduct);



module.exports = router;
