const Product = require('../models/Product');

// Fetch products by brand
const getProductsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const products = await Product.find({ brand });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products by brand' });
  }
};

// Product creation with S3 image handling
const createProduct = async (req, res) => {
  try {
    const { name, brand, category, description, amount } = req.body;

    // Get the S3 URLs from the uploaded files
    // multer-s3 adds the 'location' property to each file
    const images = req.files ? req.files.map(file => file.location) : [];

    const product = new Product({
      name,
      brand,
      category,
      description,
      amount: JSON.parse(amount),
      images
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    // Send more detailed error for debugging
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message,
      body: req.body 
    });
  }
};

const getProductsByFilters = async (req, res) => {
  try {
    const { brand, category } = req.query;
    const query = {};
    
    // Case-insensitive partial match for brand
    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }
    
    // Exact match for category
    if (category) {
      query.category = category;
    }

    // Only fetch from the products collection
    const products = await Product.find(query)
      .select('name brand category description images amount')
      .limit(10); // Limit results for better performance

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products by filters:', err);
    res.status(500).json({ error: 'Failed to fetch products by filters' });
  }
};

// Bulk add products with image URL handling
const addProductsInBulk = async (req, res) => {
  try {
    const products = req.body;
    // Validate that each product has valid image URLs if provided
    const validatedProducts = products.map(product => ({
      ...product,
      images: Array.isArray(product.images) ? product.images : []
    }));

    await Product.insertMany(validatedProducts);
    res.status(201).json({ message: 'Products added successfully!' });
  } catch (error) {
    console.error('Error adding products in bulk:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add error handling middleware for multer/S3 errors
const handleS3Error = (error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File size too large. Maximum size is 5MB.'
    });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Too many files or incorrect field name.'
    });
  }
  next(error);
};

module.exports = { 
  getProductsByBrand, 
  addProductsInBulk, 
  getProductsByFilters, 
  createProduct,
  handleS3Error 
};