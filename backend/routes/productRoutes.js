const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const sharp = require('sharp');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const { 
  getProductsByBrand, 
  addProductsInBulk, 
  getProductsByFilters, 
  createProduct,
  handleS3Error 
} = require('../controllers/productController');

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const processAndUpload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'products/' + uniqueSuffix + '.jpg'); // Always save as jpg
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      transform: function (req, file, cb) {
        // Process image before uploading
        const transformer = sharp()
          .resize({
            width: 800, // Max width
            height: 800, // Max height
            fit: 'inside', // Maintain aspect ratio
            withoutEnlargement: true // Don't enlarge smaller images
          })
          .jpeg({ 
            quality: 80, // Adjust quality
            progressive: true
          });
        
        cb(null, transformer);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image! Please upload an image.'), false);
      }
    }
  });

const router = express.Router();

// Route to fetch products by brand
router.get('/brand/:brand', getProductsByBrand);

// Route to fetch products by filters
router.get('/filters', getProductsByFilters);

// Route to create new product with image upload to S3
router.post('/', processAndUpload.array('images'), createProduct);

// Route for bulk product creation
router.post('/bulk', addProductsInBulk);

// In productRoutes.js, add this after your routes:
router.use(handleS3Error);

module.exports = router;