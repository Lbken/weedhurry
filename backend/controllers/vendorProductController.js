const VendorProduct = require('../models/VendorProduct');
const Product = require('../models/Product');

// Add a product to vendor's inventory
const addProductToInventory = async (req, res) => {
  const vendorId = req.vendorId;
  const { name, category, brand, description, amounts, variation } = req.body;

  // Validation - removed stock check
  if (!vendorId || !variation || !variation.price) {
    return res.status(400).json({ message: 'Name, vendor ID, variation, and price are required.' });
  }

  try {
    // Check for duplicate
    const existingProduct = await VendorProduct.findOne({
      vendorId,
      name,
      brand,
      'variation.strain': variation.strain,
      'variation.amount': variation.amount,
    });

    if (existingProduct) {
      return res.status(400).json({ 
        message: 'This product variation is already in your inventory.' 
      });
    }

    // Create and save the VendorProduct - removed stock
    const newVendorProduct = new VendorProduct({
      vendorId,
      name,
      category,
      brand,
      description,
      amounts,
      variation: {
        amount: variation.amount,
        strain: variation.strain,
        thcContent: variation.thcContent,
        price: variation.price,
        salePrice: variation.salePrice,
        image: variation.image,
        tags: variation.tags || [],
      }
    });

    await newVendorProduct.save();
    res.json({ message: 'Product added to vendor inventory successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product to inventory.' });
  }
};
  
  
  

const getVendorInventory = async (req, res) => {
  try {
      const { vendorId } = req.params;

      const inventory = await VendorProduct.find({ vendorId })
          .populate('productId', 'name brand category price description')
          .select('variation.image variation.price variation.salePrice variation.strain variation.thcContent variation.tags name brand category description status');

      // Log fetched inventory
      console.log('Fetched Inventory:', JSON.stringify(inventory, null, 2));

      res.status(200).json(inventory);
  } catch (error) {
      console.error('Error fetching vendor inventory:', error);
      res.status(500).json({ message: 'Failed to fetch inventory' });
  }
};






const updateVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { variation, status } = req.body;

    const updateObj = {};
    
    if (variation) {
      // Validate price and salePrice if they're being updated
      if (variation.price !== undefined && variation.price < 0) {
        return res.status(400).json({ message: 'Price must be non-negative' });
      }
      if (variation.salePrice !== undefined) {
        if (variation.salePrice < 0) {
          return res.status(400).json({ message: 'Sale price must be non-negative' });
        }
        if (variation.price && variation.salePrice >= variation.price) {
          return res.status(400).json({ message: 'Sale price must be less than the regular price' });
        }
      }

      // Update all variation fields
      Object.keys(variation).forEach(key => {
        updateObj[`variation.${key}`] = variation[key];
      });
    }

    // Handle status update if provided
    if (status !== undefined) {
      if (!['Active', 'Disabled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      updateObj.status = status;
    }

    const updatedProduct = await VendorProduct.findByIdAndUpdate(
      id,
      updateObj,
      { new: true }
    );        

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found in inventory' });
    }

    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

const changeProductStatus = async (req, res) => {
    try {
      const { id } = req.params; // VendorProduct ID
      const { status } = req.body; // New status
  
      // Validate status
      if (!['Active', 'Disabled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      const updatedProduct = await VendorProduct.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found in inventory' });
      }
  
      res.status(200).json({ message: 'Product status updated successfully', updatedProduct });
    } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({ message: 'Failed to update product status' });
    }
};

const deleteVendorProduct = async (req, res) => {
    try {
      const { id } = req.params; // VendorProduct ID
  
      const deletedProduct = await VendorProduct.findByIdAndDelete(id);
  
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found in inventory' });
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
};

const getPublicVendorProducts = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const vendorProducts = await VendorProduct.find({ 
      vendorId, 
      status: 'Active' 
    }).populate('productId', 'images'); // Add this to get product images

    if (!vendorProducts || vendorProducts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No products found for this vendor.' 
      });
    }

    const products = vendorProducts.map(vp => ({
      _id: vp._id,
      productId: vp.productId?._id,
      name: vp.name,
      brand: vp.brand,
      category: vp.category,
      strain: vp.variation?.strain || 'N/A',
      thcContent: vp.variation?.thcContent || null,
      price: vp.variation?.price || 0,
      salePrice: vp.variation?.salePrice || null,
      image: vp.variation?.image || vp.productId?.images?.[0] || "/placeholder-image.png",
      description: vp.description || vp.productId?.description || "",
      amount: vp.variation?.amount || 'N/A',
      vendorId: vp.vendorId,
      status: vp.status,
      tags: vp.variation?.tags || []
    }));

    // Add logging to debug
    console.log('Public vendor products:', products);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching public vendor products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching products.' 
    });
  }
};
  


module.exports = { addProductToInventory, getVendorInventory, updateVendorProduct, changeProductStatus, deleteVendorProduct, getPublicVendorProducts };
