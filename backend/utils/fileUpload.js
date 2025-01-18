const multer = require('multer');
const s3 = require('./s3'); // Import your configured S3 instance
const sharp = require('sharp');

// File size limit in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

// Configure multer for in-memory storage with file size restriction and file type validation
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE }, // Enforces size limit
    fileFilter: (req, file, cb) => {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
        }
        cb(null, true);
    },
});

// Utility function to upload a file to S3
const uploadToS3 = async (file, bucketName) => {
    const fileKey = `${Date.now()}-${file.originalname}`; // Unique key for the file
    const params = {
        Bucket: bucketName, // Specify the bucket dynamically
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    // Perform the upload
    const result = await s3.upload(params).promise();
    return {
        url: result.Location, // Public URL
        key: fileKey,         // S3 key
    };
};



const handleLogoUpload = async (req, res, next) => {
    upload.single('logo')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size exceeds the 2MB limit.' });
            }
            return res.status(500).json({ error: 'File upload failed.' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded.' });
            }

            // Specify the bucket name for logos
            const { url, key } = await uploadToS3(req.file, process.env.S3_LOGO_BUCKET_NAME); // Pass bucket name

            // Attach the S3 results to the request object
            req.logoUrl = url;
            req.logoKey = key;

            next(); // Pass control to the controller
        } catch (err) {
            console.error('Error during logo upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
    });
};

// fileUpload.js
const handleBulkProductImageUpload = async (req, res, next) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 2 * 1024 * 1024,
            files: 20,
            fieldSize: 25 * 1024 * 1024 // 25MB total payload
        },
        fileFilter: (req, file, cb) => {
            if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                return cb(new Error('Invalid file type'));
            }
            cb(null, true);
        }
    }).array('images', 20);

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: err.code === 'LIMIT_FILE_SIZE' ? 
                    'File size exceeds 2MB limit' : 
                    'Upload error: ' + err.message
            });
        }

        try {
            if (!req.files?.length) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const uploadPromises = req.files.map(async (file, index) => {
                try {
                    const compressedBuffer = await sharp(file.buffer)
                        .resize(800, 800, { fit: 'inside' })
                        .jpeg({ quality: 80 })
                        .toBuffer();

                    const result = await uploadToS3({
                        ...file,
                        buffer: compressedBuffer
                    }, process.env.S3_PRODUCT_BUCKET_NAME);

                    return { index, ...result };
                } catch (err) {
                    console.error(`Error processing image ${index}:`, err);
                    throw err;
                }
            });

            req.uploadedImages = await Promise.all(uploadPromises);
            next();
        } catch (err) {
            console.error('Bulk upload error:', err);
            res.status(500).json({ error: 'Failed to process images' });
        }
    });
};


// Middleware to handle promo uploads
const handlePromoUpload = async (req, res, next) => {
    upload.single('promoImage')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size exceeds the 2MB limit.' });
            }
            return res.status(500).json({ error: 'File upload failed.' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded.' });
            }

            // Use the S3_PROMO_BUCKET_NAME environment variable
            const { url, key } = await uploadToS3(req.file, process.env.S3_PROMO_BUCKET_NAME);

            // Attach the S3 results to the request object
            req.promoUrl = url;
            req.promoKey = key;

            next(); // Pass control to the controller
        } catch (err) {
            console.error('Error during promo upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
    });
};

const handleProductImageUpload = async (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File size exceeds the 2MB limit.' });
            }
            return res.status(500).json({ error: 'File upload failed.' });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded.' });
            }

            const { url, key } = await uploadToS3(req.file, process.env.S3_PRODUCT_BUCKET_NAME);

            // Attach the S3 results to the request object
            req.imageUrl = url;
            req.imageKey = key;

            next();
        } catch (err) {
            console.error('Error during product image upload:', err.message);
            return res.status(400).json({ error: err.message });
        }
    });
};

module.exports = { handleLogoUpload, handlePromoUpload, uploadToS3, handleProductImageUpload, handleBulkProductImageUpload };
