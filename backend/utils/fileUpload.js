const multer = require('multer');
const s3 = require('./s3'); // Import your configured S3 instance

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

module.exports = { handleLogoUpload, handlePromoUpload, uploadToS3, handleProductImageUpload };
